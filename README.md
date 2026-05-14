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

## Case study (portfolio)

**Cel:** mobilna aplikacja do treningu siłowego z planami, dziennikiem i prostym progres — **działająca w przeglądarce i jako paczka na iOS**, bez backendu, z danymi wyłącznie na urządzeniu.

**Podejście:** jeden kod w **Next.js** z **eksportem statycznym** (`out/`), osadzony w **WKWebView** przez **Capacitor**. Dzięki temu ten sam interfejs można pokazać rekruterowi w **localhost**, wdrożyć jako **PWA** lub zbudować w **Xcode** na fizyczny iPhone.

**Wyzwania i rozwiązania:**

- **Safe area / pasek statusu** — spójny górny inset (CSS + natywny bridge), żeby nagłówki nie wchodziły pod zegarek; plugin **@capacitor/status-bar** (ciemny styl, tło `#090C11`, treść nie pod status bar).
- **„Web w shellu”** — haptika przy zapisie serii i ukończeniu treningu (**@capacitor/haptics**), spójne puste stany z CTA zamiast surowego tekstu, loader hydratacji zamiast losowych skeletonów.
- **Offline i WKWebView** — tło z **lokalnego** zasobu (`public/bg/`), bez zależności od zewnętrznych URL zdjęć; krytyczny CSS inline na wypadek agresywnych in-app przeglądarek.
- **Build iOS** — `npm run ios:copy` / `ios:sync` kopiują `out/` do `ios/.../public`, żeby Xcode zawsze widział aktualny front.

**Czego się nauczyłem / co pokazuję:** praca z **Capacitor + Xcode**, **persistencją po stronie klienta**, **mobile-first UI** i świadomym kompromisem **web vs native** (jasna narracja zamiast udawania „czystego” SwiftUI).
