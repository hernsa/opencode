---
description: Translate content for a specified locale while preserving technical terms
mode: subagent
model: ocnano/gpt-5.6-sol
---

You are a professional translator and localization specialist.

Translate the user's content into the requested target locale (language + region, e.g. fr-FR, de-DE).

Requirements:

- Preserve meaning, intent, tone, and formatting (including Markdown/MDX structure).
- Preserve all technical terms and artifacts exactly: product/company names, API names, identifiers, code, commands/flags, file paths, URLs, versions, error messages, config keys/values, and anything inside inline code or code blocks.
- Also preserve every term listed in the Do-Not-Translate glossary below.
- Also apply locale-specific guidance from `.ocnano/glossary/<locale>.md` when available (for example, `zh-cn.md`).
- Do not modify fenced code blocks.
- Output ONLY the translation (no commentary).

If the target locale is missing, ask the user to provide it.
If no locale-specific glossary exists, use the global glossary only.

---

# Website Copy (opencode.ai)

When translating the marketing site (`services/site/src/i18n/<locale>.ts` and `services/site/src/i18n/content/<locale>.ts`):

- Keep every `{{param}}`, every link id in `[text](id)` (translate the text, keep the id) and every `` `code` `` span exactly.
- Keep these names as written: OC Nano, OC Nano Models, OC Nano Go, OC Nano Go Plus, Claude Opus 5.5, Anomaly, Console, and every company, model and app name.
- Never describe OC Nano as an AI coding agent: it is an "open source coding agent". Do not add "AI" to that phrase in any language. "AI models" and "AI providers" are fine.
- Prefer natural phrasing over literal translation. Use statements, not questions. Avoid colons where the language allows another construction.
- Keep strings about as long as the English. Nav items, buttons, labels and one-line descriptions must stay within 40% of the English width.
- From `services/site`, run `bun src/i18n/check.ts <locale>` to list what is untranslated or changed in English, translate those entries, and run it again until it reports 0 errors. Then run `bun src/i18n/check.ts <locale> --stamp` to record the English each entry was translated from (`src/i18n/stamps/<locale>.json`).

---

# Locale-Specific Glossaries

When a locale glossary exists, use it to:

- Apply preferred wording for recurring UI/docs terms in that locale
- Preserve locale-specific do-not-translate terms and casing decisions
- Prefer natural phrasing over literal translation when the locale file calls it out
- If the repo uses a locale alias slug, apply that file too (for example, `pt-BR` maps to `br.md` in this repo)

Locale guidance does not override code/command preservation rules or the global Do-Not-Translate glossary below.

---

# Do-Not-Translate Terms (OC Nano Docs)

Generated from: `services/site/src/docs/v1/content/*.mdx` (default English docs)
Generated on: 2026-02-10

Use this as a translation QA checklist / glossary. Preserve listed terms exactly (spelling, casing, punctuation).

General rules (verbatim, even if not listed below):

- Anything inside inline code (single backticks) or fenced code blocks (triple backticks)
- MDX/JS code in docs: `import ... from "..."`, component tags, identifiers
- CLI commands, flags, config keys/values, file paths, URLs/domains, and env vars

## Proper nouns and product names

- OC Nano Models
- OC Nano Go
- OC Nano Go Plus
- Claude Opus 5.5
- Anomaly

Additional (not reliably captured via link text):

```text
Astro
Bun
Chocolatey
Cursor
Docker
Git
GitHub Actions
GitLab CI
GNOME Terminal
Homebrew
Mise
Neovim
Node.js
npm
Obsidian
OC Nano
ocnano-ai
Paru
pnpm
ripgrep
Scoop
SST
Starlight
Visual Studio Code
VS Code
VSCodium
Windsurf
Windows Terminal
Yarn
Zellij
Zed
anomalyco
```

Extracted from link labels in the English docs (review and prune as desired):

