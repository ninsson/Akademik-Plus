package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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
	if err := json.NewEncoder(w).Encode(rachunki); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *RachunkiHandler) MarkAsPaid(w http.ResponseWriter, r *http.Request) {
	numer := r.PathValue("numer")
	if numer == "" {
		http.Error(w, "Missing invoice number", http.StatusBadRequest)
		return
	}

	rows, err := h.repo.MarkAsPaid(numer)
	if err != nil {
		http.Error(w, "Failed to mark invoice as paid", http.StatusInternalServerError)
		return
	}
	if rows == 0 {
		http.Error(w, "Rachunek not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Rachunek oznaczony jako opłacony"})
}
