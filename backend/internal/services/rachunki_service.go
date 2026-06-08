package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"akademik/internal/models"
	"akademik/internal/repository"

	"github.com/shopspring/decimal"
)

type RachunkiService interface {
	GetByUzytkownikID(ctx context.Context, uzytkownikID int) ([]models.Rachunek, error)
	GetAll(ctx context.Context) ([]models.Rachunek, error)
	UpdatePaidStatus(ctx context.Context, numer string, czyOplacone bool) error
	Create(ctx context.Context, zakwaterowanieID int, kwota decimal.Decimal, dataWystawienia, termin time.Time) (string, error)
	GenerateMonthly(ctx context.Context, year int, month int, dataWystawienia, termin time.Time) (int, error)
}

var ErrMonthAlreadyGenerated = errors.New("rachunki dla tego miesiąca zostały już wygenerowane")

type rachunkiService struct {
	repo           *repository.RachunkiRepo
	zakwaterowania *repository.ZakwaterowaniaRepo
}

func NewRachunkiService(repo *repository.RachunkiRepo) RachunkiService {
	return &rachunkiService{repo: repo}
}

func NewRachunkiServiceWithZakwaterowania(repo *repository.RachunkiRepo, zakwaterowania *repository.ZakwaterowaniaRepo) RachunkiService {
	return &rachunkiService{repo: repo, zakwaterowania: zakwaterowania}
}

func (s *rachunkiService) GetByUzytkownikID(ctx context.Context, uzytkownikID int) ([]models.Rachunek, error) {
	return s.repo.GetByUzytkownikID(ctx, uzytkownikID)
}

func (s *rachunkiService) GetAll(ctx context.Context) ([]models.Rachunek, error) {
	return s.repo.GetAll(ctx)
}

func (s *rachunkiService) UpdatePaidStatus(ctx context.Context, numer string, czyOplacone bool) error {
	rows, err := s.repo.SetPaidStatus(ctx, numer, czyOplacone)
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (s *rachunkiService) Create(ctx context.Context, zakwaterowanieID int, kwota decimal.Decimal, dataWystawienia, termin time.Time) (string, error) {
	rnd := rand.New(rand.NewSource(time.Now().UnixNano())).Intn(10000)
	numer := fmt.Sprintf("R-%s-%d", time.Now().Format("20060102-150405"), rnd)

	// Tablica z polskimi nazwami miesięcy (z dużej litery)
	polskieMiesiace := []string{
		"", "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
		"Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
	}

	// Generowanie opisu w formacie np. "Październik 2026"
	okres := fmt.Sprintf("%s %d", polskieMiesiace[termin.Month()], termin.Year())

	numerSaved, err := s.repo.Create(ctx, zakwaterowanieID, kwota, dataWystawienia, termin, numer, okres)
	if err != nil {
		return "", err
	}
	return numerSaved, nil
}

func (s *rachunkiService) GenerateMonthly(ctx context.Context, year int, month int, dataWystawienia, termin time.Time) (int, error) {
	if s.zakwaterowania == nil {
		return 0, errors.New("brak repozytorium zakwaterowań")
	}
	if month < 1 || month > 12 || year < 1 {
		return 0, errors.New("nieprawidłowy miesiąc lub rok")
	}

	if termin.IsZero() {
		termin = time.Date(year, time.Month(month), 10, 0, 0, 0, 0, time.UTC)
	}
	if dataWystawienia.IsZero() {
		dataWystawienia = time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	}

	polskieMiesiace := []string{"", "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"}
	okres := fmt.Sprintf("%s %d", polskieMiesiace[month], year)

	zakwaterowania, err := s.zakwaterowania.GetActiveForMonth(ctx, year, month)
	if err != nil {
		return 0, err
	}

	for _, z := range zakwaterowania {
		if _, err := s.repo.GetByZakwaterowanieAndOkres(ctx, z.ID, okres); err == nil {
			return 0, ErrMonthAlreadyGenerated
		}
	}

	created := 0
	for _, z := range zakwaterowania {
		standard := string(z.StandardPokoju)
		if standard == "" {
			standard = "Standard"
		}
		kwota, err := s.repo.GetRateByStandard(ctx, standard)
		if err != nil {
			return created, err
		}
		if kwota.IsZero() {
			return created, errors.New("brak stawki w cenniku dla standardu pokoju")
		}

		rnd := rand.New(rand.NewSource(time.Now().UnixNano() + int64(z.ID))).Intn(10000)
		numer := fmt.Sprintf("R-%s-%d", time.Now().Format("20060102-150405"), rnd)
		if _, err := s.repo.Create(ctx, z.ID, kwota, dataWystawienia, termin, numer, okres); err != nil {
			return created, err
		}
		created++
	}

	return created, nil
}
