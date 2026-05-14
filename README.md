<div align="center">

# PRGRSS

**Dziennik treningowy siłowego — web i iOS z jednego kodu**

Next.js (static export) · Capacitor · dane wyłącznie po stronie klienta

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-23272f?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=black)](https://tailwindcss.com/)

<br />

[![Repo](https://img.shields.io/badge/GitHub-PRGRSS--ios-181717?style=flat-square&logo=github)](https://github.com/Goudass/PRGRSS-ios)
[![Zustand](https://img.shields.io/badge/Zustand-persist-433f78?style=flat-square)](https://github.com/pmndrs/zustand)

</div>

<br />

## Spis treści

- [Przegląd](#przegląd)
- [Najważniejsze funkcje](#najważniejsze-funkcje)
- [Architektura](#architektura)
- [Stack](#stack)
- [Wymagania](#wymagania)
- [Szybki start (web)](#szybki-start-web)
- [Build produkcyjny](#build-produkcyjny)
- [iOS (Xcode)](#ios-xcode)
- [Skrypty npm](#skrypty-npm)
- [Personalizacja UI](#personalizacja-ui)
- [Dlaczego ten projekt (portfolio)](#dlaczego-ten-projekt-portfolio)

<br />

## Przegląd

**PRGRSS** to aplikacja do planowania treningów, prowadzenia sesji w czasie rzeczywistym, przeglądania historii oraz śledzenia postępów (m.in. wykresy). Interfejs jest zoptymalizowany pod **telefon**; ta sama baza kodu działa w **przeglądarce** i w **aplikacji iOS** zbudowanej przez **Capacitor** (WKWebView).

Dane zapisujesz **lokalnie** (`localStorage`) — bez konta, bez własnego backendu, z pełną kontrolą nad prywatnością na urządzeniu.

<br />

## Najważniejsze funkcje

| | |
| :--- | :--- |
| **Plany** | Szablony treningów, start sesji z planu |
| **Aktywna sesja** | Serie, ćwiczenia, zapis i przejście do dziennika |
| **Dziennik** | Historia, filtry, szczegóły pojedynczej sesji |
| **Statystyki** | Wykresy m.in. objętości w czasie |
| **Kalendarz** | Podgląd aktywności w czasie |
| **Warstwa „native feel”** | Safe area, status bar (plugin), lekka haptika przy kluczowych akcjach |

<br />

## Architektura

```
┌─────────────────────────────────────────────────────────┐
│  Next.js (App Router) + React + TypeScript              │
│  UI: Tailwind · Radix · Recharts · Framer Motion         │
│  Stan: Zustand + persist → localStorage                  │
└──────────────────────────┬──────────────────────────────┘
                           │ npm run build → out/
           ┌───────────────┴───────────────┐
           ▼                               ▼
   Przeglądarka / hosting statyczny   Capacitor iOS (WKWebView)
```

- **Eksport statyczny** (`output: "export"`) — artefakt w **`out/`**, ten sam katalog jest kopiowany do projektu Xcode.
- **Capacitor** — most do API systemu (status bar, haptics), bez duplikowania logiki biznesowej w Swift.

<br />

## Stack

| Obszar | Technologie |
| :--- | :--- |
| Framework | **Next.js 15** (App Router), **React 19** |
| Język | **TypeScript** |
| Styl | **Tailwind CSS**, komponenty **Radix UI** |
| Stan | **Zustand** + middleware persist |
| Wykresy / ruch | **Recharts**, **Framer Motion** |
| Ikony | **Lucide React** |
| Mobile shell | **Capacitor 7** (`@capacitor/ios`, status bar, haptics) |

<br />

## Wymagania

| Środowisko | Kiedy potrzebne |
| :--- | :--- |
| **Node.js 18+** i **npm** | Zawsze — front, lint, build |
| **Xcode** + Command Line Tools | Tylko do budowania / uruchamiania na **iPhone** lub symulatorze |

<br />

## Szybki start (web)

```bash
git clone https://github.com/Goudass/PRGRSS-ios.git
cd PRGRSS-ios
npm install
npm run dev
```

Otwórz **http://localhost:3000** w przeglądarce.

> **Uwaga:** projekt jest ustawiony na **statyczny eksport**. Produkcja to katalog **`out/`** — `npm run start` (serwer Next) **nie** jest docelowym sposobem serwowania tego buildu. Do podglądu produkcji użyj serwera plików statycznych albo ścieżki iOS poniżej.

<br />

## Build produkcyjny

```bash
npm run build
```

Wynik trafia do **`out/`** (katalog jest w `.gitignore`).

<br />

## iOS (Xcode)

W repozytorium jest już **`ios/`**. Typowy przepływ:

1. Zainstaluj zależności i zbuduj front, potem skopiuj go do aplikacji natywnej:

   ```bash
   npm install
   npm run build && npm run ios:copy
   ```

2. Otwórz projekt w Xcode (`npm run ios:open`) albo ręcznie workspace w `ios/`.
3. Po większych zmianach frontu: **Product → Clean Build Folder**, wybierz schemat i urządzenie, **Run (▶)**.

### CocoaPods — pierwsza konfiguracja

Jeśli Xcode zgłasza problem z **Pods**:

```bash
export PATH="/opt/homebrew/opt/ruby/bin:/usr/local/opt/ruby/bin:$PATH"
npm run ios:bundler
```

Następnie w **`ios/App`**: `bundle exec pod install` albo ponów **`npm run ios:sync`**.

<br />

## Skrypty npm

### Web

| Skrypt | Opis |
| :--- | :--- |
| `npm run dev` | Serwer deweloperski Next.js |
| `npm run build` | Eksport statyczny do `out/` |
| `npm run lint` | ESLint |

### iOS

| Skrypt | Opis |
| :--- | :--- |
| `npm run ios:copy` | Szybka kopia web → iOS (`cap copy`), bez odtwarzania Pods |
| `npm run ios:sync` | `next build` + `cap sync ios` (pełna synchronizacja + Pods) |
| `npm run ios:open` | Otwiera projekt w Xcode |
| `npm run ios:bundler` | `bundle install` (gemy do `vendor/bundle`) |
| `npm run ios:add` | Dodanie platformy iOS (Capacitor) — tylko gdy faktycznie brakuje `ios/` |

<br />

## Personalizacja UI

- Domyślne tło: **`public/bg/ambient.svg`** (lokalny asset, działa offline w WKWebView).
- Aby użyć bitmapy: dodaj **`public/bg/ambient.jpg`** i w **`components/ambient-background.tsx`** ustaw `url(/bg/ambient.jpg)` zamiast SVG.

<br />

## Dlaczego ten projekt (portfolio)

Krótko: pokazuje **świadomy kompromis web vs native** — jeden kod, przewidywalny build, integracja z systemem tam, gdzie ma to sens (status bar, haptics, safe area), bez udawania pełnoprawnego klienta SwiftUI.

- **Jeden pipeline** — `out/` dla hostingu statycznego i dla Capacitora.
- **Local-first** — prosty model bez serwera; dane zostają na urządzeniu.
- **UX pod mobile** — spójne puste stany, CTA, czytelny loading przy hydratacji.
- **WebView-ready** — krytyczne zasoby w repozytorium, bez „wiszącego” UI na zewnętrznych URL obrazów.

<div align="center">

<br />

**[Repozytorium na GitHubie](https://github.com/Goudass/PRGRSS-ios)**

</div>
