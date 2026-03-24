package models

type Cennik struct {
	ID       int            `db:"id" json:"id"`
	Standard StandardPokoju `db:"standard" json:"standard"`
	Kwota    float64        `db:"kwota" json:"kwota"`
}
