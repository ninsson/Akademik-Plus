package models

import (
	"time"
)

type Cennik struct {
	ID       int            `db:"id" json:"id"`
	Standard StandardPokoju `db:"standard" json:"standard"`
	Kwota    float64        `db:"kwota" json:"kwota"`
}

type Rachunek struct {
	NumerRachunku      string     `db:"numer_rachunku" json:"numer_rachunku"`
	ZakwaterowanieID   int        `db:"zakwaterowanie_id" json:"zakwaterowanie_id"`
	Kwota              float64    `db:"kwota" json:"kwota"`
	CzyOplacone        bool       `db:"czy_oplacone" json:"czy_oplacone"`
	DataWystawienia    time.Time  `db:"data_wystawienia" json:"data_wystawienia"`
	TerminDoZaplacenia time.Time  `db:"termin_do_zaplacenia" json:"termin_do_zaplacenia"`
	TerminPlatnosci    *time.Time `db:"termin_platnosci" json:"termin_platnosci"`
	OkresRozliczeniowy string     `db:"okres_rozliczeniowy" json:"okres_rozliczeniowy"`
	DodatkoweUwagi     *string    `db:"dodatkowe_uwagi" json:"dodatkowe_uwagi"`
}
