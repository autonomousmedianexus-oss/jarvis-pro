# Phase 2.5b – CEO Layer + Command Bus + Manus COO Vorbereitung

Phase 2.5b erweitert Jarvis Pro um eine lokale, vorbereitende Command-Bus-Struktur. Die bestehende n8n-Bridge bleibt unverändert: Jarvis-Web sendet weiterhin `{ "chatInput": userMessage }` und liest weiterhin `data.output`.

## CEO ChatGPT Layer

Der CEO ChatGPT Layer ist die strategische Steuerungsschicht von PROJEKT JARVIS. Er interpretiert Nutzerabsichten, priorisiert Aufgaben, erkennt Risiken, formuliert nächste Schritte und achtet darauf, dass kritische Aktionen eine menschliche Freigabe benötigen.

Der Mensch bleibt immer die höchste Entscheidungsinstanz. Der CEO Layer darf vorbereiten, strukturieren und empfehlen, aber keine kritischen Entscheidungen eigenmächtig ausführen.

## Command Bus

Der Command Bus ist das interne Auftragsbuch und Routing-System. Er ist keine KI-Person und kein externer Agent. In Phase 2.5b läuft er lokal im Frontend und erstellt aus erkannten Nutzerabsichten strukturierte Task-Entwürfe.

Ein Command-Bus-Task enthält unter anderem:

- `id`
- `title`
- `description`
- `sourceMessage`
- `assignedRole`
- `roleLabel`
- `priority`
- `status`
- `requiresHumanApproval`
- `nextAction`
- `createdAt`
- `category`

## Warum ChatGPT nicht einfach nur der Command Bus ist

ChatGPT ist im Zielbild der CEO Layer: eine strategische, interpretierende und beratende Ebene. Der Command Bus dagegen ist eine strukturierte Daten- und Routing-Schicht. Der CEO Layer kann Aufgaben für den Command Bus formulieren, Risiken markieren und Freigaben verlangen. Der Command Bus speichert diese Aufgaben nur nachvollziehbar, statusorientiert und rollenbasiert.

Kurz gesagt:

- CEO ChatGPT denkt, bewertet, priorisiert und formuliert.
- Command Bus strukturiert, dokumentiert und routet.

## Rollenabgrenzung

| Rolle | Bedeutung in Phase 2.5b |
| --- | --- |
| Jarvis | Oberfläche, Stimme und zentrale Kommandozentrale. |
| CEO ChatGPT Layer | Strategische Steuerung, Absichtserkennung, Priorisierung, Risiko- und Freigabelogik. |
| Command Bus | Internes Auftragsbuch mit Rolle, Status, Priorität, Freigabebedarf und nächster Aktion. |
| COO Manus | Vorbereitet für Sprintplanung, Task-Breakdown, Fortschrittsberichte und operative Koordination. |
| CTO Codex | Vorbereitet für technische Umsetzung, Code-, Repo- und GitHub-Aufgaben. |
| CSO Claude | Vorbereitet für Strategie, Analyse, Risiko und Sparring. |
| CFO Finanzen | Geplant für Finanz-, Budget-, Kosten-, Portfolio- und Umsatzlogik. |
| n8n Automation | Aktive lokale Automatisierungsbrücke für den bestehenden Chat-Vertrag; weitere Automationen nur nach Freigabe. |

## Rollenwerte

- `CEO_CHATGPT`
- `COO_MANUS`
- `CTO_CODEX`
- `CSO_CLAUDE`
- `CFO_FINANCE`
- `N8N_AUTOMATION`
- `HUMAN_OWNER`

## Statuswerte

- `draft` – lokaler Entwurf
- `needs_approval` – wartet auf menschliche Freigabe
- `planned` – geplant, aber noch nicht gestartet
- `in_progress` – in Arbeit
- `blocked` – blockiert
- `done` – erledigt

## Kategorien

- `strategy`
- `coding`
- `automation`
- `project_management`
- `finance`
- `research`
- `operations`
- `general`

## Lokales Routing in Phase 2.5b

