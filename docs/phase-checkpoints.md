# Phase Checkpoints

Diese Datei hält die stabilen Projektstände von Jarvis Pro fest, damit Restore-Punkte und nächste Schritte eindeutig nachvollziehbar bleiben.

## v1.0 – Reproducible n8n Workflow Restore

- Reproduzierbarer n8n Workflow liegt als JSON im Repository.
- Import über `scripts/import-n8n-workflow.ps1` möglich.
- Jarvis-Web-Vertrag bleibt stabil:
  - Request: `{ "chatInput": "..." }`
  - Response: `{ "output": "..." }`
- Keine Secrets im Workflow-Export.

## v1.1 – AI Agent Restore

- Lokaler n8n Workflow **Jarvis Pro Interface v1** funktioniert wieder mit AI-Agent-Struktur.
- Workflow-Struktur: `Jarvis Webhook` → `Chat-Eingabe normalisieren` → `Jarvis KI-Agent` → `OpenAI-Chatmodell` → `Einfacher Speicher` → `Jarvis-Ausgabe zurückgeben`.
- OpenAI-Credential wird lokal in n8n verbunden und nicht committet.
- Jarvis-Web sendet weiterhin `{ "chatInput": userMessage }` und liest `data.output`.
- Systemprompt ist aktiv und Jarvis erkennt seine Rolle in **PROJEKT JARVIS**.
- Backup-, Restore- und Start-Dokumentation liegt unter `docs/backup-restore.md`.

## v1.2 / Phase 2.5b – CEO Layer + Command Bus + Manus COO Vorbereitung

- CEO ChatGPT Layer ist in der UI als aktive strategische Steuerungsschicht sichtbar.
- Lokaler Command Bus erzeugt vorbereitende Task-Entwürfe aus einfachen Intent-/Routing-Regeln.
- Rollenstatus ist ehrlich ausgewiesen: CEO ChatGPT und n8n Agent aktiv; COO Manus, CTO Codex und CSO Claude vorbereitet; CFO Finance geplant.
- Menschliche Freigabe wird bei kritischen Begriffen markiert; der Mensch bleibt höchste Entscheidungsinstanz.
- Keine echte externe Manus-, Claude-, CFO- oder Codex-Automation.
- Jarvis-Web-Vertrag bleibt stabil:
  - Request: `{ "chatInput": "..." }`
  - Response: `{ "output": "..." }`
- Dokumentation liegt unter `docs/phase-2-5-command-bus.md`.

## Nächster geplanter Schritt

- Command-Bus-Persistenz und Audit-Logik definieren.
- UI-Flow für menschliche Freigabe ausarbeiten.
- Sichere Integrationsverträge für spätere Agenten- und n8n-Automationen spezifizieren.

## v1.3 / Phase 2.5b Patch 2 + Phase 2.5c – Layout, Voice-First und Manus COO

- Full-Screen-Command-Center-Layout umgesetzt: linke, zentrale und rechte Spalte nutzen breite Screens ausbalancierter.
- Voice-First UI umgesetzt: Jarvis zeigt kurze sichtbare Antworten und hält Volltexte einklappbar verfügbar.
- OpenAI TTS als lokaler `/api/tts` Dev-Proxy vorbereitet; `OPENAI_API_KEY` bleibt ausschließlich lokal in `.env`.
- Browser-/Systemstimme bleibt automatischer Fallback, wenn OpenAI TTS nicht konfiguriert oder nicht erreichbar ist.
- Manus COO First Activation umgesetzt/vorbereitet: Delegation bereit, Briefing-Generator, kopierbarer Manus-Auftrag und lokaler Freigabestatus.
- Keine externe Manus-Ausführung verbunden; externe Integration bleibt ehrlich als „nicht verbunden / vorbereitet“ markiert.
- n8n-Vertrag bleibt stabil:
  - Request: `{ "chatInput": "..." }`
  - Response: `{ "output": "..." }`

## v1.4 / Phase 2.6 — CEO Orchestration & Agent Integration Bridge

- CEO ChatGPT Layer logisch und sichtbar vor Command Bus platziert.
- Executive Decision State eingeführt.
- Command-Bus-Zähler aus gerenderter Task-Liste korrigiert.
- Manus COO lokale Delegation aktiv, externe Integration nicht verbunden.
- Codex Prompt Workflow vorbereitet, keine direkte externe Ausführung.
- Agenten-Brücke / Integrationsstatus ergänzt.
- Responsive Command-Center-Layout für Laptop-Breiten verbessert.
- Human Approval First bestätigt.

