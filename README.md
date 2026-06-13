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

Der Workflow enthält keine API-Keys, Secrets oder Passwörter. Er stellt einen POST-Webhook bereit und rekonstruiert den früheren KI-Agenten-Aufbau: Webhook → Normalize Chat Input → Jarvis KI-Agent mit OpenAI Chat Model und Simple Memory → Respond to Webhook. Der bestehende Jarvis-Web-Vertrag bleibt unverändert:

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

Nach dem Import den Workflow in n8n prüfen. Der Webhook-Pfad bleibt kompatibel mit der Jarvis-Weboberfläche:

```text
http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6
```

## OpenAI Credential lokal einrichten

Die Workflow-Datei committet bewusst keine Credentials. Der OpenAI Chat Model Node ist als Platzhalter im Workflow enthalten und muss nach dem Import ausschließlich lokal mit einem n8n OpenAI Credential verbunden werden:

1. n8n öffnen: `http://localhost:5678`
2. In n8n zu **Credentials** wechseln.
3. Ein neues OpenAI Credential anlegen.
4. Den API-Key nur in n8n speichern.
5. Keine `.env`, JSON-Exports oder Screenshots mit Secrets committen.
6. Im Workflow den Node **OpenAI Chat Model** öffnen und lokal mit diesem Credential verbinden.
7. Prüfen, dass **Simple Memory** / **Einfacher Speicher** mit dem **Jarvis KI-Agent** verbunden ist.
8. Workflow speichern und aktivieren/veröffentlichen.
9. Vor jedem Export prüfen, dass keine Secrets im JSON enthalten sind.

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

1. Workflow importieren.
2. In n8n den Node **OpenAI Chat Model** lokal mit dem OpenAI Credential verbinden.
3. Prüfen, dass **Simple Memory** / **Einfacher Speicher** verbunden ist.
4. Workflow speichern und aktivieren/veröffentlichen.
5. Jarvis starten.
6. Jarvis-Web öffnen: `http://localhost:5173`
7. Im Chat `Hallo Jarvis` senden.
8. Erwartung: Die Weboberfläche zeigt eine Jarvis-Antwort aus `data.output` an.

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


## Stable Checkpoint: Jarvis Pro Interface v1.1 – AI Agent Restore

Der stabile Restore-Stand v1.1 ist dokumentiert in [`docs/backup-restore.md`](docs/backup-restore.md). Dieser Checkpoint beschreibt, welche Teile in GitHub gespeichert sind, welche Daten lokal in n8n bleiben und wie Jarvis nach Neustart oder Workflow-Verlust wiederhergestellt wird.

Kurzanleitung:

1. n8n starten: `powershell -ExecutionPolicy Bypass -File scripts/start-jarvis.ps1` oder manuell mit `npx n8n start`.
2. Jarvis-Web starten: das Start-Skript startet Vite automatisch; alternativ `npm run dev -- --host 127.0.0.1 --port 5173`.
3. Workflow **Jarvis Pro Interface v1** in n8n prüfen, OpenAI-Credential lokal verbinden und Workflow aktivieren/veröffentlichen.
4. Jarvis-Web unter `http://localhost:5173` öffnen und `Hallo Jarvis` senden.

Weitere Checkpoints stehen in [`docs/phase-checkpoints.md`](docs/phase-checkpoints.md).

## Phase 2.5 Project Manager Vorbereitung

Die COO-/Projektmanager-Vorbereitung ist dokumentiert in:

- `docs/roles/manus-coo.md`
- `docs/phase-2-5-project-manager.md`

Diese Vorbereitung definiert nur Rollen, Arbeitsweisen und Akzeptanzkriterien. Es gibt keine echte Manus-API-Integration und keine echte LangGraph-Integration.


## Phase 2.5b – CEO Layer + Command Bus + Manus COO Vorbereitung

Phase 2.5b ergänzt Jarvis Pro um eine lokale Command-Bus-Vorbereitung im Frontend. CEO ChatGPT wird als strategische Steuerungsschicht sichtbar, während der Command Bus erkannte Nutzerabsichten als strukturierte Task-Entwürfe mit Rolle, Status, Priorität, Freigabebedarf und nächster Aktion anzeigt.

Der Mensch bleibt höchste Entscheidungsinstanz. Phase 2.5b startet keine echte externe Manus-, Claude-, CFO- oder Codex-Automation und verändert den bestehenden n8n/Jarvis-Web-Chat-Vertrag nicht.