Die Intent-/Routing-Logik ist bewusst simpel und lokal. Sie erkennt Schlüsselwörter in der Nutzernachricht und erzeugt daraus einen Task-Entwurf:

- Codex, Code, Repo, GitHub, bauen, implementieren → `CTO_CODEX`
- Manus, Sprint, Plan, Projektmanagement, Aufgaben, Roadmap → `COO_MANUS`
- Claude, Strategie, Analyse, Risiko → `CSO_CLAUDE`
- Finanzen, Budget, Kosten, Portfolio, Umsatz → `CFO_FINANCE`
- n8n, Workflow, Automatisierung, Webhook → `N8N_AUTOMATION`
- Entscheidung, Freigabe, kritisch, GO → menschliche Freigabe markieren oder `HUMAN_OWNER`

## Was noch nicht automatisiert ist

Phase 2.5b löst keine externen Agenten aus. Es gibt keine echte Manus-, Claude-, CFO- oder Codex-Automation. Es werden keine externen APIs angesprochen und keine unkontrollierten Aktionen gestartet. Der Command Bus bereitet nur lokal Aufgaben vor und zeigt sie in der UI an.

## Nächste Schritte nach Phase 2.5b

1. Persistenz für Command-Bus-Tasks definieren.
2. Menschliche Freigabe-Workflows in der UI ausarbeiten.
3. Manus-COO-Ansichten für Sprintplanung und Fortschrittsberichte vorbereiten.
4. Sichere Integrationsverträge für Codex, Claude, CFO-Logik und n8n-Automationen definieren.
5. Audit-Logik für Freigaben, Statuswechsel und ausgeführte Aktionen ergänzen.

## Patch 1 – Command Bus Counter, Approval und Multi-Rollen-Erkennung

Der lokale Command Bus kann jetzt mehrere Rollen in einer einzelnen Nachricht erkennen. Wenn ein Nutzer beispielsweise Manus und Codex im selben Kommando erwähnt, werden nach Möglichkeit mehrere getrennte Task-Entwürfe angelegt: ein COO-Manus-Entwurf für Sprint-/Operationsplanung und ein CTO-Codex-Entwurf für Code-, Repo- oder Prüfaufträge.

Die UI zählt erkannte Aufgaben direkt aus der Task-Liste: `0 Aufgaben erkannt`, `1 Aufgabe erkannt` oder die jeweilige Mehrzahl. Im CEO-KOMMANDOBUS werden die letzten Aufgaben breiter und übersichtlicher als kurze Liste angezeigt, inklusive Task-ID, Rolle, Status, Priorität, Freigabebedarf und nächster Aktion.

Der Command Bus führt weiterhin keine externen Aktionen selbst aus. Aufgaben für Codex, Manus, Claude, CFO oder n8n werden nur vorbereitet. Sobald ein Task auf externe Ausführung, eine vorbereitete Agentenrolle, `nextAction` mit Freigabebedarf oder einen Status mit menschlicher Entscheidung hinweist, bleibt `requiresHumanApproval` aktiv. Menschliche Freigabe ist Pflicht, bevor eine externe Aktion ausgelöst werden darf.

## Lokale Jarvis Voice

Die Jarvis-Sprachausgabe nutzt ausschließlich Browser- und System-Stimmen über die Web Speech API. Es werden keine externen TTS-Dienste, keine API-Keys und keine Secrets verwendet.

Die lokale Voice-Konfiguration bevorzugt `de-DE`, wählt nach Möglichkeit eine hochwertige lokale deutsche Stimme und fällt sonst auf geeignete Systemstimmen zurück. Sprechtempo, Pitch und Lautstärke sind so eingestellt, dass Jarvis weniger langsam und weniger abgehackt wirkt. Lange Antworten werden in kleinere Satzabschnitte geteilt, und laufende Ausgabe wird vor einer neuen Antwort gestoppt, damit sich Sprachausgaben nicht überlagern.

Die Qualität hängt vom verwendeten Browser und den lokal installierten Stimmen ab. Eine spätere Premium-TTS-Integration ist geplant, gehört aber nicht zu diesem Patch.
