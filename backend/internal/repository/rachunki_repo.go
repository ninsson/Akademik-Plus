package repository

import (
	"context"

	"akademik/internal/models"

	"github.com/jmoiron/sqlx"
)

type RachunkiRepo struct {
	db *sqlx.DB
}

func NewRachunkiRepo(db *sqlx.DB) *RachunkiRepo {
	return &RachunkiRepo{db: db}
}

func (r *RachunkiRepo) GetByUzytkownikID(ctx context.Context, uzytkownikID int) ([]models.Rachunek, error) {
	rachunki := []models.Rachunek{}
	query := "SELECT r.* FROM rachunki r JOIN uzytkownicy u ON r.uzytkownik_id = u.id WHERE u.id = $1"
	if err := r.db.SelectContext(ctx, &rachunki, query, uzytkownikID); err != nil {
		return nil, err
	}
	return rachunki, nil
}

func (r *RachunkiRepo) MarkAsPaid(ctx context.Context, numerRachunku string) (int64, error) {
	res, err := r.db.ExecContext(ctx, "UPDATE rachunki SET czy_oplacone = true WHERE numer_rachunku = $1", numerRachunku)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
