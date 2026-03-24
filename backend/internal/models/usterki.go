package models

type PiorytetUsterki string

const (
	BardzoPilne  PiorytetUsterki = "Bardzo_pilne"
	Pilne        PiorytetUsterki = "Pilne"
	Normalny     PiorytetUsterki = "Normalny"
	MozePoczekac PiorytetUsterki = "Moze_poczekac"
)

type StatusNaprawy string

const (
	Przyjeto               StatusNaprawy = "Przyjeto"
	Weryfikacja            StatusNaprawy = "Weryfikacja"
	WTrakcieNaprawy        StatusNaprawy = "W_trakcie_naprawy"
	Naprawiono             StatusNaprawy = "Naprawiono"
	Zakonczono_bez_naprawy StatusNaprawy = "Zakonczono_bez_naprawy"
)
