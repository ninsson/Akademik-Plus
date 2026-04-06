package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"akademik/internal/models"
	"akademik/internal/repository"
)

type RachunkiHandler struct {
	repo *repository.RachunkiRepo
}

func NewRachunkiHandler(repo *repository.RachunkiRepo) *RachunkiHandler {
	return &RachunkiHandler{repo: repo}
}

func (h *RachunkiHandler) GetByUzytkownikID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	rachunki, err := h.repo.GetByUzytkownikID(id)
    if err != nil {
        http.Error(w, "Failed to fetch rachunki", http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(rachunki)
}

func (h *RachunkiHandler) MarkAsPaid(w http.ResponseWriter, r *http.Request) {
	numer := r.PathValue("numer")
	if numer == "" {
		http.Error(w, "Missing invoice number", http.StatusBadRequest)
		return
	}

	if err := h.repo.MarkAsPaid(numer); err != nil {
		http.Error(w, "Failed to mark invoice as paid", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Rachunek oznaczony jako opłacony"}`))
}