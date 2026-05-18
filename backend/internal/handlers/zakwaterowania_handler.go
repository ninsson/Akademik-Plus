package handlers

import (
	"encoding/json"
	"net/http"
	"akademik/internal/services"
)

type ZakwaterowaniaHandler struct {
	svc *services.ZakwaterowaniaService
}

func NewZakwaterowaniaHandler(svc *services.ZakwaterowaniaService) *ZakwaterowaniaHandler {
	return &ZakwaterowaniaHandler{svc: svc}
}

func (h *ZakwaterowaniaHandler) GetMojeZakwaterowania(w http.ResponseWriter, r *http.Request) {
	userIDval := r.Context().Value("userID")
	if userIDval == nil {
		http.Error(w, "brak autoryzacji", http.StatusUnauthorized)
		return
	}

	var userID int
	switch v := userIDval.(type) {
	case float64:
		userID = int(v)
	case int:
		userID = v
	default:
		http.Error(w, "invalid user id", http.StatusUnauthorized)
		return
	}

	zakwaterowanie, err := h.svc.GetCurrentAccommodation(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(zakwaterowanie); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
