# Phase 3.0 – Connector-Report vor Umsetzung

Stand: 2026-06-14

Dieser Report ist der bewusst vorgeschaltete Prüfpunkt für Issue #12. Phase 3.0 wird **nicht** blind komplett umgebaut. Der aktuelle Stand wird zuerst gegen die real vorhandenen Connectoren geprüft und nur eine minimale sichere Umsetzung vorgeschlagen.

## Entscheidungsregeln für Phase 3.0

- Keine Secrets ins Frontend.
- Kein direkter Commit in `main`.
- Kein Merge.
- Kein Deploy.
- Der bestehende n8n-Chat-Vertrag bleibt stabil:
  - Frontend sendet `{ chatInput: userMessage }`.
  - Frontend liest `data.output`.
- Externe Aktionen brauchen einen expliziten menschlichen GO und einen sicheren Connector.

## 1. Jarvis → CEO ChatGPT

**Befund:** Die bestehende Verbindung läuft über den lokalen n8n-Webhook und den dort konfigurierten OpenAI Chat Model Node. Im Frontend ist der Webhook fest auf `http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6` gesetzt. Der Request-Body bleibt `{ chatInput: userMessage }`, die Antwort wird aus `data.output` gelesen.

**Stabilität:** Im Repository ist der Vertrag unverändert dokumentiert und im Frontend unverändert umgesetzt. Ob die Verbindung zur Laufzeit stabil ist, hängt von der lokalen n8n-Instanz, dem aktivierten Workflow und dem lokal hinterlegten OpenAI Credential ab. Diese Credentials sind bewusst nicht im Repository enthalten.

**Status:** `connected_local_if_n8n_running`

**Real möglicher Connector:** bestehender n8n Chat Webhook mit lokalem OpenAI Credential.

**Fehlt für harte Live-Garantie:** Healthcheck/Statusendpoint für n8n Workflow-Aktivierung und Credential-Verfügbarkeit, ohne Secrets offenzulegen.

## 2. CEO ChatGPT → COO Manus

**Befund:** COO Manus ist im aktuellen Projekt als lokale Rolle, Briefing-Generator, Task-Entwurf und Governance-Schicht modelliert. Es gibt keine konfigurierte echte Manus API, keinen Manus MCP Server, keinen n8n Manus Webhook und keinen automatisierten Manus Login.

**Live-Schnittstelle aktuell real möglich:** manueller Handoff über kopierbare Briefings und lokale Statusmarkierung.

**Bewertung der Optionen:**

| Option | Aktuell real? | Bewertung |
| --- | --- | --- |
| API | Nein | Keine Manus API-Konfiguration im Projekt. |
| MCP | Nein | MCP ist als Tool Layer vorbereitet, aber nicht live verbunden. |
| n8n Webhook | Nein | Es gibt keinen separaten Manus Execution Workflow. |
| Manueller Handoff | Ja | Sicherster aktueller Weg: Briefing kopieren, extern/manuell ausführen, Ergebnis zurück einfügen. |
| `needs_connector` | Ja | Ehrlicher Status für echte Automatisierung. |

**Status:** `manual_handoff` / `needs_connector`

**Fehlt für echte Übergabe:** Ein freigegebener, serverseitiger Manus Connector, z. B. separater n8n Execution Webhook mit Credentials in n8n, ein MCP Server oder eine dokumentierte Manus API-Integration.

## 3. COO Manus → Web

**Befund:** Manus Web Operator ist im UI- und Dokumentationsmodell vorbereitet. Es existieren Research-Task-Typen, Briefing-Templates und Freigaberegeln. Es gibt aber keine echte Browser-/Web-Operator-Verbindung, keinen Remote-Browser, keine Login-Automation und keinen Headless-Browser-Connector aus Jarvis heraus.

**Status:** `prepared_only`

**Real möglicher Connector aktuell:** lokale Vorbereitung und manueller Handoff.

