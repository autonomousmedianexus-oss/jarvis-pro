# Phase 3.0c – Manus Live Connector Integration

## Ziel
Jarvis verbindet COO Manus nur dann live, wenn eine sichere serverseitige Schnittstelle vorhanden ist. Ohne Connector zeigt Jarvis ehrlich `needs_manus_connector` und bietet manuelle Handoff-Funktionen.

## Serverseitige Detection
Die Vite-Dev-Backend-Route prüft ausschließlich serverseitige Environment-Variablen:

- `MANUS_API_KEY` optional als Bearer Token für serverseitige Manus-Requests
- `MANUS_API_URL`
- `MANUS_WEBHOOK_URL`
- `MANUS_MCP_URL`
- `MANUS_BROWSER_OPERATOR_CONNECTOR_URL`
- `N8N_MANUS_EXECUTION_WEBHOOK`

Secrets werden nicht an das Frontend ausgeliefert. Das Frontend erhält nur Status, Connector-Typ und die Aussage, dass die Nutzung serverseitig erfolgt.

## API-Routen

### `GET /api/manus/status`
Antwortet mit:

- `manus_live_connected`, wenn eine sichere serverseitige URL konfiguriert ist
- `needs_manus_connector`, wenn kein Connector vorhanden ist

### `POST /api/manus/task`
Input:

```json
{
  "manusTask": {},
  "briefing": "optional"
}
```

Output:

- Bei fehlendem Connector: HTTP 503 mit `status: "needs_manus_connector"`
- Bei sicherem Connector: normalisierter `ManusReport`
- Bei verbotenen Aktionen: `status: "blocked"`

## Sicherheits-Gates
Ohne zusätzliches explizites GO darf Manus nur:

- öffentliche Recherche vorbereiten
- Analysebericht erstellen
- CodexTaskDraft vorbereiten

Nicht erlaubt ohne explizites separates GO:

- Login oder Account-Zugriff
- Formulare absenden
- Käufe oder Zahlungen
- Uploads
- externe Aktionen mit Wirkung
- Codex ausführen
- Commit/PR, Merge oder Deploy

## UI-Verhalten
Der COO-Manus-Bereich zeigt:

- Manus Connector Status
- Live Status (`needs_manus_connector`, `manus_live_connected`, `task_sent`, `report_ready`, `blocked`, `failed`)
- Button „Manus live senden“ nur aktiv bei sicherem Connector
- ManusReport-Bereich
- CodexTaskDraft-Bereich für den CTO-Codex-Handoff

## n8n-Fallback
Der bestehende Chat-Fallback bleibt unverändert: Jarvis sendet weiterhin `{ chatInput: userMessage }` an den bestehenden n8n-Webhook und liest `data.output`.
