package repository

import (
	"akademik/internal/models"

	"github.com/jmoiron/sqlx"
)

type AkademikiRepo struct {
	db *sqlx.DB
}

func NewAkademikiRepo(db *sqlx.DB) *AkademikiRepo {
	return &AkademikiRepo{db: db}
}

func (r *AkademikiRepo) GetAll() ([]models.Akademik, error) {
	akademiki := []models.Akademik{}
	err := r.db.Select(&akademiki, "SELECT * FROM akademiki")
	return akademiki, err
}

func (r *AkademikiRepo) GetByID(id int) (*models.Akademik, error) {
	var akademik models.Akademik
	err := r.db.Get(&akademik, "SELECT * FROM akademiki WHERE id = $1", id)
	return &akademik, err
}
