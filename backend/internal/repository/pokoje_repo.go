package repository

import (
	"akademik/internal/models"

	"github.com/jmoiron/sqlx"
)

type PokojeRepo struct {
	db *sqlx.DB
}

func NewPokojeRepo(db *sqlx.DB) *PokojeRepo {
	return &PokojeRepo{db: db}
}

func (r *PokojeRepo) GetAll() ([]models.Pokoj, error) {
	pokoje := []models.Pokoj{}
	err := r.db.Select(&pokoje, "SELECT * FROM pokoje")
	return pokoje, err
}

func (r *PokojeRepo) Create(p *models.Pokoj) error {
	query := "INSERT INTO pokoje (numer_pokoju, ile_osob, czy_kuchnia, akademik_id) VALUES (:numer_pokoju, :ile_osob, :czy_kuchnia, :akademik_id)"
	_, err := r.db.NamedExec(query, p)
	return err
}

func (r *PokojeRepo) Delete(id int) error {
	_, err := r.db.Exec("DELETE FROM pokoje WHERE id = $1", id)
	return err
}
