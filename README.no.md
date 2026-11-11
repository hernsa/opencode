<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset=".github/assets/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset=".github/assets/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src=".github/assets/logo-ornate-light.svg" alt="OC Nano logo">
    </picture>
  </a>
</p>
<p align="center">AI-kodeagent med åpen kildekode.</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/@ocnano/cli"><img alt="npm" src="https://img.shields.io/npm/v/@ocnano/cli?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/release.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/release.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![OC Nano Terminal UI](services/site/public/v1/docs/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installasjon

```bash
# YOLO
curl -fsSL https://opencode.ai/v2/install | bash

# Pakkehåndterere
npm i -g @ocnano/cli@latest      # eller bun/pnpm/yarn
brew install anomalyco/tap/ocnano-v2 # macOS og Linux (anbefalt, alltid oppdatert)
brew install OC Nano              # macOS og Linux (offisiell brew-formel, oppdateres sjeldnere)
sudo pacman -S OC Nano            # Arch Linux (Stable)
paru -S ocnano-beta              # Arch Linux (Latest from AUR)
mise use -g OC Nano               # alle OS
nix run github:anomalyco/opencode  # Nix
```

> [!TIP]
> Fjern versjoner eldre enn 0.1.x før du installerer.

### Desktop-app (BETA)

OC Nano er også tilgjengelig som en desktop-app. Last ned fra [opencode.ai/download](https://opencode.ai/download).

| Plattform             | Nedlasting                         |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `ocnano-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `ocnano-desktop-mac-x64.dmg`     |
| Windows               | `ocnano-desktop-win-x64.exe`     |
| Linux                 | `.deb`, `.rpm` eller AppImage      |

```bash
# macOS (Homebrew)
brew install --cask ocnano-desktop
```

#### Installasjonsmappe

Installasjonsskriptet installerer OC Nano i `$HOME/.ocnano/bin`.

### Agents

OC Nano har to innebygde agents du kan bytte mellom med `Tab`-tasten.

- **build** - Standard, agent med full tilgang for utviklingsarbeid
- **plan** - Skrivebeskyttet agent for analyse og kodeutforsking
  - Nekter filendringer som standard
  - Spør om tillatelse før bash-kommandoer
  - Ideell for å utforske ukjente kodebaser eller planlegge endringer

Det finnes også en **general**-subagent for komplekse søk og flertrinnsoppgaver.
Den brukes internt og kan kalles via `@general` i meldinger.

Les mer om [agents](https://opencode.ai/docs/agents).

### Dokumentasjon

For mer info om hvordan du konfigurerer OC Nano, [**se dokumentasjonen**](https://opencode.ai/docs).

### Bidra

Hvis du vil bidra til OC Nano, les [contributing docs](./CONTRIBUTING.md) før du sender en pull request.

### Bygge på OC Nano

Hvis du jobber med et prosjekt som er relatert til OC Nano og bruker "OC Nano" som en del av navnet; for eksempel "ocnano-dashboard" eller "ocnano-mobile", legg inn en merknad i README som presiserer at det ikke er bygget av OC Nano-teamet og ikke er tilknyttet oss på noen måte.

---

**Bli med i fellesskapet** [Discord](https://discord.gg/ocnano) | [X.com](https://x.com/ocnano)
