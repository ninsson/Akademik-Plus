package handlers

import (
	"akademik/internal/models"
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

func (h *UsterkiHandler) Create(w http.ResponseWriter, r *http.Request) {
	var nowaUsterka models.Usterka

	err := json.NewDecoder(r.Body).Decode(&nowaUsterka)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if nowaUsterka.OpisUsterki == "" {
		http.Error(w, "Opis usterki is required", http.StatusBadRequest)
		return
	}

	err = h.repo.Create(&nowaUsterka)
	if err != nil {
		http.Error(w, "Failed to create usterka", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(nowaUsterka)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
