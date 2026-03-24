package models

type PriorytetUsterki string

const (
	BardzoPilne  PriorytetUsterki = "Bardzo_pilne"
	Pilne        PriorytetUsterki = "Pilne"
	Normalny     PriorytetUsterki = "Normalny"
	MozePoczekac PriorytetUsterki = "Moze_poczekac"
)

type StatusNaprawy string

const (
	Przyjeto               StatusNaprawy = "Przyjeto"
	Weryfikacja            StatusNaprawy = "Weryfikacja"
	WTrakcieNaprawy        StatusNaprawy = "W_trakcie_naprawy"
	Naprawiono             StatusNaprawy = "Naprawiono"
	Zakonczono_bez_naprawy StatusNaprawy = "Zakonczono_bez_naprawy"
)
