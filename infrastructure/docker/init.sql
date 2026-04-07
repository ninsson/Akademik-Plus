CREATE TABLE uzytkownicy
(
    id             SERIAL PRIMARY KEY,
    imie           TEXT        NOT NULL,
    nazwisko       TEXT        NOT NULL,
    email          TEXT UNIQUE NOT NULL,
    numer_telefonu TEXT UNIQUE NOT NULL,
    username       TEXT UNIQUE NOT NULL,
    password_hash  TEXT        NOT NULL,
    rola           TEXT        NOT NULL czy_wymaga_dostosowan BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE usterki
(
    id                       SERIAL PRIMARY KEY,
    zglaszajacy_id           INT       NOT NULL REFERENCES uzytkownicy (id),
    pokoj_id                 INT       NOT NULL,
    priorytet                TEXT      NOT NULL,
    status                   TEXT      NOT NULL,
    przypis_administrator_id INT REFERENCES uzytkownicy (id),
    opis_usterki             TEXT      NOT NULL,
    data_zgloszenia          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_aktualizacji        TIMESTAMP,
);

INSERT INTO uzytkownicy (imie, nazwisko, email, rola)
VALUES ('Jan', 'Kowalski', 'jan@akademik.pl', 'STUDENT');

INSERT INTO usterki (zglaszajacy_id, pokoj_id, opis_usterki, priorytet, status)
VALUES (1, 101, 'Kran przecieka', 'WYSOKI', 'Zgloszona');