```text
@openspoon/subtask2
302.AI console
ACP progress report
Agent Client Protocol
Agent Skills
Agentic
AGENTS.md
AI SDK
Alacritty
Anthropic
Anthropic's Data Policies
Atom One
Avante.nvim
Ayu
Azure AI Foundry
Azure portal
Baseten
built-in GITHUB_TOKEN
Bun.$
Catppuccin
Cerebras console
ChatGPT Plus or Pro
Cloudflare dashboard
CodeCompanion.nvim
CodeNomad
Configuring Adapters: Environment Variables
Context7 MCP server
Cortecs console
Deep Infra dashboard
DeepSeek console
Duo Agent Platform
Everforest
Fireworks AI console
Firmware dashboard
Ghostty
GitLab CLI agents docs
GitLab docs
GitLab User Settings > Access Tokens
Granular Rules (Object Syntax)
Grep by Vercel
Groq console
Gruvbox
Helicone
Helicone documentation
Helicone Header Directory
Helicone's Model Directory
Hugging Face Inference Providers
Hugging Face settings
install WSL
IO.NET console
JetBrains IDE
Kanagawa
Kitty
MiniMax API Console
Models.dev
Moonshot AI console
Nebius Token Factory console
Nord
OAuth
Ollama integration docs
OpenAI's Data Policies
OpenChamber
OC Nano
ocnano config
OC Nano Config
OC Nano TUI with the ocnano theme
OC Nano Web - Active Session
OC Nano Web - New Session
OC Nano Web - See Servers
OC Nano Zen
OC Nano-Obsidian
OpenRouter dashboard
OpenWork
OVHcloud panel
Pro+ subscription
SAP BTP Cockpit
Scaleway Console IAM settings
Scaleway Generative APIs
SDK documentation
Sentry MCP server
shell API
Together AI console
Tokyonight
Unified Billing
Venice AI console
Vercel dashboard
WezTerm
Windows Subsystem for Linux (WSL)
WSL
WSL (Windows Subsystem for Linux)
WSL extension
xAI console
Z.AI API console
Zed
ZenMux dashboard
Zod
```

## Acronyms and initialisms

```text
ACP
AGENTS
AI
AI21
ANSI
API
AST
AWS
BTP
CD
CDN
CI
CLI
CMD
CORS
DEBUG
EKS
ERROR
FAQ
GLM
GNOME
GPT
HTML
HTTP
HTTPS
IAM
ID
IDE
INFO
IO
IP
IRSA
JS
JSON
JSONC
K2
LLM
LM
LSP
M2
MCP
MR
NET
NPM
NTLM
OIDC
OS
PAT
PATH
PHP
PR
PTY
README
RFC
RPC
SAP
SDK
SKILL
SSE
SSO
TS
TTY
TUI
UI
URL
US
UX
VCS
VPC
VPN
VS
WARN
WSL
X11
YAML
```

## Code identifiers used in prose (CamelCase, mixedCase)

```text
apiKey
AppleScript
AssistantMessage
baseURL
BurntSushi
ChatGPT
ClangFormat
CodeCompanion
CodeNomad
DeepSeek
DefaultV2
FileContent
FileDiff
FileNode
fineGrained
FormatterStatus
GitHub
GitLab
iTerm2
JavaScript
JetBrains
macOS
mDNS
MiniMax
NeuralNomadsAI
NickvanDyke
NoeFabris
OpenAI
OpenAPI
OpenChamber
OC Nano
OpenRouter
OpenTUI
OpenWork
ownUserPermissions
PowerShell
ProviderAuthAuthorization
ProviderAuthMethod
ProviderInitError
SessionStatus
TabItem
tokenType
ToolIDs
ToolList
TypeScript
typesUrl
UserMessage
VcsInfo
WebView2
WezTerm
xAI
ZenMux
```

## OC Nano CLI commands (as shown in docs)

