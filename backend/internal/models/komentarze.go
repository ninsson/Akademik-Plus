package models

import "time"

type KomentarzUsterki struct {
	ID          int       `db:"id" json:"id"`
	UsterkaID   int       `db:"usterka_id" json:"usterka_id"`
	AutorID     int       `db:"autor_id" json:"autor_id"`
	Tresc       string    `db:"tresc" json:"tresc"`
	DataDodania time.Time `db:"data_dodania" json:"data_dodania"`

	AutorImieNazwisko string `db:"autor_nazwa" json:"autor_nazwa"`
	AutorRola         string `db:"autor_rola" json:"autor_rola"`
}
