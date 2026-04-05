package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"akademik/internal/models"
	"akademik/internal/repository"
)

type UzytkownicyHandler struct {
	repo *repository.UzytkownicyRepo
}

func NewUzytkownicyHandler(repo *repository.UzytkownicyRepo) *UzytkownicyHandler {
	return &UzytkownicyHandler{repo: repo}
}

func (h *UzytkownicyHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Incorrect user ID", http.StatusBadRequest)
		return
	}

	uzytkownik, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "User not find", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(uzytkownik)
}

func (h *UzytkownicyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var nowy models.Uzytkownik
	if err := json.NewDecoder(r.Body).Decode(&nowy); err != nil {
		http.Error(w, "Wrong data format", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&nowy); err != nil {
		http.Error(w, "Error during user save", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(nowy)
}
