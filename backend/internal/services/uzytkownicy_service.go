package services

import (
	"database/sql"
	"errors"
	"strings"

	"akademik/internal/models"
	"akademik/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UzytkownicyService struct {
	repo *repository.UzytkownicyRepo
}

func NewUzytkownicyService(repo *repository.UzytkownicyRepo) *UzytkownicyService {
	return &UzytkownicyService{repo: repo}
}

func (s *UzytkownicyService) CreateUser(u *models.Uzytkownik, plainPassword string) error {
	if !strings.Contains(u.Email, "@") {
		return errors.New("invalid email")
	}
	if strings.TrimSpace(string(u.Rola)) == "" {
		u.Rola = models.Mieszkaniec
	}

	existing, err := s.repo.GetByEmail(u.Email)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
	} else if existing != nil {
		return errors.New("email already in use")
	}

	if len(plainPassword) < 6 {
		return errors.New("password must be at least 6 characters long")
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hashedBytes)

	return s.repo.Create(u)
}

func (s *UzytkownicyService) GetByID(id int) (*models.Uzytkownik, error) {
	return s.repo.GetByID(id)
}
