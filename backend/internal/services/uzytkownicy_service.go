package services

import (
	"errors"
	"strings"

	"akademik/internal/models"
	"akademik/internal/repository"
)

type UzytkownicyService struct {
	repo *repository.UzytkownicyRepo
}

func NewUzytkownicyService(repo *repository.UzytkownicyRepo) *UzytkownicyService {
	return &UzytkownicyService{repo: repo}
}

func (s *UzytkownicyService) CreateUser(u *models.Uzytkownik) error {
	if !strings.Contains(u.Email, "@") {
		return errors.New("invalid email")
	}
	if strings.TrimSpace(string(u.Rola)) == "" {
		u.Rola = "STUDENT"
	}

	existing, err := s.repo.GetByEmail(u.Email)
	if err == nil && existing != nil {
		return errors.New("email already in use")
	}

	return s.repo.Create(u)
}

func (s *UzytkownicyService) GetByID(id int) (*models.Uzytkownik, error) {
	return s.repo.GetByID(id)
}
