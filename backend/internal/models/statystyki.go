package models

type AdminStats struct {
	NieoplaconeRachunki int `json:"nieoplacone_rachunki"`
	OtwarteUsterki      int `json:"otwarte_usterki"`
	WszystkiePokoje     int `json:"wszystkie_pokoje"`
	ZajetePokoje        int `json:"zajete_pokoje"`
}