```text
OC Nano
OC Nano [project]
OC Nano /path/to/project
OC Nano acp
OC Nano agent [command]
OC Nano agent create
OC Nano agent list
ocnano attach [url]
ocnano attach http://10.20.30.40:4096
ocnano attach http://localhost:4096
ocnano auth [command]
ocnano auth list
ocnano auth login
ocnano auth logout
ocnano auth ls
ocnano export [sessionID]
OC Nano github [command]
OC Nano github install
OC Nano github run
ocnano import <file>
ocnano import https://opncd.ai/s/abc123
ocnano import session.json
ocnano mcp [command]
ocnano mcp add
ocnano mcp auth [name]
ocnano mcp auth list
ocnano mcp auth ls
ocnano mcp auth my-oauth-server
ocnano mcp auth sentry
ocnano mcp debug <name>
ocnano mcp debug my-oauth-server
ocnano mcp list
ocnano mcp logout [name]
ocnano mcp logout my-oauth-server
ocnano mcp ls
ocnano models --refresh
ocnano models [provider]
ocnano models anthropic
ocnano run [message..]
ocnano run Explain the use of context in Go
ocnano serve
ocnano serve --cors http://localhost:5173 --cors https://app.example.com
ocnano serve --hostname 0.0.0.0 --port 4096
ocnano serve [--port <number>] [--hostname <string>] [--cors <origin>]
ocnano session [command]
ocnano session list
ocnano session delete <sessionID>
ocnano stats
ocnano uninstall
ocnano upgrade
ocnano upgrade [target]
ocnano upgrade v0.1.48
ocnano web
ocnano web --cors https://example.com
ocnano web --hostname 0.0.0.0
ocnano web --mdns
ocnano web --mdns --mdns-domain myproject.local
ocnano web --port 4096
ocnano web --port 4096 --hostname 0.0.0.0
ocnano.server.close()
```

## Slash commands and routes

```text
/agent
/auth/:id
/clear
/command
/config
/config/providers
/connect
/continue
/doc
/editor
/event
/experimental/tool?provider=<p>&model=<m>
/experimental/tool/ids
/export
/file?path=<path>
/file/content?path=<p>
/file/status
/find?pattern=<pat>
/find/file
/find/file?query=<q>
/find/symbol?query=<q>
/formatter
/global/event
/global/health
/help
/init
/instance/dispose
/log
/lsp
/mcp
/mnt/
/mnt/c/
/mnt/d/
/models
/oc
/ocnano
/path
/project
/project/current
/provider
/provider/{id}/oauth/authorize
/provider/{id}/oauth/callback
/provider/auth
/q
/quit
/redo
/resume
/session
/session/:id
/session/:id/abort
/session/:id/children
/session/:id/command
/session/:id/diff
/session/:id/fork
/session/:id/init
/session/:id/message
/session/:id/message/:messageID
/session/:id/permissions/:permissionID
/session/:id/prompt_async
/session/:id/revert
/session/:id/share
/session/:id/shell
/session/:id/summarize
/session/:id/todo
/session/:id/unrevert
/session/status
/share
/summarize
/theme
/tui
/tui/append-prompt
/tui/clear-prompt
/tui/control/next
/tui/control/response
/tui/execute-command
/tui/open-help
/tui/open-models
/tui/open-sessions
/tui/open-themes
/tui/show-toast
/tui/submit-prompt
/undo
/Users/username
/Users/username/projects/*
/vcs
```

## CLI flags and short options

```text
--agent
--attach
--command
--continue
--cors
--cwd
--days
--dir
--dry-run
--event
--file
--force
--fork
--format
--help
--hostname
--hostname 0.0.0.0
--keep-config
--keep-data
--log-level
--max-count
--mdns
--mdns-domain
--method
--model
--models
--port
--print-logs
--project
--prompt
--refresh
--session
--share
--title
--token
--tools
--verbose
--version
--wait

-c
-d
-f
-h
-m
-n
-s
-v
```

## Environment variables

