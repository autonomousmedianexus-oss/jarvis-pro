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
