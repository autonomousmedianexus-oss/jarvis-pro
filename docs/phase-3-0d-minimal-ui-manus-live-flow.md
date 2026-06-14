# Phase 3.0d – Minimal Jarvis UI + Manus Live Flow

## Ziel
Jarvis fokussiert den Hauptchat als direkte Gesprächsoberfläche zwischen Inhaber und CEO ChatGPT. Agenten, Governance, Command Bus, Live-Verbindungen und Diagnose bleiben sichtbar, aber kompakt und nur bei Bedarf expandiert.

## Minimal Interface
Die Hauptansicht zeigt nur den Kernfluss:

- Jarvis Logo/Titel
- Modus: Gespräch, Delegation oder Ausführung
- Benutzerbefehl und Jarvis-Antwort im Chat
- großes Eingabefeld
- Senden, Stoppen, Neue Anfrage und Konversation zurücksetzen

Links und rechts sind Agenten- und Statusbereiche verdichtet. Details sind über kompakte, aufklappbare Bereiche verfügbar, damit die 1366px-Laptop-Ansicht nicht vom Command Center überladen wird.

## Gespräch vs. Delegation
Normale Nachrichten wie „hallo“, „was hältst du davon?“ oder „KI-Agentur für lokale Unternehmen“ bleiben im Gesprächsmodus. Jarvis erzeugt dabei keine ManusTask, keinen Command-Bus-Task und keine externe Delegation.

Klare Aufträge wie „Bereite Manus vor …“, „Prüfe operativ mit Manus …“, „GO Research“, „Manus live senden“ oder „Erstelle CodexTask“ wechseln in Delegation oder Ausführung.

## Manus Live Flow
Der Button **Research-GO erteilen** markiert die Recherchefreigabe lokal. Der Button **Manus live senden** und Chatbefehle wie **GO Research und Manus live senden** starten denselben Live-Send-Ablauf:

1. `sending_to_manus`
2. `/api/manus/task` wird serverseitig aufgerufen
3. Erfolg: `task_sent` oder `report_ready`
4. Fehler: `failed` plus `error_message`

Wenn eine Manus Task ID oder ein Link zurückkommt, zeigt Jarvis diese Werte an. Falls kein Link geliefert wird, zeigt Jarvis den Hinweis: „Bitte in Manus unter Neue Aufgabe / Agent / Verlauf prüfen“.

## Server-Sicherheit
`MANUS_API_KEY` und `MANUS_API_URL` bleiben ausschließlich serverseitig. Der Browser sendet nur den ManusTask an `/api/manus/task`. Der Proxy verwendet `x-manus-api-key` und loggt keine Secrets.

## Report-Felder
Jarvis zeigt ManusReport strukturiert mit:

- summary
- findings
- risks
- recommendation
- sourcesChecked
- blockers
- codexTaskDraft
- approvalNeeded

## Sicherheitsregeln
Ohne explizites GO erlaubt: Diskussion, Task-Vorbereitung und öffentliche Recherche-Vorbereitung. Nur mit GO erlaubt: Research an Manus senden und Codex-Handoff vorbereiten. Weiterhin blockiert ohne Spezial-GO: Login, Account-Zugriff, Formulare, Käufe, Zahlungen, Uploads, externe Aktionen mit Wirkung, Commit/PR, Merge und Deploy.