**Fehlt:** Sicherer Browser-/Web-Operator-Connector mit klaren Grenzen: erlaubte Domains, kein Credential-Leak, explizite Login-Freigabe, Audit-Log und keine autonomen Käufe/Deployments/Merges.

## 4. COO Manus → CTO Codex

**Befund:** Es gibt bereits ein strukturiertes Codex-Handoff als lokales Modell. Der Handoff enthält Ziel, CEO-Kontext, Manus-Plan, Anforderungen, Sicherheitsregeln, Testplan, erwartete Ausgabe, Branch-/PR-Regeln und Human-Approval-Regeln. Zusätzlich kann ein GitHub-Issue-Draft erzeugt und kopiert werden.

**Status:** `structured_local_handoff_ready`

**Was fehlt für echte Übergabe:**

- Ein Ausführungskanal von Jarvis zu Codex, z. B. GitHub Issue/PR Workflow, Codex CLI/Agent Runner, MCP Tool oder n8n Execution Workflow.
- Ein definierter Input-/Output-Vertrag für Codex-Ergebnisse: geänderte Dateien, Tests, Risiken, PR-Link, offene Fragen.
- Ein Rückkanal, damit Jarvis den Codex-Status nicht nur lokal simuliert, sondern live lesen kann.

## 5. CTO Codex → GitHub

**Befund aus dieser Arbeitsumgebung:** Codex kann in der aktuellen Repository-Umgebung tatsächlich Git-Befehle ausführen, auf dem aktuellen Branch Änderungen committen und über das bereitgestellte PR-Tool einen Pull-Request-Datensatz erstellen. Das erfolgt nicht über das Jarvis-Frontend, sondern über die Codex-Arbeitsumgebung mit lokalem Git und dem bereitgestellten `make_pr` Tool.

**Status in Codex-Arbeitsumgebung:** `available_via_local_git_and_pr_tool`

**Status aus Jarvis-Frontend heraus:** `needs_connector`

**Weg, wenn verfügbar:**

1. Codex arbeitet im Workspace auf einem nicht-`main` Branch.
2. Codex führt lokale Prüfungen aus.
3. Codex erstellt einen Git-Commit auf dem aktuellen Branch.
4. Codex erzeugt den PR über das bereitgestellte PR-Tool bzw. in einer anderen Umgebung über GitHub CLI/API/MCP/n8n.

**Fehlt für Jarvis selbst:** Ein sicherer serverseitiger GitHub Connector, GitHub MCP Tool, GitHub CLI Runner oder n8n GitHub Workflow mit Credentials außerhalb des Frontends.

## 6. CTO Codex → Workspace/Terminal

**Befund aus dieser Arbeitsumgebung:** Codex kann im aktuellen Linux-Workspace `/workspace/jarvis-pro` Kommandos wie `npm run lint`, `npm run build` und `git status` ausführen.

**Einschränkung zur Nutzerpfad-Frage:** Der genannte Windows-Pfad `C:\Jarvis\jarvis-web` ist aus dieser Container-Umgebung nicht direkt derselbe Pfad. In diesem Projekt ist der aktive Repo-Pfad `/workspace/jarvis-pro`.

**Status in Codex-Arbeitsumgebung:** `available_for_current_workspace`

**Status für Jarvis-Frontend → lokales Windows-Terminal:** `needs_secure_local_runner`

**Fehlt für Jarvis selbst:** Ein sicherer lokaler Runner/Connector, der explizit erlaubte Kommandos ausführt, z. B. nur `npm run lint`, `npm run build`, `git status`, mit Arbeitsverzeichnis-Allowlist, Timeout, Audit-Log und ohne Secret-Ausgabe ans Frontend.

## 7. GitHub → Jarvis

**Befund:** Das Projekt modelliert PR-/Issue-Statuswerte und zeigt, dass Statuslesen ohne GitHub-Verbindung nur vorbereitet ist. Es gibt keine echte Live-Rücklesung von GitHub Issue-/PR-Status in Jarvis.

