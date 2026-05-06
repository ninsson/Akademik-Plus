CREATE TABLE uzytkownicy
(
    id             SERIAL PRIMARY KEY,
    imie           TEXT        NOT NULL,
    nazwisko       TEXT        NOT NULL,
    email          TEXT UNIQUE NOT NULL,
    numer_telefonu TEXT UNIQUE NOT NULL,
    username       TEXT UNIQUE NOT NULL,
    password_hash  TEXT        NOT NULL,
    rola           TEXT        NOT NULL,
    czy_wymaga_dostosowan BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE usterki
(
    id                          SERIAL PRIMARY KEY,
    zglaszajacy_id              INT       NOT NULL REFERENCES uzytkownicy (id),
    pokoj_id                    INT       NOT NULL,
    priorytet                   TEXT      NOT NULL,
    status                      TEXT      NOT NULL,
    przypisany_administrator_id INT REFERENCES uzytkownicy (id),
    opis_usterki                TEXT      NOT NULL,
    data_zgloszenia             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_rozwiazania            TIMESTAMP
);

INSERT INTO uzytkownicy (imie, nazwisko, email, rola)
VALUES ('Jan', 'Kowalski', 'jan@akademik.pl', 'STUDENT');

INSERT INTO usterki (zglaszajacy_id, pokoj_id, opis_usterki, priorytet, status)
VALUES (1, 101, 'Kran przecieka', 'WYSOKI', 'Zgloszona');

--  akademiki.go

CREATE TABLE akademiki
(
    id  SERIAL PRIMARY KEY,
    adres TEXT NOT NULL,
    ilosc_pieter INT DEFAULT 4,
    czy_winda BOOLEAN NOT NULL DEFAULT TRUE,
    czy_dostosowany BOOLEAN NOT NULL DEFAULT TRUE
)

CREATE TYPE StatusPokoju AS ENUM ('Dostepny', 'W_remoncie')
CREATE TYPE StandardPokoju AS ENUM ('Standard', 'Podwyzszony')

CREATE TABLE pokoj
(
    id SERIAL PRIMARY KEY,
    numer_pokoju TEXT NOT NULL,
    ile_osob INT NOT NULL DEFAULT 2,
    czy_kuchnia BOOLEAN NOT NULL DEFAULT FALSE,
    czy_toaleta BOOLEAN NOT NULL DEFAULT TRUE,
    czy_dostosowany BOOLEAN NOT NULL DEFAULT FALSE,
    pietro INT NOT NULL,
    status_pokoju StatusPokoju NOT NULL DEFAULT 'Dostepny',
    standard StandardPokoju NOT NULL Default 'Standard',
    akademik_id INT NOT NULL REFERENCES akademiki(id)
)