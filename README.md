# PRGRSS (iOS + web)

Aplikacja **Next.js** (eksport statyczny) z **Capacitor iOS**: plany treningów, dziennik sesji, statystyki. Dane trzymane lokalnie w przeglądarce / WebView (`localStorage`).

## Wymagania

- **Node.js 18+** i **npm**
- **Xcode** (+ Command Line Tools) — tylko jeśli chcesz budować aplikację na iPhone’a

## Szybki start — wersja web (development)

```bash
git clone https://github.com/Goudass/PRGRSS-ios.git
cd PRGRSS-ios
npm install
npm run dev
```

Otwórz w przeglądarce adres z terminala (zwykle **http://localhost:3000**).

> Projekt ma `output: "export"` — produkcyjnie buduje się folder **`out/`**. Komenda `npm run start` (Next server) **nie** jest przeznaczona do serwowania tego eksportu; do podglądu buildu otwórz pliki z `out/` przez statyczny serwer lub używaj iOS poniżej.

## Build statyczny (folder `out/`)

```bash
npm run build
```

Wynik trafia do **`out/`** (katalog jest w `.gitignore`).

## Aplikacja na iPhone (Xcode + Capacitor)

W repozytorium jest już folder **`ios/`**. Typowa praca:

```bash
npm install
npm run build && npm run ios:copy
```

Potem w Xcode: **Product → Clean Build Folder** (warto po większych zmianach), wybierz **App** i urządzenie, **Run (▶)**.

- **`npm run ios:copy`** — kopiuje `out/` → `ios/App/App/public` (szybkie, bez CocoaPods).
- **`npm run ios:sync`** — robi `next build` + **`npx cap sync ios`** (aktualizuje też zależności CocoaPods; pierwszy raz może trwać dłużej).
- **`npm run ios:open`** — otwiera workspace w Xcode.

### Pierwszy raz na nowym komputerze (Ruby / CocoaPods)

Jeśli Xcode zgłasza problem z **Pods**, w katalogu projektu:

```bash
export PATH="/opt/homebrew/opt/ruby/bin:/usr/local/opt/ruby/bin:$PATH"
npm run ios:bundler
```

Następnie w **`ios/App`**: `bundle exec pod install` albo ponów **`npm run ios:sync`**.

### Gdy nie masz jeszcze platformy iOS w projekcie

```bash
npm run ios:add
```

(skrypt z `package.json`: Bundler + build + `cap add ios` — używaj tylko gdy fakcznie brakuje `ios/`).

## Skrypty npm

| Skrypt | Opis |
|--------|------|
| `npm run dev` | Serwer deweloperski Next.js |
| `npm run build` | Eksport statyczny do `out/` |
| `npm run lint` | ESLint |
| `npm run ios:copy` | `npx cap copy ios` |
| `npm run ios:sync` | `next build` + `npx cap sync ios` |
| `npm run ios:open` | Otwiera projekt w Xcode |
| `npm run ios:bundler` | `bundle install` (gem-y w `vendor/bundle`) |
| `npm run ios:add` | Pierwsze dodanie iOS (Capacitor) |

## Tło

Domyślnie: **`public/bg/ambient.svg`** (lokalny plik, działa offline w WKWebView). Możesz dodać **`public/bg/ambient.jpg`** i w **`components/ambient-background.tsx`** ustawić `url(/bg/ambient.jpg)` zamiast SVG.

## Wypchnięcie zmian na GitHub

```bash
git status
git add -A
git commit -m "Krótki opis zmian"
git push origin main
```

Zdalne repozytorium: **https://github.com/Goudass/PRGRSS-ios** (sprawdź: `git remote -v`).

## Stack (skrót)

Next.js (App Router), TypeScript, Tailwind CSS, Zustand (persist), Framer Motion, Recharts, Radix UI, Lucide, Capacitor 7.
