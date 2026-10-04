# opencode config

Personal [opencode](https://opencode.ai) configuration.

This config relies on three environment variables. Without them, the CommandCode provider and the Context7 / Firecrawl MCP servers will fail to authenticate.

| Variable | Used by | Purpose |
|---|---|---|
| `CMD_API_KEY` | CommandCode custom provider (`provider.commandcode`) | Auth for `https://api.commandcode.ai/provider/v1` |
| `CONTEXT7_API_KEY` | Context7 MCP (`mcp.context7`) | Bearer token for `https://mcp.context7.com/mcp` |
| `FIRECRAWL_API_KEY` | Firecrawl MCP (`mcp.firecrawl`) | Bearer token for `https://mcp.firecrawl.dev/v2/mcp` |

## How to retrieve each API key

- **CMD_API_KEY** — Sign up / log in at [CommandCode](https://commandcode.ai), open the API keys page in your dashboard and create a key.
- **CONTEXT7_API_KEY** — Go to the [Context7 dashboard](https://context7.com/dashboard), sign in with GitHub, and generate an API key.
- **FIRECRAWL_API_KEY** — Sign up at [Firecrawl](https://www.firecrawl.dev), then copy a key from [API keys](https://www.firecrawl.dev/app/api-keys).

## Set the variables

Windows (permanent, new terminal picks it up):

```powershell
setx CMD_API_KEY "your-key"
setx CONTEXT7_API_KEY "your-key"
setx FIRECRAWL_API_KEY "your-key"
```

macOS / Linux (`~/.bashrc` or `~/.zshrc`):

```bash
export CMD_API_KEY="your-key"
export CONTEXT7_API_KEY="your-key"
export FIRECRAWL_API_KEY="your-key"
```

Then run `opencode` from a fresh terminal.

## Non-interactive Git Bash setup

`opencode.jsonc` sets `"shell": "bash"` (Git Bash on Windows). Shells invoked non-interactively by harnesses don't read `~/.bashrc`, so Node (via [fnm](https://github.com/Schniz/fnm)) and Python (via [uv](https://github.com/astral-sh/uv)) would be missing. Two steps fix that.

**1. `~/.bashrc`** — load fnm and shim `python` / `python3` to the uv-managed interpreter:

```bash
eval "$(fnm env --use-on-cd --shell bash)"

python() {
    "$(uv python find)" "$@"
}

export -f python

python3() {
    "$(uv python find)" "$@"
}

export -f python3
```

`export -f` makes the functions visible to non-interactive subshells.

**2. `BASH_ENV`** — Windows environment variable pointing at that file, so non-interactive bash sources it on startup:

```powershell
setx BASH_ENV "%USERPROFILE%\.bashrc"
```

That loads the minimum (fnm + python shims) for non-interactive shells. The `.bashrc` can also export additional environment variables, e.g. API keys for MCPs, next to the shims above.
