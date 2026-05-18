package services

import (
	"akademik/internal/models"
	"akademik/internal/repository"
)

type ZakwaterowaniaService struct {
	repo *repository.ZakwaterowaniaRepo
}

func NewZakwaterowaniaService(repo *repository.ZakwaterowaniaRepo) *ZakwaterowaniaService {
	return &ZakwaterowaniaService{repo: repo}
}

func (s *ZakwaterowaniaService) GetCurrentAccommodation(mieszkaniecID int) (*models.Zakwaterowanie, error) {
	return s.repo.GetCurrentByMieszkaniecID(mieszkaniecID)
}
