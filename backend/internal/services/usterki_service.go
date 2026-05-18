package services

import (
	"akademik/internal/models"
	"akademik/internal/repository"
	"errors"
)

type UsterkiService struct {
	repo *repository.UsterkiRepo
}

func NewUsterkiService(repo *repository.UsterkiRepo) *UsterkiService {
	return &UsterkiService{repo: repo}
}

func (s *UsterkiService) CreateUsterka(u *models.Usterka) error {
	u.Status = models.Przyjeto
	if u.Priorytet == nil {
		return errors.New("priorytet zgłoszenia jest wymagany")
	}
	if !u.Priorytet.IsValid() {
		return errors.New("nieprawidłowy priorytet zgłoszenia")
	}
	if u.PokojID <= 0 {
		return errors.New("nieprawidłowy identyfikator pokoju")
	}

	return s.repo.Create(u)
}

func (s *UsterkiService) UpdateStatus(id int, status models.StatusNaprawy) error {
	if !status.IsValid() {
		return errors.New("invalid status")
	}
	return s.repo.UpdateStatus(id, status)
}

func (s *UsterkiService) GetByPokojID(id int) ([]models.Usterka, error) {
	return s.repo.GetByPokojID(id)
}
