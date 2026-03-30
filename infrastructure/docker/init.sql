CREATE TABLE uzytkownicy
(
    id           SERIAL PRIMARY KEY,
    imie        TEXT NOT NULL,
    nazwisko    TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL
    rola        TEXT NOT NULL
);

CREATE TABLE usterki
(
    id             SERIAL PRIMARY KEY,
    zglaszajacy_id INT  NOT NULL REFERENCES uzytkownicy(id),
    pokoj_id       INT  NOT NULL,
    opis_usterki   TEXT NOT NULL,
    priorytet      TEXT NOT NULL,
    status         TEXT NOT NULL
);

INSERT INTO uzytkownicy (imie, nazwisko, email, rola)
VALUES ('Jan', 'Kowalski', 'jan@akademik.pl', 'STUDENT');

INSERT INTO usterki (zglaszajacy_id, pokoj_id, opis_usterki, priorytet, status)
VALUES (1, 101, 'Kran przecieka', 'WYSOKI', 'Zgloszona');