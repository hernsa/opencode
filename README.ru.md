<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset=".github/assets/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset=".github/assets/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src=".github/assets/logo-ornate-light.svg" alt="OC Nano logo">
    </picture>
  </a>
</p>
<p align="center">Открытый AI-агент для программирования.</p>
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

### Установка

```bash
# YOLO
curl -fsSL https://opencode.ai/v2/install | bash

# Менеджеры пакетов
npm i -g @ocnano/cli@latest      # или bun/pnpm/yarn
brew install anomalyco/tap/ocnano-v2 # macOS и Linux (рекомендуем, всегда актуально)
brew install ocnano              # macOS и Linux (официальная формула brew, обновляется реже)
sudo pacman -S ocnano            # Arch Linux (Stable)
paru -S ocnano-beta              # Arch Linux (Latest from AUR)
mise use -g ocnano               # любая ОС
nix run github:anomalyco/opencode  # Nix
```

> [!TIP]
> Перед установкой удалите версии старше 0.1.x.

### Десктопное приложение (BETA)

OC Nano также доступен как десктопное приложение. Скачайте его с [opencode.ai/download](https://opencode.ai/download).

| Платформа             | Загрузка                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `ocnano-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `ocnano-desktop-mac-x64.dmg`     |
| Windows               | `ocnano-desktop-win-x64.exe`     |
| Linux                 | `.deb`, `.rpm` или AppImage        |

```bash
# macOS (Homebrew)
brew install --cask ocnano-desktop
```

#### Каталог установки

Скрипт установки устанавливает OC Nano в `$HOME/.ocnano/bin`.

### Agents

В OC Nano есть два встроенных агента, между которыми можно переключаться клавишей `Tab`.

- **build** - По умолчанию, агент с полным доступом для разработки
- **plan** - Агент только для чтения для анализа и изучения кода
  - По умолчанию запрещает редактирование файлов
  - Запрашивает разрешение перед выполнением bash-команд
  - Идеален для изучения незнакомых кодовых баз или планирования изменений

Также включен сабагент **general** для сложных поисков и многошаговых задач.
Он используется внутренне и может быть вызван в сообщениях через `@general`.

Подробнее об [agents](https://opencode.ai/docs/agents).

### Документация

Больше информации о том, как настроить OC Nano: [**наши docs**](https://opencode.ai/docs).

### Вклад

Если вы хотите внести вклад в OC Nano, прочитайте [contributing docs](./CONTRIBUTING.md) перед тем, как отправлять pull request.

### Разработка на базе OC Nano

Если вы делаете проект, связанный с OC Nano, и используете "ocnano" как часть имени (например, "ocnano-dashboard" или "ocnano-mobile"), добавьте примечание в README, чтобы уточнить, что проект не создан командой OC Nano и не аффилирован с нами.

---

**Присоединяйтесь к нашему сообществу** [Discord](https://discord.gg/ocnano) | [X.com](https://x.com/ocnano)