**Status:** `needs_connector`

**Fehlt:** Ein sicherer Rückkanal, z. B. serverseitiger GitHub API Connector, n8n GitHub Workflow, GitHub Webhook Receiver oder MCP/GitHub Tool. Tokens dürfen nicht im Frontend liegen. Der Rückkanal sollte mindestens Issue-Nummer, Issue-URL, PR-URL, Branch, Checks, Review-Status und Blocker liefern.

## Connector-Matrix

| Verbindung | Aktueller realer Stand | Sicherster nächster Connector | Phase-3.0-Empfehlung |
| --- | --- | --- | --- |
| Jarvis → CEO ChatGPT | n8n Chat Webhook lokal vorbereitet/aktiv, abhängig von laufendem n8n und Credential | Bestehenden n8n Chat unverändert lassen; optional Healthcheck | Nicht umbauen, Vertrag schützen |
| CEO ChatGPT → COO Manus | Lokale Briefings/Tasks | Manueller Handoff; später separater n8n/MCP/API Connector | Als `manual_handoff`/`needs_connector` markieren |
| COO Manus → Web | Nur lokale Vorbereitung | Freigegebener Browser-Operator Connector | Nicht automatisieren |
| COO Manus → CTO Codex | Strukturierter lokaler Codex-Handoff | GitHub Issue oder Codex Runner nach GO | Handoff weiter nutzen, Output-Vertrag ergänzen |
| CTO Codex → GitHub | In Codex-Umgebung via Git + PR-Tool möglich; nicht aus Jarvis UI | GitHub MCP/API/n8n serverseitig | Jarvis bleibt bei Draft/Status `needs_connector` |
| CTO Codex → Workspace/Terminal | In Codex-Workspace möglich; nicht zu Windows-Pfad aus Jarvis | Sicherer Local Runner | Allowlist-Runner erst separat bauen |
| GitHub → Jarvis | Nicht live verbunden | GitHub API/n8n/Webhook/MCP serverseitig | Statusmodell beibehalten, Live-Lesen später |

## Minimal sichere Umsetzung für Phase 3.0

1. **Connector-Status ehrlich im Produkt abbilden:** Keine externe Manus-, Browser-, GitHub- oder Terminal-Automation vortäuschen. Statuswerte wie `manual_handoff`, `prepared_only`, `structured_local_handoff_ready` und `needs_connector` sichtbar machen.
2. **Bestehenden n8n Chat schützen:** `POST { chatInput: userMessage }` und `data.output` bleiben unverändert. Keine Secrets ins Frontend und keine Veränderung am Chat-Webhook für Execution-Aufgaben.
3. **Separaten Execution-Kanal planen, nicht in den Chat mischen:** GitHub-/Terminal-/Manus-Ausführung darf nur über separate serverseitige Connectoren oder n8n Execution Webhooks laufen.
4. **Codex-Handoff als kontrollierten Startpunkt verwenden:** Jarvis erzeugt weiter einen strukturierten Codex-Auftrag und GitHub-Issue-Draft. Echte Ausführung erfolgt erst nach menschlichem GO außerhalb des Frontends oder über einen sicheren Connector.
5. **Local Runner nur mit Allowlist:** Falls Phase 3.0 Terminal-Kommandos aus Jarvis anstoßen soll, dann nur über einen lokalen Backend-Runner mit erlaubten Befehlen, festem Workspace, Timeout, Logging und Secret-Filter.
6. **GitHub Rückkanal separat ergänzen:** Issue-/PR-Status live lesen erst über serverseitigen GitHub Connector, n8n GitHub Workflow, GitHub Webhook Receiver oder MCP/GitHub Tool.

## Nicht-Ziele für diesen Schritt

- Kein Merge.
- Kein Deploy.
- Keine Manus-/Browser-Automation ohne Connector.
- Keine GitHub Tokens oder OpenAI Keys im Frontend.
- Keine Änderung des bestehenden n8n Chat-Vertrags.
