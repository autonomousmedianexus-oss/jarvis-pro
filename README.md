# jarvis-pro

Iron Man KI-Assistent - Autonomous Media Nexus.

Jarvis Pro besteht aktuell aus einer Vite/React-Weboberfläche und einer lokalen n8n-Bridge. Die Weboberfläche sendet unverändert JSON mit `chatInput` an n8n und erwartet eine Antwort im Format `{ "output": "..." }`.

## Lokale Voraussetzungen

- Node.js und npm
- npx
- PowerShell für die bereitgestellten Windows-Skripte
- Lokaler n8n-Zugriff über `http://localhost:5678`

## n8n Restore

Der reproduzierbare n8n-Workflow liegt unter:

```text
n8n/workflows/jarvis-pro-interface-v1.json
```

Der Workflow enthält keine API-Keys, Secrets oder Passwörter. Er stellt einen POST-Webhook bereit, der den bestehenden Jarvis-Web-Vertrag beibehält:

- Request: `{ "chatInput": "Hallo Jarvis" }`
- Response: `{ "output": "..." }`

### Workflow importieren

```powershell
powershell -ExecutionPolicy Bypass -File scripts/import-n8n-workflow.ps1
```

Das Skript führt intern aus:

```powershell
npx n8n import:workflow --input n8n/workflows/jarvis-pro-interface-v1.json
```

Nach dem Import den Workflow in n8n prüfen und aktivieren. Der Webhook-Pfad bleibt kompatibel mit der Jarvis-Weboberfläche:

```text
http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6
```

## OpenAI Credential lokal einrichten

Die aktuelle Workflow-Datei committet bewusst keine Credentials. Wenn der Workflow später um einen OpenAI-Knoten erweitert wird, werden Credentials ausschließlich lokal in n8n eingerichtet:

1. n8n öffnen: `http://localhost:5678`
2. In n8n zu **Credentials** wechseln.
3. Ein neues OpenAI Credential anlegen.
4. Den API-Key nur in n8n speichern.
5. Keine `.env`, JSON-Exports oder Screenshots mit Secrets committen.
6. Workflow-Knoten lokal mit diesem Credential verbinden und vor einem Export prüfen, dass keine Secrets im JSON enthalten sind.

## Jarvis starten

Komfortstart für n8n, Jarvis-Web und Browserfenster:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis.ps1
```

Optional unter Windows:

```bat
scripts\start-jarvis.bat
```

Das Skript startet:

- n8n auf `http://localhost:5678`
- Jarvis-Web auf `http://localhost:5173`
- Browserfenster für Jarvis-Web und n8n

## Test mit „Hallo Jarvis“

1. Workflow importieren und in n8n aktivieren.
2. Jarvis starten.
3. Jarvis-Web öffnen: `http://localhost:5173`
4. Im Chat `Hallo Jarvis` senden.
5. Erwartung: Die Weboberfläche zeigt eine Jarvis-Antwort aus `data.output` an.

Direkter Webhook-Test:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6" `
  -ContentType "application/json" `
  -Body '{ "chatInput": "Hallo Jarvis" }'
```

Erwartetes Antwortschema:

```json
{
  "output": "..."
}
```

## Phase 2.5 Project Manager Vorbereitung

Die COO-/Projektmanager-Vorbereitung ist dokumentiert in:

- `docs/roles/manus-coo.md`
- `docs/phase-2-5-project-manager.md`

Diese Vorbereitung definiert nur Rollen, Arbeitsweisen und Akzeptanzkriterien. Es gibt keine echte Manus-API-Integration und keine echte LangGraph-Integration.

## Entwicklung

```bash
npm run lint
npm run build
```
