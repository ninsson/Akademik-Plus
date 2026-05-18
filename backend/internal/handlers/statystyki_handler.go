package handlers

import (
	"akademik/internal/services"
	"encoding/json"
	"net/http"
)

type StatystykiHandler struct {
	svc *services.StatystykiService
}

func NewStatystykiHandler(svc *services.StatystykiService) *StatystykiHandler {
	return &StatystykiHandler{svc: svc}
}

func (h *StatystykiHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.svc.GetStats()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(stats); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
