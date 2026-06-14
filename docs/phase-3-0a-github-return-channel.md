# Phase 3.0a – GitHub Rückkanal + Codex PR Status

Stand: 2026-06-14

Phase 3.0a ergänzt Jarvis um einen ehrlichen GitHub-Rückkanal für Codex-Arbeit. Ziel ist, dass Jarvis Issue, Branch, Commit, PR, Checks, Review und Blocker anzeigen kann, ohne GitHub Tokens oder andere Secrets in den Browser zu bringen.

## Umgesetzt

- GitHub-Statusmodell für Codex-Rückmeldungen:
  - `issueUrl`
  - `issueNumber`
  - `branchName`
  - `commitSha`
  - `prUrl`
  - `prNumber`
  - `prStatus`
  - `checksStatus`
  - `reviewStatus`
  - `blockerNotes`
  - `lastUpdatedAt`
  - `humanApprovalRequired`
- Anzeige im CTO Codex / GitHub Bereich:
  - GitHub Issue URL
  - Branch Name
  - Commit SHA
  - PR URL
  - PR Status
  - Checks
  - Review Status
  - Blocker
  - nächste notwendige Freigabe
- Lokale Copy/Paste-Statusübernahme, solange kein Live-Connector verbunden ist.
- GitHub Capability Detection bleibt ehrlich: Ohne sicheren Connector zeigt Jarvis `needs_connector` oder `needs_secret`, erklärt den Grund und hält Live-Buttons deaktiviert.

## Sicherheitsmodell

- Keine Secrets im Frontend.
- Keine GitHub Tokens im Browser.
- GitHub Live-Lesung nur später über sicheren serverseitigen Connector, n8n Credential/Workflow, GitHub Webhook Receiver oder MCP/GitHub Tool.
- Keine Merge-Funktion.
- Keine Deploy-Funktion.
- Keine direkte GitHub-Aktion aus Jarvis, solange kein sicherer Connector verbunden ist.

## Manueller Rückkanal bis zur Live-Verbindung

Codex oder ein Mensch kann den Status als JSON kopieren und in Jarvis übernehmen. Dadurch bleibt der Rückkanal auditierbar, ohne eine Live-Verbindung vorzutäuschen. Jarvis zeigt klar an, dass PR-/Checks-/Review-Status nicht live gelesen wird, wenn `liveStatusConnected` false ist.

Beispiel:

```json
{
  "issueUrl": "https://github.com/org/repo/issues/123",
  "issueNumber": "123",
  "branchName": "phase-3-0a-github-return-channel",
  "commitSha": "abc1234",
  "prUrl": "https://github.com/org/repo/pull/456",
  "prNumber": "456",
  "prStatus": "open",
  "checksStatus": "passing",
  "reviewStatus": "required",
  "blockerNotes": "Wartet auf menschliche Prüfung.",
  "humanApprovalRequired": true
}
```

## n8n Chat-Vertrag

Unverändert:

- Frontend sendet `{ chatInput: userMessage }`.
- Frontend liest `data.output`.

GitHub-/Codex-Execution wird nicht in den bestehenden Chat-Webhook gemischt.

## Nicht-Ziele

- Kein Manus-Ausbau.
- Kein Workspace-Runner.
- Kein Merge.
- Kein Deploy.
