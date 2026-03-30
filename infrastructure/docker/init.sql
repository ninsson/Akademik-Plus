CREATE TABLE usterki
(
    id             SERIAL PRIMARY KEY,
    zglaszajacy_id INT  NOT NULL,
    pokoj_id       INT  NOT NULL,
    opis_usterki   TEXT NOT NULL,
    priorytet      TEXT NOT NULL,
    status         TEXT NOT NULL
);

INSERT INTO usterki (zglaszajacy_id, pokoj_id, opis_usterki, priorytet, status)
VALUES (1, 101, 'Kran przecieka', 'WYSOKI', 'Zgloszona');