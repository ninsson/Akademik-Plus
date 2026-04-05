package handlers

import (
	"akademik/internal/models"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

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

	if nowaUsterka.ZglaszajacyID <= 0 {
		http.Error(w, "ZglaszajacyID must be a positive integer", http.StatusBadRequest)
		return
	}

	if nowaUsterka.PokojID <= 0 {
		http.Error(w, "PokojID must be a positive integer", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(nowaUsterka.OpisUsterki) == "" {
		http.Error(w, "Opis usterki cannot be empty", http.StatusBadRequest)
		return
	}
	if nowaUsterka.Priorytet == nil || strings.TrimSpace(string(*nowaUsterka.Priorytet)) == "" {
		http.Error(w, "Priorytet is required", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(string(nowaUsterka.Status)) == "" {
		http.Error(w, "Status is required", http.StatusBadRequest)
		return
	}

	err = h.repo.Create(&nowaUsterka)
	if err != nil {
		http.Error(w, "Failed to create usterka", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	err = json.NewEncoder(w).Encode(nowaUsterka)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *UsterkiHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid usterka ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Status string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	nowyStatus := models.StatusNaprawy(requestBody.Status)

	if !nowyStatus.IsValid() {
		http.Error(w, "Invalid usterka status", http.StatusBadRequest)
		return
	}

	err = h.repo.UpdateStatus(id, nowyStatus)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Failed to update usterka status", http.StatusInternalServerError)
			return
		}
		http.Error(w, "Failed to update usterka status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Usterka status updated successfully"}`))
}
