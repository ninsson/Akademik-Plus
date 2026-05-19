package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"akademik/internal/middleware"
	"akademik/internal/models"
	"akademik/internal/services"
)

type KomentarzeHandler struct {
	svc *services.KomentarzeService
}

func NewKomentarzeHandler(svc *services.KomentarzeService) *KomentarzeHandler {
	return &KomentarzeHandler{svc: svc}
}

func (h *KomentarzeHandler) GetKomentarze(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	usterkaID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	komentarze, err := h.svc.GetCzatUsterki(usterkaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(komentarze)
}

func (h *KomentarzeHandler) AddKomentarz(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	usterkaID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	userIDval := r.Context().Value(middleware.UserIDKey)
	autorID, ok := userIDval.(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var input struct {
		Tresc string `json:"tresc"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil || input.Tresc == "" {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	komentarz := &models.KomentarzUsterki{
		UsterkaID: usterkaID,
		AutorID:   autorID,
		Tresc:     input.Tresc,
	}

	if err := h.svc.CreateKomentarz(komentarz); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(komentarz)
}
