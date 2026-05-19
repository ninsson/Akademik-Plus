package services

import (
	"context"
	"database/sql"
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
}

type rachunkiService struct {
	repo *repository.RachunkiRepo
}

func NewRachunkiService(repo *repository.RachunkiRepo) RachunkiService {
	return &rachunkiService{repo: repo}
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
