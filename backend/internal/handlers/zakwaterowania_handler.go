package handlers

import (
	"akademik/internal/middleware"
	"akademik/internal/services"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
)

type ZakwaterowaniaHandler struct {
	svc *services.ZakwaterowaniaService
}

func NewZakwaterowaniaHandler(svc *services.ZakwaterowaniaService) *ZakwaterowaniaHandler {
	return &ZakwaterowaniaHandler{svc: svc}
}

func (h *ZakwaterowaniaHandler) GetMojeZakwaterowania(w http.ResponseWriter, r *http.Request) {
	userIDval := r.Context().Value(middleware.UserIDKey)
	if userIDval == nil {
		http.Error(w, "brak autoryzacji", http.StatusUnauthorized)
		return
	}

	userID, ok := userIDval.(int)
	if !ok {
		http.Error(w, "invalid user id type in context", http.StatusInternalServerError)
		return
	}

	zakwaterowanie, err := h.svc.GetCurrentAccommodation(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Zakwaterowania not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Zakwaterowania service error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(zakwaterowanie); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
