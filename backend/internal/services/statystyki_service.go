package services

import (
	"akademik/internal/models"
	"akademik/internal/repository"
)

type StatystykiService struct {
	repo *repository.StatystykiRepo
}

func NewStatystykiService(repo *repository.StatystykiRepo) *StatystykiService {
	return &StatystykiService{repo: repo}
}

func (s *StatystykiService) GetStats() (*models.AdminStats, error) {
	return s.repo.GetDashboardStats()
}
