package services

import (
	"context"
	"database/sql"

	"akademik/internal/models"
	"akademik/internal/repository"
)

type RachunkiService interface {
	GetByUzytkownikID(ctx context.Context, uzytkownikID int) ([]models.Rachunek, error)
	MarkAsPaid(ctx context.Context, numer string) error
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

func (s *rachunkiService) MarkAsPaid(ctx context.Context, numer string) error {
	rows, err := s.repo.MarkAsPaid(ctx, numer)
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}
