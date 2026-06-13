# Phase 2.7 – Manus Web Operator + Monetization Research Pipeline

Phase 2.7 modelliert Manus als **COO Web Operator** unter CEO-Steuerung. Manus ist in Jarvis Pro vorbereitet, aber nicht als echte externe Browser-, API- oder MCP-Integration verbunden. Die UI darf deshalb nur Briefings, lokale Freigabemarkierungen und kopierbare Aufträge zeigen – niemals behaupten, Manus habe eine Webseite bereits extern geprüft.

## Zielarchitektur

1. Mensch / Owner
2. Jarvis-Web Interface
3. CEO ChatGPT Layer
4. Command Bus / MCP Gateway / Tool Registry
5. COO Manus Web Operator
6. CTO Codex
7. GitHub / Code / PR
8. Jarvis Rückmeldung
9. Menschliche Freigabe

Der CEO ChatGPT Layer bleibt vor Manus und Codex. Manus arbeitet operativ unter CEO-Steuerung. Codex setzt technisch nur nach Freigabe um. Der Mensch bleibt höchste Entscheidungsinstanz.

## Manus Capabilities

- `business_model_research`
- `website_review`
- `competitor_scan`
- `monetization_analysis`
- `ux_flow_analysis`
- `landing_page_requirements`
- `saas_idea_validation`
- `task_breakdown`
- `codex_prompt_preparation`
- `progress_report`
- `blocker_detection`

## Erlaubte Aufgaben

Manus darf in dieser Phase lokal vorbereitet werden für:

- Webseitenanalyse öffentlich zugänglicher Informationen.
- Strukturierung von Geschäftsmodellen, Zielgruppen, Angeboten und Monetarisierung.
- Dokumentation von Chancen, Risiken und technischen Anforderungen.
- Ableitung von Landing-Page-, SaaS- oder MVP-Anforderungen.
- Vorbereitung von Codex-Aufträgen, Sprintplänen, Blockern und Rückfragen an den Menschen.

## Verbotene Aufgaben ohne explizites GO

Manus darf nicht ohne explizite menschliche Freigabe:

- sich irgendwo anmelden,
- Accounts ändern,
- Käufe tätigen,
- Zahlungen auslösen,
- Verträge abschließen,
- Daten löschen,
- Uploads oder externe Änderungen ausführen,
- fremden geschützten/proprietären Code kopieren,
- rechtlich oder finanziell bindende Aktionen ausführen.

## Freigabeebenen

1. `research_only` – Manus darf Informationen analysieren.
2. `login_required` – Login nur nach explizitem GO.
3. `external_action` – Klicks, Änderungen, Käufe oder Uploads nur nach GO.
4. `code_generation` – Codex darf Code vorbereiten.
5. `commit_pr` – Codex darf Commit und PR erstellen.
6. `merge_deploy` – nur der Mensch darf Merge/Deploy freigeben.

## MANUS_WEB_RESEARCH_TASK

Der neue lokale Aufgabentyp enthält:

- `id`
- `title`
- `targetUrl`
- `businessModelHypothesis`
- `researchGoal`
- `allowedActions`
- `forbiddenActions`
- `requiredApprovalBeforeLogin`
- `requiredApprovalBeforeExternalAction`
- `expectedOutput`
- `codexFollowUpExpected`
- `status`
- `priority`
- `riskLevel`

Statuswerte: `draft`, `needs_approval`, `approved_for_research`, `approved_for_login`, `in_research`, `report_ready`, `codex_prompt_ready`, `blocked`, `done`.

## Monetization Research Pipeline

1. Nutzerauftrag: „Jarvis, prüfe diese Webseite/Geschäftsidee und finde Monetarisierungsmöglichkeiten.“
2. CEO ChatGPT Layer erzeugt eine Executive Decision mit Ziel, Risiko, Rollen und Freigabebedarf.
3. Command Bus erzeugt einen `MANUS_WEB_RESEARCH_TASK` und optional einen Codex-Folgeauftrag.
4. Jarvis erzeugt ein Manus-Briefing mit Ziel, Webseite/Markt, Prüfpunkten, erlaubten Aktionen, verbotenen Aktionen, erwartetem Report und Codex-Folgeauftrag.
5. Manus-Report-Format:
   - Kurzfazit
   - Geschäftsmodell
   - Zielgruppe
   - Angebot
   - Monetarisierung
   - Traffic-Kanäle
   - technische Anforderungen
   - Risiken
   - MVP-Vorschlag
   - Codex-Auftrag
   - nächste Entscheidung für den Menschen

## Codex Follow-up

Codex-Prompts aus Manus-Reports müssen Ziel, CEO-Kontext, Manus-Ergebnis, gewünschte Umsetzung, ableitbare Dateien/Module, technische Anforderungen, UI/UX-Anforderungen, Tests und Secret-Regeln enthalten. Codex baut eine eigene Umsetzung, kopiert keine geschützten Inhalte, erstellt Commit und PR nur nach GO und merged nicht selbst.

## Externe Integration

Eine echte Manus-API/MCP-/Browser-Integration ist in Phase 2.7 nicht verbunden. Execution Modes bleiben lokal sichtbar als `local`, `prepared`, `mcp_ready`, `external_connected` oder `unavailable`; externe Manus-Ausführung bleibt ohne Integration `prepared`/`mcp_ready`/`unavailable`.


## Phase 2.8 Update – Einbettung in Board Execution Chain

Phase 2.8 baut auf Phase 2.7 auf. Der Manus Web Operator bleibt Human-Approval-First und wird jetzt sichtbar in die Board Execution Chain eingebettet: Jarvis empfängt den Auftrag, CEO ChatGPT bewertet Ziel/Risiko/Priorität, COO Manus plant oder recherchiert, CTO Codex erhält bei Bedarf den technischen Handoff, COO Manus prüft operativ, CEO ChatGPT bewertet final und Jarvis legt dem Menschen den Human Report zur Freigabe, Änderung oder Ablehnung vor.

Die externe Manus-Ausführung bleibt ehrlich blockiert, solange keine Manus API, kein Webhook und kein MCP/Connector konfiguriert sind. Lokale Research- und Login-GO-Markierungen dokumentieren Freigaben nur im Task-State und starten keine externe Aktion.
