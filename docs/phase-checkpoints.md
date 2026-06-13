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

## Nächster geplanter Schritt

**Phase 2.5b – Command Bus + Manus COO Vorbereitung**

- Command-Bus-Konzept vorbereiten.
- Manus-COO-Rolle weiter operationalisieren.
- Keine Änderung am bestehenden Frontend-Vertrag ohne expliziten Checkpoint.
- Keine Secrets oder lokalen Credentials in GitHub speichern.
