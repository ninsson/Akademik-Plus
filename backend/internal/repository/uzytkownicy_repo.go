package repository

import (
	"akademik/internal/models"
	"fmt"
	"github.com/jmoiron/sqlx"
)

type UzytkownicyRepo struct {
	db *sqlx.DB
}

func NewUzytkownicyRepo(db *sqlx.DB) *UzytkownicyRepo {
	return &UzytkownicyRepo{db: db}
}

func (r *UzytkownicyRepo) Create(uzytkownik *models.Uzytkownik) error {
	query := `
		INSERT INTO uzytkownicy (imie, nazwisko, email, password_hash, rola) 
		VALUES (:imie, :nazwisko, :email, :password_hash, :rola)
		RETURNING id`
	rows, err := r.db.NamedQuery(query, uzytkownik)
	if err != nil {
		return err
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&uzytkownik.ID)
		if err != nil {
			return err
		}
	} else {
		if err := rows.Err(); err != nil {
			return err
		}
		return fmt.Errorf("nie udało się utworzyć użytkownika")
	}
	return nil
}

func (r *UzytkownicyRepo) GetByEmail(email string) (*models.Uzytkownik, error) {
	var uzytkownik models.Uzytkownik
	err := r.db.Get(&uzytkownik, "SELECT * FROM uzytkownicy WHERE email = $1", email)
	return &uzytkownik, err
}

func (r *UzytkownicyRepo) GetByID(id int) (*models.Uzytkownik, error) {
	var uzytkownik models.Uzytkownik
	err := r.db.Get(&uzytkownik, "SELECT * FROM uzytkownicy WHERE id = $1", id)
	return &uzytkownik, err
}
