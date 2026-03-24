package models

type StatusPokoju string

const (
	Dostepny  StatusPokoju = "Dostepny"
	WRemoncie StatusPokoju = "W_remoncie"
)

type StandardPokoju string

const (
	Standard    StandardPokoju = "Standard"
	Podwyzszony StandardPokoju = "Podwyzszony"
)

type Pokoj struct {
	ID             int            `db:"id" json:"id"`
	NumerPokoju    string         `db:"numer_pokoju" json:"numer_pokoju"`
	IleOsob        int            `db:"ile_osob" json:"ile_osob"`
	CzyKuchnia     bool           `db:"czy_kuchnia" json:"czy_kuchnia"`
	CzyToaleta     bool           `db:"czy_toaleta" json:"czy_toaleta"`
	CzyDostosowany bool           `db:"czy_dostosowany" json:"czy_dostosowany"`
	Pietro         int            `db:"pietro" json:"pietro"`
	Status         StatusPokoju   `db:"status_pokoju" json:"status_pokoju"`
	Standard       StandardPokoju `db:"standard" json:"standard"`
	AkademikID     int            `db:"akademik_id" json:"akademik_id"`
}

type Akademik struct {
	ID             int    `db:"id" json:"id"`
	Adres          string `db:"adres" json:"adres"`
	IloscPieter    int    `db:"ilosc_pieter" json:"ilosc_pieter"`
	CzyWinda       bool   `db:"czy_winda" json:"czy_winda"`
	CzyDostosowany bool   `db:"czy_dostosowany" json:"czy_dostosowany"`
}
