package services

import (
	"akademik/internal/models"
	"akademik/internal/repository"
	"context"
	"database/sql"
)

var ErrNotFound = sql.ErrNoRows

type PokojeService interface {
	GetAll(ctx context.Context) ([]models.Pokoj, error)
	Create(ctx context.Context, p *models.Pokoj) (int, error)
	Delete(ctx context.Context, id int) error
}

type pokojeService struct {
	repo *repository.PokojeRepo
}

func NewPokojeService(repo *repository.PokojeRepo) PokojeService {
	return &pokojeService{repo: repo}
}

func (s *pokojeService) GetAll(ctx context.Context) ([]models.Pokoj, error) {
	return s.repo.GetAll()
}

func (s *pokojeService) Create(ctx context.Context, p *models.Pokoj) (int, error) {
	return s.repo.Create(p)
}

func (s *pokojeService) Delete(ctx context.Context, id int) error {
	rows, err := s.repo.Delete(id)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}