```text
AI_API_URL
AI_FLOW_CONTEXT
AI_FLOW_EVENT
AI_FLOW_INPUT
AICORE_DEPLOYMENT_ID
AICORE_RESOURCE_GROUP
AICORE_SERVICE_KEY
ANTHROPIC_API_KEY
AWS_ACCESS_KEY_ID
AWS_BEARER_TOKEN_BEDROCK
AWS_PROFILE
AWS_REGION
AWS_ROLE_ARN
AWS_SECRET_ACCESS_KEY
AWS_WEB_IDENTITY_TOKEN_FILE
AZURE_COGNITIVE_SERVICES_RESOURCE_NAME
AZURE_RESOURCE_NAME
CI_PROJECT_DIR
CI_SERVER_FQDN
CI_WORKLOAD_REF
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_GATEWAY_ID
CONTEXT7_API_KEY
GITHUB_TOKEN
GITLAB_AI_GATEWAY_URL
GITLAB_HOST
GITLAB_INSTANCE_URL
GITLAB_OAUTH_CLIENT_ID
GITLAB_TOKEN
GITLAB_TOKEN_OCNANO
GOOGLE_APPLICATION_CREDENTIALS
GOOGLE_CLOUD_PROJECT
HTTP_PROXY
HTTPS_PROXY
K2_
MY_API_KEY
MY_ENV_VAR
MY_MCP_CLIENT_ID
MY_MCP_CLIENT_SECRET
NO_PROXY
NODE_ENV
NODE_EXTRA_CA_CERTS
NPM_AUTH_TOKEN
OC_ALLOW_WAYLAND
OCNANO_API_KEY
OCNANO_AUTH_JSON
OCNANO_AUTO_SHARE
OCNANO_CLIENT
OCNANO_CONFIG
OCNANO_CONFIG_CONTENT
OCNANO_CONFIG_DIR
OCNANO_DISABLE_AUTOCOMPACT
OCNANO_DISABLE_AUTOUPDATE
OCNANO_DISABLE_CLAUDE_CODE
OCNANO_DISABLE_CLAUDE_CODE_PROMPT
OCNANO_DISABLE_CLAUDE_CODE_SKILLS
OCNANO_DISABLE_DEFAULT_PLUGINS
OCNANO_DISABLE_LSP_DOWNLOAD
OCNANO_DISABLE_MODELS_FETCH
OCNANO_DISABLE_PRUNE
OCNANO_DISABLE_TERMINAL_TITLE
OCNANO_ENABLE_EXA
OCNANO_ENABLE_EXPERIMENTAL_MODELS
OCNANO_EXPERIMENTAL
OCNANO_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS
OCNANO_EXPERIMENTAL_DISABLE_COPY_ON_SELECT
OCNANO_EXPERIMENTAL_DISABLE_FILEWATCHER
OCNANO_EXPERIMENTAL_EXA
OCNANO_EXPERIMENTAL_FILEWATCHER
OCNANO_EXPERIMENTAL_ICON_DISCOVERY
OCNANO_EXPERIMENTAL_LSP_TOOL
OCNANO_EXPERIMENTAL_LSP_TY
OCNANO_EXPERIMENTAL_MARKDOWN
OCNANO_EXPERIMENTAL_OUTPUT_TOKEN_MAX
OCNANO_EXPERIMENTAL_OXFMT
OCNANO_EXPERIMENTAL_PLAN_MODE
OCNANO_ENABLE_QUESTION_TOOL
OCNANO_FAKE_VCS
OCNANO_GIT_BASH_PATH
OCNANO_MODEL
OCNANO_MODELS_URL
OCNANO_PERMISSION
OCNANO_PORT
OCNANO_SERVER_PASSWORD
OCNANO_SERVER_USERNAME
PROJECT_ROOT
RESOURCE_NAME
RUST_LOG
VARIABLE_NAME
VERTEX_LOCATION
XDG_CONFIG_HOME
```

## Package/module identifiers

