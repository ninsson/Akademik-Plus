# Akademik-Plus

System zarządzania akademikiem — narzędzie wspierające administrację w przydzielaniu pokoi, prowadzeniu ewidencji
mieszkańców, rozliczaniu opłat oraz obsłudze zgłoszeń usterek.

Główne cele projektu:

- Zarządzanie pokojami i miejscami (liczba miejsc, wyposażenie, status dostępności).
- Rejestracja mieszkańców i historia zakwaterowań.
- Naliczanie miesięcznych opłat za zakwaterowanie (różne stawki w zależności od standardu pokoju).
- Kontrola płatności i obsługa zaległości.
- Zgłaszanie usterek i komunikacja mieszkańców z administracją.
- Role użytkowników: student (mieszkaniec) i administracja (administrator), z różnymi uprawnieniami.

Spis treści

- Funkcje
- Architektura
- Szybki start
- Uruchamianie w trybie developerskim
- Uruchamianie przez Docker
- Kontrybucja i kontakt
- Licencja

Funkcje

- Panel administracyjny: zestawienia wolnych miejsc, raporty obłożenia, statystyki.
- Panel mieszkańca: zgłaszanie usterek, przegląd historii opłat i zamieszkania.
- Mechanizmy autoryzacji i ról (JWT).
- API REST dla operacji CRUD na pokojach, użytkownikach, usterkach, rachunkach i zakwaterowaniach.

Architektura

- Backend: Go
    - Serwer HTTP nasłuchuje na porcie `8000` (domyślnie).
    - Połączenie z PostgreSQL.
- Frontend: React + Vite. Domyślny port to `5173`.
- Baza danych: PostgreSQL (pliki inicjalizujące znajdują się w `infrastructure/docker/init.sql`).
- Docker: Pliki `Dockerfile` dla backendu i frontendu oraz `infrastructure/docker/docker-compose.yml`.

Szybki start
Zobacz szczegółową instrukcję instalacji i uruchomienia w `INSTALL.md` w katalogu głównym repozytorium:

- `INSTALL.md` — krok po kroku: wymagania, konfiguracja `.env`, uruchomienie bazy, backendu i frontendu oraz sposób
  uruchomienia za pomocą Docker Compose.

Wprowadzanie zmian dop rojektu

- Zgłaszaj pull requesty i issue w repozytorium.
- Przed wysłaniem PR upewnij się, że zmiany są przetestowane lokalnie.

Kontakt

- W razie pytań zostaw issue w repo.

Licencja

- Projekt zawiera plik `LICENSE` w katalogu głównym.
