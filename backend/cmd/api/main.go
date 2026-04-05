package main

import (
	"akademik/internal/handlers"
	"akademik/internal/repository"
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
	usterkiHandler := handlers.NewUsterkiHandler(usterkiRepo)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /usterki/pokoj/{id}", usterkiHandler.GetByPokoj)
	mux.HandleFunc("POST /usterki", usterkiHandler.Create)
	mux.HandleFunc("PATCH /usterki/{id}/status", usterkiHandler.UpdateStatus)

	uzytkownicyRepo := repository.NewUzytkownicyRepo(db)
	uzytkownicyHandler := handlers.NewUzytkownicyHandler(uzytkownicyRepo)

	mux.HandleFunc("GET /uzytkownicy/{id}", uzytkownicyHandler.GetByID)
	mux.HandleFunc("POST /uzytkownicy", uzytkownicyHandler.Create)

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
