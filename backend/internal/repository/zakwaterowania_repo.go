package repository

import (
	"akademik/internal/models"

	"github.com/jmoiron/sqlx"
)

type ZakwaterowaniaRepo struct {
	db *sqlx.DB
}

func NewZakwaterowaniaRepo(db *sqlx.DB) *ZakwaterowaniaRepo {
	return &ZakwaterowaniaRepo{db: db}
}

func (r *ZakwaterowaniaRepo) GetCurrentByMieszkaniecID(mieszkaniecID int) (*models.Zakwaterowanie, error) {
	var zakwaterowanie models.Zakwaterowanie
	query := `
		SELECT 
			z.id, 
			z.mieszkaniec_id, 
			z.pokoj_id, 
			z.poczatek_zakwaterowania, 
			z.koniec_zakwaterowania,
			p.numer_pokoju
		FROM zakwaterowania z
		JOIN pokoj p ON z.pokoj_id = p.id
		WHERE z.mieszkaniec_id = $1
		ORDER BY z.poczatek_zakwaterowania DESC
		LIMIT 1
	`

	err := r.db.Get(&zakwaterowanie, query, mieszkaniecID)
	if err != nil {
		return nil, err
	}
	return &zakwaterowanie, nil
}
