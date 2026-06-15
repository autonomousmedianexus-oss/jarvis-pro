# Phase 3.1 – End-to-End Agent Chain

Phase 3.1 bereitet die vollständige, sichere Agentenkette vor:

Inhaber → Jarvis → CEO ChatGPT → COO Manus → CTO Codex → GitHub Pull Request → COO Manus Review → CEO ChatGPT Bewertung → Jarvis → Inhaber.

## Manus → Jarvis Rückkanal

Nach `task.create` speichert Jarvis die zurückgelieferte `task_id` als Manus Task ID, setzt den sichtbaren Status auf `task_sent` und zeigt die ID im COO-Manus-Panel an. Der serverseitige Dev-Proxy nutzt Manus API v2 mit:

- Base URL: `MANUS_API_URL` (Default/Beispiel: `https://api.manus.ai/v2`)
- Header: `x-manus-api-key`
- `POST /task.create`
- `GET /task.listMessages?task_id=<task_id>`

Der Browser ruft nur lokale Jarvis-Routen auf. Secrets werden nicht an das Frontend ausgeliefert.

## ManusReport Normalisierung

Jarvis normalisiert Manus-Antworten und `task.listMessages` in ein `ManusReport` mit:

- `summary`
- `findings`
- `risks`
- `recommendation`
- `sourcesChecked`
- `blockers`
- `codexTaskDraft`
- `approvalNeeded`
- `lastMessage`
- `errorMessage`

Sichtbare Statuswerte: `task_sent`, `in_progress`, `report_ready`, `failed`, `last_message`, `error_message`.

## Manus → Codex Handoff

Aus einem vorhandenen `ManusReport` entsteht ein `CodexTaskDraft` mit ID, Titel, Objective, Manus-Referenz, Anforderungen, Dateien, Akzeptanzkriterien, Testplan, Risiken, Sicherheitsregeln, Erstellzeit und Status.

Codex wird nicht automatisch gestartet. Jarvis akzeptiert erst nach explizitem Codex-GO folgende Chat-Befehle:

- `GO Codex`
- `Codex-GO`
- `Übergib an Codex`
- `Starte Codex-Handoff`

Ohne sicheren Codex-Connector bleibt der Status `needs_codex_connector`; der Auftrag ist kopierbar.

## Codex → GitHub PR Workflow

Der vorbereitete Codex-Auftrag fordert nach Codex-GO:

1. Branch erstellen.
2. Code ändern.
3. `npm run lint` ausführen.
4. `npm run build` ausführen.
5. `git status` prüfen.
6. Commit erstellen.
7. Pull Request gegen `main` erstellen.
8. PR-Link, Commit SHA, Branch Name und Teststatus zurückgeben.

Verbote: kein Commit auf `main`, kein Merge, kein Deploy, keine Secrets, keine API-Keys im Frontend, keine unbegründeten Löschungen.

## GitHub → Jarvis Rückkanal

Jarvis kann PR-Daten manuell aufnehmen und anzeigen:

- `prUrl`
- `prNumber`
- `branchName`
- `commitSha`
- `checksStatus`
- `changedFiles`
- `blockers`
- `reviewStatus`
- `lastUpdatedAt`

Ohne GitHub-Connector zeigt Jarvis `needs_github_connector`/nicht verbunden und erlaubt manuelle Statusübernahme.

## GitHub → Manus Review → CEO Final Review

Nach PR-Datenübernahme kann Jarvis die Manus-Review-Vorlage und CEO-Entscheidungsvorlage darstellen. Manus darf prüfen, aber nicht mergen. Merge ist nur mit exakt `GO Merge PR #...` erlaubt und in dieser Phase nicht automatisiert.

CEO Final Review umfasst Ergebnis, PR-Link, Tests, Risiken, Manus-Empfehlung, CEO-Empfehlung, nächste erlaubte Entscheidung und benötigtes GO.

## Manus MCP / Browser Operator

Jarvis erkennt serverseitig `MANUS_MCP_URL`, `MANUS_BROWSER_OPERATOR_CONNECTOR_URL` und weitere sichere Connector-Werte. Wenn vorhanden: `manus_mcp_ready` und Tools sichtbar. Wenn nicht vorhanden: `manus_mcp_not_configured`. Die API-Rückkette funktioniert unabhängig davon.

## Sicherheitslogik

- Public Research-GO: öffentliche Recherche.
- Login-GO: Login nur für konkret genannte Seite/Aufgabe.
- Action-GO: konkrete externe Aktion mit Wirkung.
- Codex-GO: Codex-Handoff.
- Merge-GO: nur exakt `GO Merge PR #...`.
- Deploy-GO: separat.

Manus darf ohne explizites GO niemals Login durchführen, Accounts ändern, Formulare absenden, Käufe/Zahlungen auslösen, Uploads machen, Codex starten, Commit/PR erstellen, mergen oder deployen.

## Nicht geändert

- Kein großes UI-Redesign.
- ChatGPT direct bleibt erhalten.
- Conversational CEO Mode bleibt erhalten.
- Manus `task.create` bleibt erhalten.
- n8n-Fallback bleibt unverändert mit `{ chatInput: userMessage }` → `data.output`.
