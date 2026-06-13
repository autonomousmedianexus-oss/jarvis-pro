# Phase 2.9 – GitHub/Codex Live Handoff

## Ziel
Phase 2.9 bereitet den ersten echten technischen Handoff-Kreislauf von Jarvis Richtung GitHub/Codex vor: Mensch → Jarvis → CEO ChatGPT → COO Manus → CTO Codex → GitHub-Issue-Draft → menschliches GO → sichere externe Erstellung, sobald ein Connector vorhanden ist.

## Warum GitHub/Codex zuerst
GitHub Issues und spätere Pull Requests sind ein kontrollierbarer Übergabepunkt für Codex-Arbeit. Jarvis kann Anforderungen, Risiken, Akzeptanzkriterien und Sicherheitsregeln vorbereiten, ohne Secrets ins Frontend zu bringen oder automatisch zu mergen.

## GitHub Capability Detection
Jarvis modelliert folgende Statuswerte: `connected`, `needs_secret`, `needs_connector`, `prepared`, `unavailable`, `failed`.

Die UI zeigt:
- ob eine serverseitige GitHub-Konfiguration markiert ist,
- ob n8n als möglicher Orchestrator vorhanden ist,
- ob Issue-Erstellung aus Jarvis möglich ist,
- ob PR-/Issue-Status gelesen werden kann,
- was fehlt, falls eine Aktion deaktiviert bleibt.

Aktuell gilt ohne sicheren Connector: GitHub Issue API nicht verbunden. Erforderlich ist ein serverseitiger GitHub Connector, ein n8n Credential oder ein MCP/GitHub Tool. GitHub Tokens dürfen nicht im Frontend liegen.

## Issue Draft
Aus einem Codex-Handoff entsteht ein GitHub-Issue-Entwurf mit `title`, `body`, `labels`, `priority`, Board-/Decision-/Manus-/Codex-Bezügen, `humanApprovalRequired`, `riskNotes`, `acceptanceCriteria`, `testPlan`, `noSecretsNotice` und `noMergeNotice`.

Der Body enthält CEO-Kontext, Manus-Plan, Codex-Auftrag, betroffene Dateien/Module, Anforderungen, Nicht-brechen-Regeln, Tests, Sicherheitsregeln sowie die Anweisung: nach Umsetzung Commit + PR erstellen, nicht mergen, auf menschliche Prüfung warten.

## Issue Creation nach GO
Die UI bietet Anzeige, Kopieren und Capability-Prüfung. Echte Issue-Erstellung bleibt deaktiviert, bis ein sicherer Backend-/n8n-/MCP-Connector verbunden ist. Auch bei Verbindung ist ein menschliches GO erforderlich. Erfolgreiche Issue-Nummer/URL werden später im Task-State gespeichert; Secrets werden nicht geloggt.

## Codex-Handoff
Das Codex-Handoff enthält `title`, `objective`, `ceoContext`, `manusPlan`, `implementationRequirements`, `filesLikelyAffected`, `constraints`, `securityRules`, `testPlan`, `expectedOutput`, `branchPrRules` und `humanApprovalRules`.

Regeln: kein Commit ohne GO, kein Merge, kein Deploy, keine Secrets, bestehender n8n-Vertrag bleibt unverändert, Commit + PR nur nach Umsetzung und Freigabe.

## PR-/Issue-Statusmodell
Vorbereitet ist `githubHandoffStatus` mit: `draft`, `copied`, `locally_approved`, `issue_ready`, `issue_created`, `codex_pending`, `codex_in_progress`, `pr_created`, `pr_review_required`, `approved_by_human`, `blocked`, `failed`.

Ohne GitHub-Verbindung bleibt Statuslesen lokal vorbereitet und der Button zeigt den fehlenden Connector-Grund. Merge-Aktionen werden nicht implementiert.

## n8n als möglicher GitHub-Orchestrator
n8n kann später als sichere Orchestrierungsschicht dienen: Jarvis → separater n8n Execution Webhook → GitHub Issue erstellen → Status zurück an Jarvis. Der bestehende Jarvis Chat Workflow wird nicht geändert und bleibt beim Vertrag `{ chatInput: userMessage }` → `data.output`.

## Human Approval First
Externe Aktionen brauchen GO: GitHub Issue erstellen, Codex-Handoff extern übergeben, PR-/Issue-Status per API lesen, Manus Login/Webaktionen. Merge und Deploy erfolgen niemals automatisch.

## Was verbunden ist / was fehlt
Verbunden/lokal aktiv: CEO/n8n Chat Bridge, COO Manus lokal, MCP Tool Layer vorbereitet, Local Task Store. Fehlend für echte GitHub-Aktionen: serverseitiger GitHub Connector, n8n GitHub Credential/Workflow oder MCP/GitHub Tool.
