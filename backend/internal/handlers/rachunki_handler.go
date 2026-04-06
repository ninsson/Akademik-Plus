package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"akademik/internal/services"
)

type RachunkiHandler struct {
	svc services.RachunkiService
}

func NewRachunkiHandler(svc services.RachunkiService) *RachunkiHandler {
	return &RachunkiHandler{svc: svc}
}

func (h *RachunkiHandler) GetByUzytkownikID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	rachunki, err := h.svc.GetByUzytkownikID(r.Context(), id)
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

	if err := h.svc.MarkAsPaid(r.Context(), numer); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			http.Error(w, "Rachunek not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to mark invoice as paid", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{"message": "Rachunek oznaczony jako opłacony"}); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