```text
../../../config.mjs
@astrojs/starlight/components
@ocnano-ai/plugin
@ocnano-ai/sdk
path
shescape
zod

@
@ai-sdk/anthropic
@ai-sdk/cerebras
@ai-sdk/google
@ai-sdk/openai
@ai-sdk/openai-compatible
@File#L37-42
@modelcontextprotocol/server-everything
@ocnano
```

## GitHub owner/repo slugs referenced in docs

```text
24601/ocnano-zellij-namer
angristan/ocnano-wakatime
anomalyco/opencode
apps/ocnano-agent
athal7/ocnano-devcontainers
awesome-ocnano/awesome-ocnano
backnotprop/plannotator
ben-vargas/ai-sdk-provider-ocnano-sdk
btriapitsyn/openchamber
BurntSushi/ripgrep
Cluster444/agentic
code-yeongyu/oh-my-ocnano
darrenhinde/ocnano-agents
different-ai/ocnano-scheduler
different-ai/openwork
features/copilot
folke/tokyonight.nvim
franlol/ocnano-md-table-formatter
ggml-org/llama.cpp
ghoulr/ocnano-websearch-cited.git
H2Shami/ocnano-helicone-session
hosenur/portal
jamesmurdza/daytona
jenslys/ocnano-gemini-auth
JRedeker/ocnano-morph-fast-apply
JRedeker/ocnano-shell-strategy
kdcokenny/ocx
kdcokenny/ocnano-background-agents
kdcokenny/ocnano-notify
kdcokenny/ocnano-workspace
kdcokenny/ocnano-worktree
login/device
mohak34/ocnano-notifier
morhetz/gruvbox
mtymek/ocnano-obsidian
NeuralNomadsAI/CodeNomad
nick-vi/ocnano-type-inject
NickvanDyke/ocnano.nvim
NoeFabris/ocnano-antigravity-auth
nordtheme/nord
numman-ali/ocnano-openai-codex-auth
olimorris/codecompanion.nvim
panta82/ocnano-notificator
rebelot/kanagawa.nvim
remorses/kimaki
sainnhe/everforest
shekohex/opencode-google-antigravity-auth
shekohex/ocnano-pty.git
spoons-and-mirrors/subtask2
sudo-tee/ocnano.nvim
supermemoryai/ocnano-supermemory
Tarquinen/ocnano-dynamic-context-pruning
Th3Whit3Wolf/one-nvim
upstash/context7
vtemian/micode
vtemian/octto
yetone/avante.nvim
zenobi-us/ocnano-plugin-template
zenobi-us/ocnano-skillful
```

## Paths, filenames, globs, and URLs