## v1.5 / Phase 2.7 — Manus Web Operator + MCP Governance

- Manus als COO Web Operator mit Capabilities für Geschäftsmodell-Recherche, Website Review, Monetarisierungsanalyse, UX-Flows, SaaS-Ideenvalidierung und Codex-Prompt-Vorbereitung modelliert.
- `MANUS_WEB_RESEARCH_TASK` als lokaler Task-Typ mit Freigabe-, Risiko-, Status- und Codex-Follow-up-Feldern vorbereitet.
- Monetization Research Pipeline von Nutzerauftrag über CEO Executive Decision, Command Bus, Manus-Briefing und Codex-Folgeauftrag dokumentiert.
- MCP Gateway / Tool Registry für Manus-Web-Operator-Tools vorbereitet; externe Manus-Ausführung bleibt ehrlich als nicht verbunden markiert.
- Human Approval First erweitert: Research-only, Login, External Action, Code Generation, Commit/PR und Merge/Deploy sind getrennte Freigabeebenen.
- n8n-Vertrag bleibt stabil: Request `{ "chatInput": userMessage }`, Response `data.output`.


## v1.6 / Phase 2.8 — Live Board-Agent Connectivity

- Board Execution Chain sichtbar eingeführt: Jarvis → CEO ChatGPT → COO Manus → CTO Codex → COO Manus Review → CEO ChatGPT → Jarvis → Mensch.
- Command-Bus-Zähler wird aus exakt derselben sichtbaren Task-Liste berechnet, die gerendert wird.
- Live Connectivity Map zeigt pro Komponente `connected`, `local_active`, `prepared`, `mcp_ready`, `api_ready`, `needs_secret`, `needs_login`, `unavailable` oder `failed` und erklärt möglich/fehlend/blockiert.
- Local Task Store nutzt localStorage für Executive Decisions, Board Chains, Command Tasks und Approval States ohne Secrets.
- n8n-Vertrag bleibt stabil: Request `{ "chatInput": userMessage }`, Response `data.output`.
- Externe Manus-/Codex-/GitHub-Ausführung wird nicht vorgetäuscht; Buttons bleiben disabled, wenn Connectoren oder Secrets fehlen.


## v1.7 / Phase 2.9 – GitHub/Codex Live Handoff

- Command-Bus-Zähler wird aus exakt derselben `visibleCommandTasks`-Liste berechnet, die gerendert wird.
- Codex-Handoff enthält Ziel, CEO-Kontext, Manus-Plan, Anforderungen, Sicherheitsregeln, Tests, Branch-/PR-Regeln und Human-Approval-Regeln.
- GitHub-Issue-Draft enthält Titel, Body, Labels, Priorität, Board-/Decision-/Manus-/Codex-Bezüge, Risiken, Akzeptanzkriterien, Testplan sowie No-Secrets-/No-Merge-Hinweise.
- GitHub Capability Detection modelliert `connected`, `needs_secret`, `needs_connector`, `prepared`, `unavailable`, `failed` und zeigt bei fehlender Verbindung den Grund.
- Echte GitHub Issue-/PR-Aktionen bleiben ohne sicheren serverseitigen/n8n/MCP-Connector deaktiviert.
- n8n-Chat-Vertrag bleibt stabil: Request `{ "chatInput": userMessage }`, Response `data.output`.

## v1.8 / Phase 3.0a – GitHub Rückkanal + Codex PR Status

- GitHub-Rückkanalmodell für Issue URL/Nummer, Branch, Commit SHA, PR URL/Nummer, PR Status, Checks, Review Status, Blocker, Aktualisierung und menschliche Freigabe ergänzt.
- CTO Codex / GitHub Bereich zeigt Codex-PR-Status und nächste notwendige Freigabe sichtbar an.
- Ohne sicheren serverseitigen GitHub Connector bleibt Live-Status ehrlich als `needs_secret`/`needs_connector` markiert; GitHub Live-Buttons bleiben deaktiviert.
- Manuelle Copy/Paste-Statusübernahme ist lokal möglich, damit Codex-Arbeit an Jarvis zurückgemeldet werden kann, ohne Tokens im Browser zu speichern.
- Keine Merge-/Deploy-Funktion und kein direkter GitHub Token im Frontend.
- n8n-Chat-Vertrag bleibt stabil: Request `{ "chatInput": userMessage }`, Response `data.output`.
