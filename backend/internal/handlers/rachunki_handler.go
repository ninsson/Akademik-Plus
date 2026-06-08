package handlers

import (
	"akademik/internal/middleware"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"akademik/internal/services"

	"github.com/shopspring/decimal"
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
		writeError(w, http.StatusBadRequest, "nieprawidlowe id uzytkownika")
		return
	}
	h.respondWithRachunki(w, r, id)
}

func (h *RachunkiHandler) GetMojeRachunki(w http.ResponseWriter, r *http.Request) {
	userIDval := r.Context().Value(middleware.UserIDKey)

	if userIDval == nil {
		writeError(w, http.StatusUnauthorized, "brak autoryzacji")
		return
	}

	var userID int
	switch v := userIDval.(type) {
	case float64:
		userID = int(v)
	case int:
		userID = v
	default:
		writeError(w, http.StatusBadRequest, "nieprawidlowe id uzytkownika")
		return
	}
	h.respondWithRachunki(w, r, userID)
}

func (h *RachunkiHandler) MarkAsPaid(w http.ResponseWriter, r *http.Request) {
	numer := r.PathValue("numer")
	if numer == "" {
		writeError(w, http.StatusBadRequest, "brak numeru rachunku")
		return
	}

	var payload struct {
		CzyOplacone *bool `json:"czy_oplacone"`
	}
	_ = json.NewDecoder(r.Body).Decode(&payload)

	status, err := h.resolvePaidStatus(r, payload.CzyOplacone)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.UpdatePaidStatus(r.Context(), numer, status); err != nil {
		if errors.Is(err, services.ErrNotFound) {
			writeError(w, http.StatusNotFound, "rachunek nie istnieje")
			return
		}
		writeError(w, http.StatusInternalServerError, "nie udalo sie zaktualizowac statusu rachunku")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":      "status rachunku zaktualizowany",
		"czy_oplacone": status,
	})
}

func (h *RachunkiHandler) respondWithRachunki(w http.ResponseWriter, r *http.Request, userID int) {
	rachunki, err := h.svc.GetByUzytkownikID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "nie udalo sie pobrac rachunkow")
		return
	}
	writeJSON(w, http.StatusOK, rachunki)
}

func (h *RachunkiHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	rachunki, err := h.svc.GetAll(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "nie udalo sie pobrac rachunkow")
		return
	}
	writeJSON(w, http.StatusOK, rachunki)
}

func (h *RachunkiHandler) resolvePaidStatus(r *http.Request, fromBody *bool) (bool, error) {
	if fromBody != nil {
		return *fromBody, nil
	}

	query := r.URL.Query().Get("czy_oplacone")
	if query == "" {
		return true, nil
	}
	if query == "true" {
		return true, nil
	}
	if query == "false" {
		return false, nil
	}
	return false, errors.New("nieprawidlowa wartosc czy_oplacone")
}

func (h *RachunkiHandler) Create(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		ZakwaterowanieID   int    `json:"zakwaterowanie_id"`
		Kwota              string `json:"kwota"`                      // wysyłamy jako string np. "123.45"
		DataWystawienia    string `json:"data_wystawienia,omitempty"` // YYYY-MM-DD
		TerminDoZaplacenia string `json:"termin_do_zaplacenia"`       // YYYY-MM-DD
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidłowy format JSON")
		return
	}

	if payload.ZakwaterowanieID == 0 || payload.Kwota == "" || payload.TerminDoZaplacenia == "" {
		writeError(w, http.StatusBadRequest, "brakuje wymaganych pól")
		return
	}

	kwotaDec, err := decimal.NewFromString(payload.Kwota)
	if err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidłowa kwota")
		return
	}

	dataW := time.Now()
	if payload.DataWystawienia != "" {
		t, err := time.Parse("2006-01-02", payload.DataWystawienia)
		if err != nil {
			writeError(w, http.StatusBadRequest, "nieprawidłowa data_wystawienia")
			return
		}
		dataW = t
	}

	termin, err := time.Parse("2006-01-02", payload.TerminDoZaplacenia)
	if err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidłowa termin_do_zaplacenia")
		return
	}

	numer, err := h.svc.Create(r.Context(), payload.ZakwaterowanieID, kwotaDec, dataW, termin)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "nie udało się utworzyć rachunku")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"numer_rachunku": numer})
}

func (h *RachunkiHandler) GenerateMonthly(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Year               int    `json:"year"`
		Month              int    `json:"month"`
		DataWystawienia    string `json:"data_wystawienia,omitempty"`
		TerminDoZaplacenia string `json:"termin_do_zaplacenia,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "nieprawidłowy format JSON")
		return
	}
	if payload.Year == 0 || payload.Month == 0 {
		writeError(w, http.StatusBadRequest, "brakuje wymaganych pól year i month")
		return
	}

	var dataW time.Time
	var termin time.Time
	var err error
	if payload.DataWystawienia != "" {
		dataW, err = time.Parse("2006-01-02", payload.DataWystawienia)
		if err != nil {
			writeError(w, http.StatusBadRequest, "nieprawidłowa data_wystawienia")
			return
		}
	}
	if payload.TerminDoZaplacenia != "" {
		termin, err = time.Parse("2006-01-02", payload.TerminDoZaplacenia)
		if err != nil {
			writeError(w, http.StatusBadRequest, "nieprawidłowa termin_do_zaplacenia")
			return
		}
	}

	created, err := h.svc.GenerateMonthly(r.Context(), payload.Year, payload.Month, dataW, termin)
	if err != nil {
		if errors.Is(err, services.ErrMonthAlreadyGenerated) {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "nie udało się wygenerować rachunków")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "rachunki wygenerowane",
		"created": created,
	})
}
