package repository

import (
	"akademik/internal/models"
	"github.com/jmoiron/sqlx"
)

type KomentarzeRepo struct {
	db *sqlx.DB
}

func NewKomentarzeRepo(db *sqlx.DB) *KomentarzeRepo {
	return &KomentarzeRepo{db: db}
}

func (r *KomentarzeRepo) Create(k *models.KomentarzUsterki) error {
	query := `
		INSERT INTO komentarze_usterki (usterka_id, autor_id, tresc)
		VALUES (:usterka_id, :autor_id, :tresc)
		RETURNING id, data_dodania
`
	rows, err := r.db.NamedQuery(query, k)
	if err != nil {
		return err
	}
	defer rows.Close()
	if rows.Next() {
		err = rows.StructScan(k)
	}
	return err
}

func (r *KomentarzeRepo) GetByUsterkaID(usterkaID int) ([]models.KomentarzUsterki, error) {
	var komentarze []models.KomentarzUsterki
	query := `
		SELECT
			k.id, k.usterka_id, k.autor_id, k.tresc, k.data_dodania,
			CONCAT(u.imie, ' ', u.nazwisko) AS autor_nazwa,
		FROM komentarze_usterki k
		JOIN uzytkownicy u ON k.autor_id = u.id
		WHERE k.usterka_id = $1
		ORDER BY k.data_dodania ASC
`
	err := r.db.Select(&komentarze, query, usterkaID)
	return komentarze, err
}
