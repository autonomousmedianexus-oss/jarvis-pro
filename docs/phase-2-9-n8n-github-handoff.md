# Phase 2.9 – n8n GitHub Handoff Entwurf

Der bestehende Jarvis Chat Workflow bleibt unverändert. Für GitHub soll ein separater Execution-Handoff-Workflow entstehen.

## Zielbild
1. Jarvis erzeugt lokalen Codex-Handoff und GitHub-Issue-Draft.
2. Mensch gibt explizites GO für Issue-Erstellung.
3. Jarvis sendet den Draft an einen separaten n8n Execution Webhook.
4. n8n nutzt ein lokal gespeichertes GitHub Credential.
5. n8n erstellt das Issue und gibt Nummer/URL an Jarvis zurück.

## Sicherheitsregeln
- GitHub Token ausschließlich in n8n Credentials oder serverseitiger Umgebung.
- Kein Token im Frontend.
- Keine Änderung am Chat-Webhook-Vertrag.
- Kein Merge/Deploy über diesen Workflow.
- Fehler und fehlende Credentials werden sauber an Jarvis zurückgegeben.
