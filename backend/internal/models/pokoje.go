package models

type StatusPokoju string

const (
	Dostepny  StatusPokoju = "Dostepny"
	Wremoncie StatusPokoju = "W_remoncie"
)

type StandardPokoju string

const (
	Standard    StandardPokoju = "Standard"
	Podwyzszony StandardPokoju = "Podwyzszony"
)

type Pokoje struct {
	ID             int            `db:"id" json:"id"`
	NumerPokoju    string         `db:"numer_pokoju" json:"numer_pokoju"`
	IleOsob        int            `db:"ile_osob" json:"ile_osob"`
	CzyKuchnia     bool           `db:"czy_kuchnia" json:"czy_kuchnia"`
	CzyToaleta     bool           `db:"czy_toaleta" json:"czy_toaleta"`
	CzyDostosowany bool           `db:"czy_dostosowany" json:"czy_dostosowany"`
	Pietro         int            `db:"pietro" json:"pietro"`
	Status         StatusPokoju   `db:"status" json:"status"`
	Standard       StandardPokoju `db:"standard" json:"standard"`
	AkademikID     int            `db:"akademik_id" json:"akademik_id"`
}
