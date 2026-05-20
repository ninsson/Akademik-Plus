package handlers

import (
	"akademik/internal/middleware"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"akademik/internal/models"
	"akademik/internal/services"

	"github.com/lib/pq"
)

type UzytkownicyHandler struct {
	service *services.UzytkownicyService
}

func NewUzytkownicyHandler(service *services.UzytkownicyService) *UzytkownicyHandler {
	return &UzytkownicyHandler{service: service}
}

func (h *UzytkownicyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Incorrect user ID", http.StatusBadRequest)
		return
	}

	uzytkownik, err := h.service.GetByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Error during user retrieval", http.StatusInternalServerError)
		return
	}

	response, err := json.Marshal(uzytkownik)
	if err != nil {
		http.Error(w, "Error during response serialization", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(response); err != nil {
		http.Error(w, "Error during response write", http.StatusInternalServerError)
		return
	}
}

func (h *UzytkownicyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		models.Uzytkownik
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	nowy := &payload.Uzytkownik

	err := h.service.CreateUser(nowy, payload.Password)

	if err != nil {
		switch err.Error() {
		case "name is required":
			http.Error(w, "Name is required", http.StatusBadRequest)
			return
		case "invalid email":
			http.Error(w, "Invalid email format", http.StatusBadRequest)
			return
		case "phone is required":
			http.Error(w, "Phone number is required", http.StatusBadRequest)
			return
		case "username is required":
			http.Error(w, "Username is required", http.StatusBadRequest)
			return
		case "invalid role":
			http.Error(w, "Invalid role", http.StatusBadRequest)
			return
		case "email already in use":
			http.Error(w, "Email already in use", http.StatusConflict)
			return
		case "password must be at least 6 characters long":
			http.Error(w, "Password must be at least 6 characters long", http.StatusBadRequest)
			return
		default:
			var pqErr *pq.Error
			if errors.As(err, &pqErr) && pqErr.Code == "23505" {
				http.Error(w, "Email, telefon lub username już istnieje", http.StatusConflict)
				return
			}
			http.Error(w, "Error during user creation", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(nowy)
}

func (h *UzytkownicyHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Stare         string `json:"stare_haslo"`
		Nowe          string `json:"nowe_haslo"`
		Potwierdzenie string `json:"potwierdzenie"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidlowe dane")
		return
	}
	if payload.Nowe != payload.Potwierdzenie {
		writeError(w, http.StatusBadRequest, "hasła nie są zgodne")
		return
	}

	userIDval := r.Context().Value(middleware.UserIDKey)
	if userIDval == nil {
		writeError(w, http.StatusUnauthorized, "brak autoryzacji")
		return
	}
	var userID int
	switch v := userIDval.(type) {
	case float64:
		userID = int(v)
	case int:
		userID = v
	default:
		writeError(w, http.StatusBadRequest, "nieprawidlowe id uzytkownika")
		return
	}

	err := h.service.ChangeOwnPassword(r.Context(), userID, payload.Stare, payload.Nowe)
	if err != nil {
		switch err.Error() {
		case "invalid old password":
			writeError(w, http.StatusUnauthorized, "nieprawidlowe stare haslo")
			return
		case "password must be at least 6 characters long":
			writeError(w, http.StatusBadRequest, "hasło musi mieć co najmniej 6 znaków")
			return
		default:
			if errors.Is(err, sql.ErrNoRows) {
				writeError(w, http.StatusNotFound, "uzytkownik nie istnieje")
				return
			}
			writeError(w, http.StatusInternalServerError, "nie udało się zmienić hasła")
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "hasło zmienione"})
}

func (h *UzytkownicyHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	uzytkownicy, err := h.service.GetAll(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "nie udalo sie pobrac uzytkownikow")
		return
	}
	writeJSON(w, http.StatusOK, uzytkownicy)
}

func (h *UzytkownicyHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidlowe id uzytkownika")
		return
	}

	var payload struct {
		Rola string `json:"rola"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidlowe dane wejsciowe")
		return
	}

	rola := models.Rola(strings.TrimSpace(payload.Rola))
	if err := h.service.UpdateRole(r.Context(), id, rola); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "uzytkownik nie istnieje")
			return
		}
		if err.Error() == "invalid role" {
			writeError(w, http.StatusBadRequest, "nieprawidlowa rola")
			return
		}
		writeError(w, http.StatusInternalServerError, "nie udalo sie zaktualizowac roli")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "rola zaktualizowana"})
}

func (h *UzytkownicyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidlowe id uzytkownika")
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "uzytkownik nie istnieje")
			return
		}
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23503" {
			writeError(w, http.StatusConflict, "nie mozna usunac uzytkownika z aktywnymi powiazaniami")
			return
		}
		writeError(w, http.StatusInternalServerError, "nie udalo sie usunac uzytkownika")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "uzytkownik usuniety"})
}

func (h *UzytkownicyHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidlowe dane")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Jeśli konto z podanym adresem istnieje, otrzymasz instrukcję na e-mail.",
	})
}
