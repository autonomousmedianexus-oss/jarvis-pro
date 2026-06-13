# Phase 2.5c – Manus COO First Activation

Phase 2.5c aktiviert Manus sichtbar als COO-Delegationsziel in Jarvis Pro. Die Aktivierung ist bewusst vorbereitend: Jarvis erzeugt strukturierte Manus-Briefings und kopierbare Aufträge, führt aber keine externe Manus-Aktion aus, solange keine sichere Manus-API oder Integration verbunden ist.

## Was ist Manus als COO?

COO Manus ist die operative Koordinationsrolle im Jarvis-Agent-Routing. Manus ist zuständig für Sprintplanung, Task-Breakdown, operative Koordination, Fortschrittsberichte, Codex-Aufträge vorbereiten, Rückfragen an den Menschen formulieren und Blocker sichtbar machen.

## Was darf Manus in Phase 2.5c?

- Als Delegationsziel im UI den Status `DELEGATION BEREIT` anzeigen.
- Aus Command-Bus-Aufgaben ein Manus COO Briefing erzeugen.
- Kopierbare Manus-Aufträge für manuelle Übergabe vorbereiten.
- Tasks als lokale COO-Aufgaben markieren.
- Auf menschliche Freigabe warten.
- Bei kombinierten Manus-/Codex-Anfragen eine operative Codex-Übergabe als Entwurf formulieren.

## Was darf Manus noch nicht?

- Keine externe Manus-Ausführung starten.
- Keine unkontrollierten API-Aufrufe durchführen.
- Keine technische Umsetzung an Codex auslösen.
- Keine n8n-Automation außerhalb des bestehenden Chat-Vertrags starten.
- Keine Entscheidungen ohne menschliche Freigabe treffen.

## Wie funktioniert das Manus-Briefing?

Wenn der lokale Command Bus eine Manus-Aufgabe erkennt, erzeugt Jarvis ein strukturiertes Briefing mit Ziel, Kontext, gewünschtem Ergebnis, Aufgabenliste, Priorität, Abhängigkeiten, offenen Fragen, benötigter menschlicher Freigabe, erwartetem Output und nächstem Schritt.

## Wie funktioniert Freigabe?

Alle Manus-Delegationen benötigen standardmäßig `requiresHumanApproval = true`. Der Status lautet `needs_approval` beziehungsweise „wartet auf Freigabe“. Eine lokale Freigabe-Markierung in der UI startet keine externe Aktion; sie dokumentiert nur, dass der Mensch den Task als COO-Aufgabe vormerken möchte.

## Wie wird ein Manus-Auftrag kopiert oder weitergegeben?

Das Manus-Panel enthält die Aktion „Manus-Auftrag kopieren“. Der kopierbare Auftrag enthält Rolle, Projekt, Auftrag, Kontext, Ziele, Einschränkungen, gewünschten Output, Rückfragen, Freigabe-Regeln und eine mögliche Übergabe an Codex.

## Wie hängt Manus mit Codex zusammen?

Wenn ein User Manus und Codex gleichzeitig erwähnt, entstehen getrennte Command-Bus-Tasks: COO Manus für Sprintplan und operative Planung sowie CTO Codex für technische Prüfung oder Implementierungsvorbereitung. Das Manus-Briefing enthält dann den Hinweis, nach der Sprintplanung einen Codex-Auftrag vorzubereiten, aber keine technische Umsetzung ohne menschliche Freigabe zu starten.

## Nächste Ausbaustufe

Die nächste Stufe wäre eine echte Manus-Integration oder API, falls verfügbar. Vorher braucht Jarvis einen sicheren Integrationsvertrag mit Authentifizierung, Audit-Log, expliziter Freigabe, Fehlerbehandlung und klarer UI-Kennzeichnung, wann eine externe Aktion tatsächlich gestartet wurde.

## Phase 2.6 Update — Manus unter CEO-Steuerung

Manus ist lokal als COO-Delegationsschicht aktiv, aber ausdrücklich unter dem CEO ChatGPT Layer eingeordnet. Der CEO Layer interpretiert und priorisiert zuerst; der Command Bus erstellt danach Manus-Tasks.

- Status in Jarvis-Web: **DELEGATION AKTIV**.
- Lokale COO-Delegation: aktiv.
- Externe Manus-Integration: nicht verbunden / vorbereitet.
- Ausführung: wartet auf menschliche Freigabe.

### Delegation Actions

Jarvis erzeugt Manus-Briefings, macht sie sichtbar und erlaubt das Kopieren über die lokale Delegation Bridge. Lokale Freigabe markiert nur den Status; es wird keine externe Manus-Ausführung gestartet.

### Manus/Codex Pipeline

Manus-Briefings enthalten eine mögliche Codex-Folgeaufgabe. Codex-Aufträge enthalten explizit: keine Änderung, kein Commit, kein PR ohne menschliches GO.
