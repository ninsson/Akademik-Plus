package services

import (
	"akademik/internal/models"
	"akademik/internal/repository"
)

type KomentarzeService struct {
	repo *repository.KomentarzeRepo
}

func NewKomentarzeService(repo *repository.KomentarzeRepo) *KomentarzeService {
	return &KomentarzeService{repo: repo}
}

func (s *KomentarzeService) CreateKomentarz(k *models.KomentarzUsterki) error {
	return s.repo.Create(k)
}

func (s *KomentarzeService) GetCzatUsterki(usterkaID int) ([]models.KomentarzUsterki, error) {
	return s.repo.GetByUsterkaID(usterkaID)
}
