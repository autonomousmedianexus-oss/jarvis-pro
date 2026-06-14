# Phase 3.0b – Conversational CEO Mode + ChatGPT → Manus Bridge

## Ziel
Jarvis ist die Kommunikationsoberfläche des Inhabers zum CEO ChatGPT. Der Mensch spricht normal mit Jarvis; Jarvis antwortet im CEO-Modus, ohne jede Nachricht als Auftrag zu behandeln. Die Agentenkette startet erst bei klarer Delegationsabsicht oder explizitem GO.

## Conversational CEO Mode
Normale Nachrichten wie „hallo“, „test“, „was hältst du davon?“, „wie gehen wir weiter?“ oder Unsicherheit werden als Gespräch behandelt. Ergebnis:

- normale, direkte CEO-Antwort
- keine Executive Summary
- kein Command-Bus-Task
- kein ManusTask
- keine Agenten-Delegation

Der CEO-Modus bleibt strategisch, priorisierend, risikobewusst und umsetzungsorientiert. Die Entscheidungshoheit bleibt beim Menschen.

## Auftragserkennung
Jarvis unterscheidet vier Modi:

1. `conversation` – normale Unterhaltung, keine Delegation.
2. `status` – technische Statusantwort, keine Delegation.
3. `clarify` – unklare Absicht, kurze Rückfrage.
4. `delegation` – klarer Auftrag, Executive Decision und Task-Erzeugung.

Klare Delegationssignale sind unter anderem:

- „prüfe diese Idee“
- „recherchiere das“
- „bereite Manus vor“
- „erstelle einen ManusTask“
- „gib das an Manus weiter“
- „mach daraus einen operativen Auftrag“
- „starte Research“
- „GO Research“
- „GO Manus“
- „erstelle Codex-Auftrag“
- „bereite Umsetzung vor“

Unklare Signale wie „mach das“ lösen nur eine Rückfrage aus: Was genau soll Manus prüfen oder vorbereiten?

## ManusTask-Modell
Bei klarem Manus-Auftrag wird lokal ein ManusTask erzeugt:

- `id`
- `title`
- `objective`
- `sourceUserRequest`
- `assignedBy: CEO ChatGPT`
- `assignedTo: COO Manus`
- `taskType`
- `researchQuestions`
- `allowedActions`
- `blockedActions`
- `approvalRequired`
- `requiredApprovalType`
- `expectedOutput`
- `status: task_prepared`
- `createdAt`
- `updatedAt`

Der Task wird im COO-Manus-Bereich angezeigt und als Copy/Handoff verfügbar gemacht.

## ChatGPT → Manus Bridge
Wenn CEO ChatGPT Manus als zuständig erkennt, wird die Bridge lokal vorbereitet:

- Status: `task_prepared`
- Research-GO erforderlich
- Login-GO separat erforderlich
- Action-GO separat erforderlich
- Manus Live Button nur aktiv, wenn ein sicherer serverseitiger Connector erkannt wird

## Manus Live Connector Detection
Jarvis prüft nur Konfiguration, die auf einen serverseitigen Connector hindeutet. Frontend-Tokens sind verboten.

Statuswerte:

- `manus_live_connected` – sicherer serverseitiger Connector konfiguriert
- `needs_manus_connector` – keine sichere Manus API/MCP/Webhook/Browser-Operator-Bridge vorhanden

Ohne Connector bleibt „Manus live senden“ deaktiviert und der Copy/Handoff-Weg ist aktiv.

## Sicherheitsgrenzen
Automatisch erlaubt:

- öffentliche Recherche vorbereiten
- Analyseauftrag formulieren
- Wettbewerbsanalyse vorbereiten
- Website-Prüfung vorbereiten
- Codex-Prompt später vorbereiten

Blockiert ohne explizites GO:

- Login
- Account-Zugriff
- Formulare absenden
- Käufe
- Zahlungen
- Uploads
- externe Aktionen mit Wirkung
- Merge
- Deploy

## ManusReport-Modell
Das Rückgabeformat ist vorbereitet mit:

- `status`
- `summary`
- `findings`
- `risks`
- `recommendation`
- `sourcesChecked`
- `blockers`
- `codexTaskDraft`
- `approvalNeeded`

## n8n-Fallback-Vertrag
Der bestehende n8n-Chatvertrag bleibt unverändert:

- Frontend sendet `{ chatInput: userMessage }`
- Frontend liest `data.output`

n8n bleibt Fallback nach `/api/chatgpt`.
