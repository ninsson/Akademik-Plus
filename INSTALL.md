# Akademik-Plus — Instrukcja instalacji

1. Wymagania wstępne

- Docker & Docker Compose (opcjonalnie) — do automatycznego uruchomienia całego projektu.

2. Przygotowanie — plik `.env`
   Skopiuj plik `.env.example` do folderu `infrastructure/docker/` (lub ustaw zmienne środowiskowe). Następnie uzupełnij
   ten plik zgodnie z własnymi założeniami. Domyślnie wypełniony plik będzie działać, choć stanowczo zalecane jest
   wprowadzenie zmian w celu zabezpieczenia aplikacji.

3. Uruchomienie projektu
   Należy przejść do folderu `/infrastructure/docker/` gdzie znajduje się plik `docker-compose.yml` który automatycznie
   zbuduje aplikację.
   Otwórz folder projektu w terminalu.

```powershell
cd /infrastructure/docker
docker compose up -d --build
```

W przypadku potrzeby ręcznego zbudowania obrazów można to zrobić z pomocą komend:

```powershell
# Budowanie backendu
cd ../../ # Przejście do folderu projektu
cd backend
docker build -t akademik-api .
# Budowanie frontendu
cd ../
cd frontend
docker build -t akademik-frontend .
```

Uwaga! powyższy skrypt zakłada, że jego wykonanie rozpoczyna się w folderze `/infrastructure/docker`. Komendy te nie
zbudują bazy danych. Należy wprowadzić do pliku `.env` dane serwera baz danych w celu poprawnego działania aplikacji.

4. Opcjonalnie: sprawdzenie poprawności działania

Poniższymi komendami można sprawdzić logi aplikacji:

```powershell
docker compose ps
docker compose logs -f api
```

W celu sprawdzeniu frontendu należy wejść na stronę: http://localhost:5173

Backend można natomiast sprawdzić w następujący sposób:

```powershell
curl -I http://localhost:8000
```

5. Najczęstsze problemy i wskazówki

- Błąd połączenia z bazą: sprawdź, czy pola `DB_HOST/DB_PORT` w `.env` wskazują poprawny host i port serwera baz danych.
  Jeśli baza została uruchomiona z pomocą Docker Compose, `DB_HOST` domslnie powinno być ustawione na `postgres`.
- Brak JWT_SECRET: Należy sprawdzić czy pole `JWT_SECRET` w pliku `.env` wskazuje na poprawny klucz JWT.

