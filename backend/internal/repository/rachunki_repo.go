package repository

import (
	"akademik/internal/models"

	"github.com/jmoiron/sqlx"
)

type RachunkiRepo struct {
	db *sqlx.DB
}

func NewRachunkiRepo(db *sqlx.DB) *RachunkiRepo {
	return &RachunkiRepo{db: db}
}

func (r *RachunkiRepo) GetByUzytkownikID(uzytkownikID int) ([]models.Rachunek, error) {
	rachunki := []models.Rachunek{}
	query := "SELECT r.* FROM rachunki r JOIN uzytkownicy u ON r.uzytkownik_id = u.id WHERE u.id = $1"
	err := r.db.Select(&rachunki, query, uzytkownikID)
	return rachunki, err
}

func (r *RachunkiRepo) MarkAsPaid(numerRachunku string) (int64, error) {
	res, err := r.db.Exec("UPDATE rachunki SET czy_oplacone = true WHERE numer_rachunku = $1", numerRachunku)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
