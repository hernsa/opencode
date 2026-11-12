<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset=".github/assets/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset=".github/assets/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src=".github/assets/logo-ornate-light.svg" alt="OC Nano logo">
    </picture>
  </a>
</p>
<p align="center">Ο πράκτορας τεχνητής νοημοσύνης ανοικτού κώδικα για προγραμματισμό.</p>
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

### Εγκατάσταση

```bash
# YOLO
curl -fsSL https://opencode.ai/v2/install | bash

# Διαχειριστές πακέτων
npm i -g @ocnano/cli@latest      # ή bun/pnpm/yarn
brew install anomalyco/tap/ocnano-v2 # macOS και Linux (προτείνεται, πάντα ενημερωμένο)
brew install ocnano              # macOS και Linux (επίσημος τύπος brew, λιγότερο συχνές ενημερώσεις)
sudo pacman -S ocnano            # Arch Linux (Σταθερό)
paru -S ocnano-beta              # Arch Linux (Τελευταία έκδοση από AUR)
mise use -g ocnano               # Οποιοδήποτε λειτουργικό σύστημα
nix run github:anomalyco/opencode  # Nix
```

> [!TIP]
> Αφαίρεσε παλαιότερες εκδόσεις από τη 0.1.x πριν από την εγκατάσταση.

### Εφαρμογή Desktop (BETA)

Το OC Nano είναι επίσης διαθέσιμο ως εφαρμογή. Κατέβασε το από το [opencode.ai/download](https://opencode.ai/download).

| Πλατφόρμα             | Λήψη                               |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `ocnano-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `ocnano-desktop-mac-x64.dmg`     |
| Windows               | `ocnano-desktop-win-x64.exe`     |
| Linux                 | `.deb`, `.rpm`, ή AppImage         |

```bash
# macOS (Homebrew)
brew install --cask ocnano-desktop
```

#### Κατάλογος Εγκατάστασης

Το script εγκατάστασης εγκαθιστά το OC Nano στο `$HOME/.ocnano/bin`.

### Πράκτορες

Το OC Nano περιλαμβάνει δύο ενσωματωμένους πράκτορες μεταξύ των οποίων μπορείτε να εναλλάσσεστε με το πλήκτρο `Tab`.

- **build** - Προεπιλεγμένος πράκτορας με πλήρη πρόσβαση για εργασία πάνω σε κώδικα
- **plan** - Πράκτορας μόνο ανάγνωσης για ανάλυση και εξερεύνηση κώδικα
  - Αρνείται την επεξεργασία αρχείων από προεπιλογή
  - Ζητά άδεια πριν εκτελέσει εντολές bash
  - Ιδανικός για εξερεύνηση άγνωστων αρχείων πηγαίου κώδικα ή σχεδιασμό αλλαγών

Περιλαμβάνεται επίσης ένας **general** υποπράκτορας για σύνθετες αναζητήσεις και πολυβηματικές διεργασίες.
Χρησιμοποιείται εσωτερικά και μπορεί να κληθεί χρησιμοποιώντας `@general` στα μηνύματα.

Μάθετε περισσότερα για τους [πράκτορες](https://opencode.ai/docs/agents).

### Οδηγός Χρήσης

Για περισσότερες πληροφορίες σχετικά με τη ρύθμιση του OC Nano, [**πλοηγήσου στον οδηγό χρήσης μας**](https://opencode.ai/docs).

### Συνεισφορά

Εάν ενδιαφέρεσαι να συνεισφέρεις στο OC Nano, διαβάστε τα [οδηγό χρήσης συνεισφοράς](./CONTRIBUTING.md) πριν υποβάλεις ένα pull request.

### Δημιουργία πάνω στο OC Nano

Εάν εργάζεσαι σε ένα έργο σχετικό με το OC Nano και χρησιμοποιείτε το "ocnano" ως μέρος του ονόματός του, για παράδειγμα "ocnano-dashboard" ή "ocnano-mobile", πρόσθεσε μια σημείωση στο README σας για να διευκρινίσεις ότι δεν είναι κατασκευασμένο από την ομάδα του OC Nano και δεν έχει καμία σχέση με εμάς.

---

**Γίνε μέλος της κοινότητάς μας** [Discord](https://discord.gg/ocnano) | [X.com](https://x.com/ocnano)
