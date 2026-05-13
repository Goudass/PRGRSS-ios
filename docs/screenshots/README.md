# Zrzuty do README

Główny plik [`README.md`](../../README.md) w korzeniu repozytorium odwołuje się do PNG w **tym folderze**. Nazwy plików muszą być dokładnie takie:

| Plik | Ekran w aplikacji |
|------|-------------------|
| `01-pulpit.png` | Strona główna (pulpit) |
| `02-rozpocznij-trening.png` | Rozpocznij trening — wybór planu / szybki trening |
| `03-aktywny-trening.png` | Aktywny trening — karty ćwiczeń i serie |
| `04-dziennik.png` | Dziennik — historia treningów |
| `05-nowy-plan.png` | Nowy plan — formularz |
| `06-statystyki.png` | Statystyki — podsumowania i wykres |

## Jak dodać pliki

1. Zrób zrzuty z `npm run dev` (wąskie okno ~390 px) albo z **wdrożenia pod HTTPS**.  
2. Zapisz / zmień nazwy na powyższe i umieść w `docs/screenshots/`.  
3. Zcommituj PNG razem z README (rozmiar: sensowna kompresja, np. eksport ~0,5–1,5 MB na zrzut max).

Jeśli wolisz inne nazwy — zmień ścieżki w sekcji **„Zrzuty ekranu”** w głównym `README.md` tak, żeby wskazywały na Twoje pliki.

## Mniejsze pliki PNG (macOS)

Żeby **zmniejszyć rozmiar repozytorium** (nie tylko podgląd na GitHubie), z terminala w katalogu projektu:

```bash
cd ~/Desktop/prgrss/docs/screenshots
sips -Z 720 *.png
```

`-Z 720` skaluje tak, by **dłuższy bok** miał max 720 px (proporcje bez zmian). Możesz użyć np. `540` albo `900` według potrzeby.

W **README** głównym obrazki są **wyśrodkowane** (`<p align="center">`) i mają **`width="320"`** — zmień liczbę w `README.md`, jeśli chcesz większe / mniejsze. `sips` zmniejsza realny plik PNG.
