package main

import (
	"akademik/internal/handlers"
	"akademik/internal/middleware"
	"akademik/internal/models"
	"akademik/internal/repository"
	"akademik/internal/services"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "require"
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname) // TODO: Change sslmode to "require" in production
	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v", err)
	}
	defer db.Close()

	maxAttempts := 10
	backoff := 1 * time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err = db.Ping()
		if err == nil {
			break
		}

		log.Printf("Database not ready (attempt %d/%d): %v", attempt, maxAttempts, err)
		time.Sleep(backoff)
		backoff *= 2
	}

	if err != nil {
		log.Fatalf("Failed to connect to database after %d attempts: %v", maxAttempts, err)
	}

	fmt.Println("Successfully connected to database")

	usterkiRepo := repository.NewUsterkiRepo(db)
	usterkiService := services.NewUsterkiService(usterkiRepo)
	usterkiHandler := handlers.NewUsterkiHandler(usterkiService)

	mux := http.NewServeMux()
	mux.Handle("GET /usterki/pokoj/{id}", middleware.JWTMiddleware(http.HandlerFunc(usterkiHandler.GetByPokoj)))
	mux.Handle("POST /usterki", middleware.JWTMiddleware(http.HandlerFunc(usterkiHandler.Create)))
	mux.Handle("PATCH /usterki/{id}/status", middleware.JWTMiddleware(middleware.RequireRole(models.Administrator)(http.HandlerFunc(usterkiHandler.UpdateStatus))))

	authService := services.NewAuthService(repository.NewUzytkownicyRepo(db))
	authHandler := handlers.NewAuthHandler(authService)

	mux.HandleFunc("POST /login", authHandler.Login)

	uzytkownicyRepo := repository.NewUzytkownicyRepo(db)
	uzytkownicyService := services.NewUzytkownicyService(uzytkownicyRepo)
	uzytkownicyHandler := handlers.NewUzytkownicyHandler(uzytkownicyService)

	mux.Handle("GET /uzytkownicy/{id}", middleware.JWTMiddleware(http.HandlerFunc(uzytkownicyHandler.GetByID)))
	mux.HandleFunc("POST /uzytkownicy", uzytkownicyHandler.Create)

	pokojeRepo := repository.NewPokojeRepo(db)
	pokojeService := services.NewPokojeService(pokojeRepo)
	pokojeHandler := handlers.NewPokojeHandler(pokojeService)

	mux.Handle("GET /pokoje", middleware.JWTMiddleware(http.HandlerFunc(pokojeHandler.GetAll)))
	mux.Handle("POST /pokoje", middleware.JWTMiddleware(middleware.RequireRole(models.Administrator)(http.HandlerFunc(pokojeHandler.Create))))

	rachunkiRepo := repository.NewRachunkiRepo(db)
	rachunkiService := services.NewRachunkiService(rachunkiRepo)
	rachunkiHandler := handlers.NewRachunkiHandler(rachunkiService)

	mux.Handle("GET /rachunki/uzytkownik/{id}", middleware.JWTMiddleware(http.HandlerFunc(rachunkiHandler.GetByUzytkownikID)))
	mux.Handle("PATCH /rachunki/{numer}/oplacone", middleware.JWTMiddleware(middleware.RequireRole(models.Administrator)(http.HandlerFunc(rachunkiHandler.MarkAsPaid))))

	srv := &http.Server{
		Addr:              ":8000",
		Handler:           mux,
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	fmt.Printf("Listening on %s\n", srv.Addr)

	err = srv.ListenAndServe()

	if err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
