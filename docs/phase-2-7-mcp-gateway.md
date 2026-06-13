# Phase 2.7 – MCP Gateway / Tool Registry Governance

Das MCP Gateway ist in Phase 2.7 als Governance- und Tool-Registry-Modell vorbereitet. Es verbindet noch keine echte externe Manus-API, keinen Browser-Operator und keine produktive externe Ausführung.

## Manus Web Operator als Tool-Ziel

Manus ist als COO Web Operator ein vorbereitetes Ziel hinter dem CEO ChatGPT Layer und dem Command Bus. Manus-Aufgaben dürfen lokal als Briefing, Task-State oder kopierbarer Auftrag entstehen. Ohne echte Integration bleibt der Execution Mode `prepared`, `mcp_ready` oder `unavailable`.

## Tool Registry Erweiterung

Vorbereitete Tools:

- `create_manus_web_research_task`
- `copy_manus_web_research_brief`
- `mark_research_approved`
- `mark_login_approved`
- `attach_manus_report`
- `generate_codex_prompt_from_manus_report`
- `prepare_monetization_sprint`
- `export_research_task_state`

Execution Modes:

- `local`
- `prepared`
- `mcp_ready`
- `external_connected`
- `unavailable`

## Browser/Login Governance

Browser-, Login- und externe Webseitenaktionen benötigen explizite menschliche Freigabe. Research-only Aufgaben dürfen öffentlich zugängliche Informationen auswerten. Logins, Account-Änderungen, Zahlungen, Käufe, Uploads, Löschungen, Vertragsabschlüsse und sonstige bindende Aktionen sind ohne GO verboten.

## Sicherheitsregeln

- Keine Secrets im Frontend.
- Keine API-Keys oder Passwörter im Code.
- Keine geschützten oder proprietären Codes fremder Webseiten kopieren.
- Codex baut Follow-up-Umsetzungen originär/eigenständig.
- n8n-Vertrag bleibt unverändert: Frontend sendet `{ chatInput: userMessage }` und liest `data.output`.