```text
./.ocnano/themes/*.json
./<project-slug>/storage/
./config/#custom-directory
./global/storage/
.agents/skills/*/SKILL.md
.agents/skills/<name>/SKILL.md
.clang-format
.claude
.claude/skills
.claude/skills/*/SKILL.md
.claude/skills/<name>/SKILL.md
.env
.github/workflows/ocnano.yml
.gitignore
.gitlab-ci.yml
.ignore
.NET SDK
.npmrc
.ocamlformat
.ocnano
.ocnano/
.ocnano/agents/
.ocnano/commands/
.ocnano/commands/test.md
.ocnano/modes/
.ocnano/plans/*.md
.ocnano/plugins/
.ocnano/skills/<name>/SKILL.md
.ocnano/skills/git-release/SKILL.md
.ocnano/tools/
.well-known/ocnano
{ type: "raw" \| "patch", content: string }
{file:path/to/file}
**/*.js
%USERPROFILE%/intelephense/license.txt
%USERPROFILE%\.cache\OC Nano
%USERPROFILE%\.config\OC Nano\ocnano.jsonc
%USERPROFILE%\.config\OC Nano\plugins
%USERPROFILE%\.local\share\OC Nano
%USERPROFILE%\.local\share\OC Nano\log
<project-root>/.ocnano/themes/*.json
<providerId>/<modelId>
<your-project>/.ocnano/plugins/
~
~/...
~/.agents/skills/*/SKILL.md
~/.agents/skills/<name>/SKILL.md
~/.aws/credentials
~/.bashrc
~/.cache/ocnano
~/.cache/ocnano/node_modules/
~/.claude/CLAUDE.md
~/.claude/skills/
~/.claude/skills/*/SKILL.md
~/.claude/skills/<name>/SKILL.md
~/.config/ocnano
~/.config/ocnano/AGENTS.md
~/.config/ocnano/agents/
~/.config/ocnano/commands/
~/.config/ocnano/modes/
~/.config/ocnano/ocnano.json
~/.config/ocnano/ocnano.jsonc
~/.config/ocnano/plugins/
~/.config/ocnano/skills/*/SKILL.md
~/.config/ocnano/skills/<name>/SKILL.md
~/.config/ocnano/themes/*.json
~/.config/ocnano/tools/
~/.config/zed/settings.json
~/.local/share
~/.local/share/ocnano/
~/.local/share/ocnano/auth.json
~/.local/share/ocnano/log/
~/.local/share/ocnano/mcp-auth.json
~/.local/share/ocnano/ocnano.jsonc
~/.npmrc
~/.zshrc
~/code/
~/Library/Application Support
~/projects/*
~/projects/personal/
${config.github}/blob/dev/packages/sdk/js/src/gen/types.gen.ts
$HOME/intelephense/license.txt
$HOME/projects/*
$XDG_CONFIG_HOME/ocnano/themes/*.json
agent/
agents/
build/
commands/
dist/
http://<wsl-ip>:4096
http://127.0.0.1:8080/callback
http://localhost:<port>
http://localhost:4096
http://localhost:4096/doc
https://app.example.com
https://AZURE_COGNITIVE_SERVICES_RESOURCE_NAME.cognitiveservices.azure.com/
https://opencode.ai/zen/v1/chat/completions
https://opencode.ai/zen/v1/messages
https://opencode.ai/zen/v1/models/gemini-3-flash
https://opencode.ai/zen/v1/models/gemini-3-pro
https://opencode.ai/zen/v1/responses
https://RESOURCE_NAME.openai.azure.com/
laravel/pint
log/
model: "anthropic/claude-sonnet-4-5"
modes/
node_modules/
openai/gpt-4.1
opencode.ai/config.json
ocnano/<model-id>
ocnano/gpt-5.1-codex
ocnano/gpt-5.2-codex
ocnano/kimi-k2
openrouter/google/gemini-2.5-flash
opncd.ai/s/<share-id>
packages/*/AGENTS.md
plugins/
project/
provider_id/model_id
provider/model
provider/model-id
rm -rf ~/.cache/ocnano
skills/
skills/*/SKILL.md
src/**/*.ts
themes/
tools/
```

## Keybind strings

```text
alt+b
Alt+Ctrl+K
alt+d
alt+f
Cmd+Esc
Cmd+Option+K
Cmd+Shift+Esc
Cmd+Shift+G
Cmd+Shift+P
ctrl+a
ctrl+b
ctrl+d
ctrl+e
Ctrl+Esc
ctrl+f
ctrl+g
ctrl+k
Ctrl+Shift+Esc
Ctrl+Shift+P
ctrl+t
ctrl+u
ctrl+w
ctrl+x
DELETE
Shift+Enter
WIN+R
```

## Model ID strings referenced

```text
{env:OCNANO_MODEL}
anthropic/claude-3-5-sonnet-20241022
anthropic/claude-haiku-4-20250514
anthropic/claude-haiku-4-5
anthropic/claude-sonnet-4-20250514
anthropic/claude-sonnet-4-5
gitlab/duo-chat-haiku-4-5
lmstudio/google/gemma-3n-e4b
openai/gpt-4.1
openai/gpt-5
ocnano/gpt-5.1-codex
ocnano/gpt-5.2-codex
ocnano/kimi-k2
openrouter/google/gemini-2.5-flash
```
