package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"akademik/internal/models"
	"akademik/internal/repository"
)

type PokojeHandler struct {
	repo *repository.PokojeRepo
}

func NewPokojeHandler(repo *repository.PokojeRepo) *PokojeHandler {
	return &PokojeHandler{repo: repo}
}

func (h *PokojeHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	pokoje, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, "Failed to fetch pokoje", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(pokoje); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *PokojeHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p models.Pokoj
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(p.NumerPokoju) == "" {
		http.Error(w, "numer_pokoju is required", http.StatusBadRequest)
		return
	}
	if p.IleOsob <= 0 {
		http.Error(w, "ile_osob must be > 0", http.StatusBadRequest)
		return
	}
	if p.AkademikID <= 0 {
		http.Error(w, "akademik_id is required", http.StatusBadRequest)
		return
	}

	id, err := h.repo.Create(&p)
	if err != nil {
		http.Error(w, "Failed to create pokoj", http.StatusInternalServerError)
		return
	}
	p.ID = id

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(p); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *PokojeHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid pokoj ID", http.StatusBadRequest)
		return
	}

	rows, err := h.repo.Delete(id)
	if err != nil {
		http.Error(w, "Failed to delete pokoj", http.StatusInternalServerError)
		return
	}
	if rows == 0 {
		http.Error(w, "Pokój not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Pokój usunięty"})
}
