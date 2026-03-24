package models

type Rola string

const (
	Administrator Rola = "Administrator"
	Mieszkaniec   Rola = "Mieszkaniec"
)

type Uzytkownicy struct {
	ID                  int    `db:"id" json:"id"`
	Imie                string `db:"imie" json:"imie"`
	Nazwisko            string `db:"nazwisko" json:"nazwisko"`
	Email               string `db:"email" json:"email"`
	NumerTelefonu       string `db:"numer_telefonu" json:"numer_telefonu"`
	Username            string `db:"username" json:"username"`
	PasswordHash        string `db:"password_hash" json:"password_hash"`
	Rola                Rola   `db:"rola" json:"rola"`
	CzyWymagaDostosowan bool   `db:"czy_wymaga_dostosowan" json:"czy_wymaga_dostosowan"`
}
