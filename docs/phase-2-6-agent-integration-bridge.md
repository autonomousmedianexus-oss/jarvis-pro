# Phase 2.6 — CEO Orchestration & Agent Integration Bridge

Phase 2.6 macht Jarvis-Web zur lokalen Agenten-Arbeitsoberfläche mit sichtbarer und logischer CEO-Orchestrierung vor jeder Delegation.

## Ziel

Die Zielarchitektur bleibt:

**Mensch / Owner → Jarvis-Web Interface → CEO ChatGPT Layer → Command Bus / Task-Orchestrator → Agent Routing → Rückmeldung an Jarvis → menschliche Freigabe**

Agent Routing umfasst COO Manus, CTO Codex, CSO Claude, CFO Finanzen und n8n Automation.

## Warum CEO ChatGPT vor Manus und Codex steht

Der CEO ChatGPT Layer ist strategische Steuerung, Priorisierer und Freigabe-Schutz. Manus plant operativ und Codex prüft/implementiert technisch erst nach menschlichem GO. Dadurch verschwinden CEO und Owner nicht aus der Architektur.

## Lokal vs. API

Phase 2.6 unterscheidet bewusst zwischen lokal vorbereiteten Delegationsartefakten und echten externen Integrationen. Jarvis darf Briefings, Prompts und Status erzeugen, aber keine externe Manus-/Codex-Ausführung vortäuschen.

## Echt verbunden / vorbereitet

- n8n Bridge: aktiv; Frontend sendet weiterhin `{ chatInput: userMessage }` und liest `data.output`.
- Voice/TTS: OpenAI-TTS lokal vorbereitet, Browser-Fallback vorhanden.
- CEO Layer / Command Bus: lokal aktiv im Frontend.
- Manus COO: lokale Delegation aktiv; externe Manus-Integration nicht verbunden.
- Codex CTO: Prompt-/PR-Workflow vorbereitet; direkte externe Ausführung nicht verbunden.
- Human Approval: aktiv.

## Delegationsablauf

1. Nutzer spricht oder schreibt mit Jarvis.
2. `generateExecutiveDecision(message, context)` erstellt eine Executive Decision.
3. Command Bus erzeugt Task-Karten aus derselben Task-Liste, die gerendert und gezählt wird.
4. Manus-Tasks erzeugen Manus-Briefings.
5. Codex-Tasks erzeugen Codex-Aufträge.
6. Nutzer kann Summary, Briefing oder Auftrag anzeigen, kopieren und lokal freigeben.
7. Status bleibt sichtbar; externe Systeme bleiben als nicht verbunden gekennzeichnet.

## Human Approval First

Kritische Aktionen, externe Ausführung, Automationen, Codeänderungen, Commits und PRs benötigen menschliches GO. Lokale Freigabe ändert nur den Status in Jarvis-Web.

## Nächste Schritte

- Sichere Backend-Connectoren für Manus/Codex evaluieren.
- Authentifizierung und Audit-Log für externe Übergaben ergänzen.
- Freigabe-Workflow serverseitig persistieren.
- Echte Connectoren erst nach Secret-/Security-Konzept aktivieren.
