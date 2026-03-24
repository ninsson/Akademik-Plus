package models

import "time"

type PriorytetUsterki string

const (
	BardzoPilne  PriorytetUsterki = "Bardzo_pilne"
	Pilne        PriorytetUsterki = "Pilne"
	Normalny     PriorytetUsterki = "Normalny"
	MozePoczekac PriorytetUsterki = "Moze_poczekac"
)

type StatusNaprawy string

const (
	Przyjeto             StatusNaprawy = "Przyjeto"
	Weryfikacja          StatusNaprawy = "Weryfikacja"
	WTrakcieNaprawy      StatusNaprawy = "W_trakcie_naprawy"
	Naprawiono           StatusNaprawy = "Naprawiono"
	ZakonczonoBezNaprawy StatusNaprawy = "Zakonczono_bez_naprawy"
)

type Usterka struct {
	ID                        int               `db:"id" json:"id"`
	ZglaszajacyID             int               `db:"zglaszajacy_id" json:"zglaszajacy_id"`
	PokojID                   int               `db:"pokoj_id" json:"pokoj_id"`
	Priorytet                 *PriorytetUsterki `db:"priorytet" json:"priorytet"`
	Status                    StatusNaprawy     `db:"status" json:"status"`
	PrzypisanyAdministratorID *int              `db:"przypisany_administrator_id" json:"przypisany_administrator_id"`
	OpisUsterki               string            `db:"opis_usterki" json:"opis_usterki"`
	DataZgloszenia            time.Time         `db:"data_zgloszenia" json:"data_zgloszenia"`
	DataRozwiazania           *time.Time        `db:"data_rozwiazania" json:"data_rozwiazania"`
}

type Chat struct {
	ID                int       `db:"id" json:"id"`
	UsterkaID         int       `db:"id_usterki" json:"id_usterki"`
	AutorWiadomosciID int       `db:"autor_wiadomosci_id" json:"autor_wiadomosci_id"`
	Wiadomosc         string    `db:"wiadomosc" json:"wiadomosc"`
	DataWiadomosci    time.Time `db:"data_wiadomosci" json:"data_wiadomosci"`
}
