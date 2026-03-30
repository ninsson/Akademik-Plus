package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"akademik/internal/repository"
)

type UsterkiHandler struct {
	repo *repository.UsterkiRepo
}

func NewUsterkiHandler(repo *repository.UsterkiRepo) *UsterkiHandler {
	return &UsterkiHandler{repo: repo}
}

func (h *UsterkiHandler) GetByPokoj(w http.ResponseWriter, r *http.Request) {
	pokojIDStr := r.PathValue("id")
	pokojID, err := strconv.Atoi(pokojIDStr)
	if err != nil {
		http.Error(w, "Invalid pokoj ID", http.StatusBadRequest)
		return
	}

	usterki, err := h.repo.GetByPokojID(pokojID)
	if err != nil {
		http.Error(w, "Failed to fetch usterki", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(usterki); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