Das lokale Interface enthält außerdem eine verbesserte Jarvis-Voice über Browser-/Systemstimmen sowie ein breiteres Command-Center-Layout für Chat, CEO Command Bus, Agent Routing, Human Approval und n8n Bridge.

Details: [`docs/phase-2-5-command-bus.md`](docs/phase-2-5-command-bus.md)

## Entwicklung

```bash
npm run lint
npm run build
```

## Phase 2.5b Patch 2 + Phase 2.5c – Full Screen, Voice-First und Manus COO

Phase 2.5b Patch 2 erweitert Jarvis Pro um ein stärkeres Full-Screen-Command-Center: linke Agentenübersicht, zentrale Jarvis-Konsole und rechter Command-/Statusbereich sind für breite Screens ausbalanciert, während kleinere Screens weiterhin responsiv stacken können.

Jarvis arbeitet jetzt voice-first: Die vollständige n8n-Antwort bleibt intern vorhanden und wird gesprochen; im Chat erscheint standardmäßig eine kurze Summary mit optionalem „Volltext anzeigen“. Der bestehende Chat-Vertrag bleibt unverändert:

- Frontend sendet weiterhin `{ "chatInput": userMessage }`
- Frontend liest weiterhin `data.output`

OpenAI TTS ist optional als lokaler Vite-Dev-Proxy unter `POST /api/tts` vorbereitet. Der API-Key darf nur lokal in `.env` gesetzt werden und wird nicht an das Frontend ausgeliefert:

```bash
OPENAI_API_KEY=your_openai_api_key_here
JARVIS_TTS_PROVIDER=openai
JARVIS_TTS_VOICE=cedar
```

Wenn OpenAI TTS nicht konfiguriert ist oder fehlschlägt, nutzt Jarvis automatisch die Browser-/Systemstimme als Fallback.

Phase 2.5c aktiviert Manus sichtbar als COO-Delegationsziel. Manus kann Briefings und kopierbare COO-Aufträge vorbereiten, aber die externe Manus-Integration ist noch nicht verbunden. Jarvis behauptet nicht, Manus extern auszuführen; alle Manus-Delegationen warten auf menschliche Freigabe.

Details:

- [`docs/phase-2-5-command-bus.md`](docs/phase-2-5-command-bus.md)
- [`docs/phase-2-5c-manus-coo.md`](docs/phase-2-5c-manus-coo.md)

## v1.4 / Phase 2.6 — CEO Orchestration & Agent Integration Bridge

Phase 2.6 macht Jarvis-Web zur zentralen Agenten-Arbeitsoberfläche: Nutzer sprechen oder schreiben mit Jarvis, der CEO ChatGPT Layer interpretiert und priorisiert zuerst, danach strukturiert der Command Bus Aufgaben für Manus, Codex, Claude, CFO oder n8n.

- CEO ChatGPT Layer ist Orchestrator vor Manus/Codex.
- Integrationsstatus zeigt lokal aktive und nur vorbereitete Brücken ehrlich an.
- Manus COO ist lokal als Delegationsschicht aktiv; externe Manus-Integration ist nicht verbunden.
- Codex CTO ist als Prompt-/PR-Workflow vorbereitet; direkte externe Ausführung ist nicht verbunden.
- Keine Secrets, keine API-Keys und kein OpenAI-Key im Frontend.
- Human Approval First: kritische Aktionen, externe Ausführung, Commits und PRs brauchen menschliches GO.

## Phase 2.7 – Manus Web Operator + MCP Governance

Jarvis Pro bereitet Manus als COO Web Operator vor. Manus kann lokal als Briefing-/Research-Ziel für Webseitenanalyse, Geschäftsmodell-Recherche, Monetarisierungsideen, UX-Flows, Landing-Page-Anforderungen, SaaS-Ideenvalidierung, Sprintplanung und Codex-Folgeaufträge modelliert werden.

Human Approval First bleibt verbindlich: keine Logins, Käufe, Zahlungen, Account-Änderungen, Uploads, Löschungen, Vertragsabschlüsse, Code-Generierung, Commit/PR oder Deploy/Merge ohne explizites menschliches GO. Es werden keine Secrets, API-Keys oder Passwörter im Frontend oder Code gespeichert. Fremder geschützter/proprietärer Code darf nicht kopiert werden; Codex muss eigene Umsetzungen bauen.

Die externe Manus-Integration ist noch nicht verbunden. Jarvis-Web zeigt deshalb nur lokale Vorbereitung, Tool-Registry-Status, Freigabemarkierungen und kopierbare Briefings/Prompts an und behauptet nicht, Manus habe eine Webseite extern geprüft.
