# Phase 2.8 – Live Board-Agent Connectivity

Phase 2.8 macht die Firmenlogik zur sichtbaren Hauptlogik:

**Jarvis → CEO ChatGPT → COO Manus → CTO Codex → COO Manus Review → CEO ChatGPT Assessment → Jarvis → Mensch**

Phase 2.7 bleibt die Grundlage: Manus ist als COO Web Operator mit Human Approval First modelliert. Phase 2.8 bettet diesen Web Operator in eine sichtbare Board Execution Chain ein und prüft ehrlich, welche externen Verbindungen wirklich vorhanden sind.

## Ziel

Jarvis soll nicht nur Prompts zum Kopieren erzeugen, sondern als zentrale Oberfläche den Fluss, Zuständigkeiten, Freigaben, Verbindungsstatus und Rückweg zeigen. Technische Schichten wie MCP, API, n8n, GitHub und Tool Registry bleiben Hintergrund-Infrastruktur.

## Jetzt verbunden oder lokal aktiv

- CEO ChatGPT Layer: lokal aktiv; Executive Decisions werden erzeugt und gespeichert.
- n8n Chat Bridge: aktiv vorbereitet; der bestehende Vertrag bleibt unverändert: Frontend sendet `{ chatInput: userMessage }` und liest `data.output`.
- Local Task Store: localStorage speichert Executive Decisions, Board Chains, Command-Bus-Tasks und Approval States.
- COO Manus: lokale Delegation, Research-Briefing und operative Review-Templates aktiv.

## Vorbereitet

- CTO Codex: Codex-Aufträge, Tests, Secret-Regeln und PR-Handoff werden vorbereitet.
- GitHub: Issue-Drafts werden lokal erstellt/kopierbar gemacht; echte API-Aktion bleibt blockiert.
- MCP/API Tool Layer: `detectCapabilities`, `createManusTask`, `createCodexTask`, `createGitHubIssueDraft`, `markHumanApproval`, `prepareN8nExecution`, `readTaskState`, `writeTaskState` und `exportTaskState` sind als Tool-Vertrag modelliert.
- CSO Claude und CFO Finance: Rollen sind vorbereitet, aber ohne echte externe Verbindung.

## Was fehlt

- Manus API/Webhook/MCP ist nicht konfiguriert.
- Codex direkte Ausführung ist nicht verbunden.
- GitHub Issue/PR API benötigt serverseitigen Connector und Secret außerhalb des Frontends.
- Separater n8n Execution-Handoff-Workflow ist nur dokumentiert/geplant; der Chat-Workflow bleibt unverändert.

## Manus Web Operator Rechte

Manus darf lokal für Web Research, Geschäftsmodellanalyse, Monetarisierung, Wettbewerberprüfung, Sprintplanung, Codex-Folgeauftrag und operativen Review vorbereitet werden. Login, externe Browser-Aktionen, Uploads, Löschungen, Käufe, Zahlungen, Vertragsabschlüsse oder Account-Änderungen bleiben ohne explizites menschliches GO blockiert.

## Codex/GitHub Rechte

Codex-Aufträge enthalten CEO-Kontext, Manus-Plan, Ziel, Dateien/Module, Anforderungen, Tests, Secret-Regeln sowie klare Verbote: kein Merge und kein Deploy ohne menschliches GO. GitHub Issue-Erstellung und PR-Statusprüfung sind disabled, solange kein sicherer Backend-Connector vorhanden ist.

## n8n Orchestrator

n8n bleibt die technische Ausführungsschicht im Hintergrund. Der vorhandene Chat-Workflow darf nicht gebrochen werden. Ein separater Execution-Handoff kann später Jarvis → n8n → externe APIs/Tools → Jarvis-Rückmeldung abbilden, mit Secrets nur in n8n oder serverseitiger Umgebung.

## Human Approval First und Rückweg

Der Rückweg ist explizit modelliert:

1. Codex Result Report
2. Manus Operational Review
3. CEO Final Assessment
4. Jarvis Human Report
5. Menschliche Entscheidung: GO, Änderung oder Ablehnung

Jarvis behauptet keine externe Ausführung, solange keine echte Verbindung vorhanden ist.
