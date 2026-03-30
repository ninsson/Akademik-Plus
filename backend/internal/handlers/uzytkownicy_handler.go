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
