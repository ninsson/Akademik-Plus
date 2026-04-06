package repository

import (
	"errors"

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

func (r *PokojeRepo) Create(p *models.Pokoj) (int, error) {
	query := `INSERT INTO pokoje (numer_pokoju, ile_osob, czy_kuchnia, akademik_id)
			  VALUES (:numer_pokoju, :ile_osob, :czy_kuchnia, :akademik_id) RETURNING id`
	rows, err := r.db.NamedQuery(query, p)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	if rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return 0, err
		}
		return id, nil
	}
	if err := rows.Err(); err != nil {
		return 0, err
	}
	return 0, errors.New("no id returned")
}

func (r *PokojeRepo) Delete(id int) (int64, error) {
	res, err := r.db.Exec("DELETE FROM pokoje WHERE id = $1", id)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
