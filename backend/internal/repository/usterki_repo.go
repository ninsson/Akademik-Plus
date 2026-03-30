package repository

import (
	"akademik/internal/models"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type UsterkiRepo struct {
	db *sqlx.DB
}

func NewUsterkiRepo(db *sqlx.DB) *UsterkiRepo {
	return &UsterkiRepo{db: db}
}

func (r *UsterkiRepo) Create(u *models.Usterka) error {
	query := `
        INSERT INTO usterki (zglaszajacy_id, pokoj_id, opis_usterki, priorytet, status) 
        VALUES (:zglaszajacy_id, :pokoj_id, :opis_usterki, :priorytet, :status)
        RETURNING id`
	rows, err := r.db.NamedQuery(query, u)
	if err != nil {
		return err
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&u.ID)
		if err != nil {
			return err
		}
	} else {
		if err := rows.Err(); err != nil {
			return err
		}
		return fmt.Errorf("nie udało się utworzyć usterki")
	}
	return nil
}

func (r *UsterkiRepo) GetByPokojID(pokojID int) ([]models.Usterka, error) {
	usterki := []models.Usterka{}
	err := r.db.Select(&usterki, "SELECT * FROM usterki WHERE pokoj_id = $1", pokojID)
	return usterki, err
}

func (r *UsterkiRepo) UpdateStatus(id int, status models.StatusNaprawy) error {
	_, err := r.db.Exec("UPDATE usterki SET status = $1 WHERE id = $2", status, id)
	return err
}
