# Backup, Restore und Start: Jarvis Pro Interface v1.1

Dieser Sicherheits-Checkpoint dokumentiert den stabilen Stand **Jarvis Pro Interface v1.1 – AI Agent Restore**. Ziel ist, Jarvis nach PC-Neustart, n8n-Problemen oder Workflow-Verlust schnell wiederherzustellen, ohne Secrets in GitHub zu speichern.

## Stabiler Stand v1.1

- Jarvis-Web läuft lokal über Vite.
- n8n Workflow **Jarvis Pro Interface v1** ist importiert und veröffentlicht/aktiviert.
- Workflow-Struktur: `Jarvis Webhook` → `Chat-Eingabe normalisieren` → `Jarvis KI-Agent` → `OpenAI-Chatmodell` → `Einfacher Speicher` → `Jarvis-Ausgabe zurückgeben`.
- Jarvis-Web sendet weiterhin `{ "chatInput": userMessage }`.
- Jarvis-Web liest weiterhin `data.output`.
- Die Antwort bleibt `{ "output": "..." }`.
- Das OpenAI-Credential ist nur lokal in n8n verbunden.
- Der Systemprompt ist aktiv und Jarvis erkennt seine Rolle in **PROJEKT JARVIS**.

## Was dauerhaft in GitHub gespeichert ist

Diese Bestandteile sind reproduzierbar im Repository gespeichert:

- Jarvis-Web Quellcode und Vite/React-Konfiguration.
- Start-Skripte unter `scripts/`.
- Importierbarer n8n Workflow unter `n8n/workflows/jarvis-pro-interface-v1.json`.
- Dokumentation unter `README.md` und `docs/`.

Der Workflow-Export in GitHub darf keine produktiven API-Keys, Passwörter oder Secrets enthalten. Credentials werden nach dem Import lokal in n8n verbunden.

## Was lokal auf dem PC gespeichert ist

Diese Bestandteile liegen nur lokal und müssen bei Problemen separat geschützt oder erneut eingerichtet werden:

- n8n-Datenbank, lokale n8n-Einstellungen und Credentials im Benutzerprofil.
- OpenAI-Credential in n8n.
- Lokale Node-/npm-Installation und npm-Cache.
- Der lokale Checkout des Repositories.

## Ordner, die nicht gelöscht werden dürfen

Auf dem Windows-PC dürfen diese Ordner nicht gelöscht werden, solange dieser lokale Stand erhalten bleiben soll:

```text
C:\Jarvis\jarvis-web
C:\Users\Argo-.n8n
```

- `C:\Jarvis\jarvis-web` enthält den lokalen Projektordner/Checkout.
- `C:\Users\Argo-.n8n` enthält lokale n8n-Daten, einschließlich Credentials und Workflow-Zustand.

Wenn `C:\Users\Argo-.n8n` gelöscht wird, müssen Workflow und OpenAI-Credential in n8n erneut eingerichtet werden.

## Jarvis nach PC-Neustart starten

1. PowerShell öffnen.
2. In den Projektordner wechseln:

   ```powershell
   cd C:\Jarvis\jarvis-web
   ```

3. Komfortstart ausführen:

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/start-jarvis.ps1
   ```

Das Skript öffnet separate PowerShell-Fenster für n8n und Jarvis-Web und startet anschließend Browserfenster für:

- Jarvis-Web: `http://localhost:5173`
- n8n: `http://localhost:5678`

Alternative per Batch-Datei:

```bat
scripts\start-jarvis.bat
```

## n8n manuell starten

Wenn nur n8n gestartet werden soll:

```powershell
cd C:\Jarvis\jarvis-web
$env:N8N_PORT='5678'
npx n8n start
```

Danach n8n öffnen:

```text
http://localhost:5678
```

## Jarvis-Web manuell starten

Wenn nur die Weboberfläche gestartet werden soll:

```powershell
cd C:\Jarvis\jarvis-web
npm run dev -- --host 127.0.0.1 --port 5173
```

Danach Jarvis-Web öffnen:

```text
http://localhost:5173
```

## n8n Workflow erneut importieren

Wenn der Workflow in n8n fehlt oder beschädigt ist, kann er aus GitHub/lokalem Checkout erneut importiert werden:

```powershell
cd C:\Jarvis\jarvis-web
powershell -ExecutionPolicy Bypass -File scripts/import-n8n-workflow.ps1
```

Das Skript importiert:

```text
n8n/workflows/jarvis-pro-interface-v1.json
```

Alternativ kann der Import manuell ausgeführt werden:

```powershell
npx n8n import:workflow --input n8n/workflows/jarvis-pro-interface-v1.json
```

Nach dem Import den Workflow in n8n öffnen und lokal prüfen, bevor er veröffentlicht/aktiviert wird.

## OpenAI-Credential lokal prüfen oder verbinden

1. n8n öffnen: `http://localhost:5678`.
2. In n8n zu **Credentials** wechseln.
3. Prüfen, ob ein OpenAI-Credential vorhanden und gültig ist.
4. Falls es fehlt: neues OpenAI-Credential anlegen und den API-Key nur lokal in n8n speichern.
5. Workflow **Jarvis Pro Interface v1** öffnen.
6. Node **OpenAI-Chatmodell** / **OpenAI Chat Model** öffnen.
7. Das lokale OpenAI-Credential auswählen.
8. Workflow speichern.

Wichtig: Keine API-Keys, Secrets oder Passwörter in GitHub, Markdown-Dateien, Workflow-JSON, Screenshots oder Logs speichern.

## Workflow veröffentlichen oder aktivieren

1. n8n öffnen: `http://localhost:5678`.
2. Workflow **Jarvis Pro Interface v1** öffnen.
3. Prüfen, dass diese Struktur vorhanden ist:
   - `Jarvis Webhook`
   - `Chat-Eingabe normalisieren`
   - `Jarvis KI-Agent`
   - `OpenAI-Chatmodell`
   - `Einfacher Speicher`
   - `Jarvis-Ausgabe zurückgeben`
4. Prüfen, dass **OpenAI-Chatmodell** mit dem lokalen OpenAI-Credential verbunden ist.
5. Prüfen, dass **Einfacher Speicher** mit dem KI-Agenten verbunden ist.
6. Workflow speichern.
7. Workflow veröffentlichen/aktivieren.

## Test mit „Hallo Jarvis“

1. n8n starten und Workflow aktivieren/veröffentlichen.
2. Jarvis-Web starten.
3. `http://localhost:5173` öffnen.
4. Im Chat senden:

   ```text
   Hallo Jarvis
   ```

5. Erwartung: Jarvis-Web zeigt eine Antwort aus `data.output` an.

Direkter Webhook-Test:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6" `
  -ContentType "application/json" `
  -Body '{ "chatInput": "Hallo Jarvis" }'
```

Erwartetes Schema:

```json
{
  "output": "..."
}
```

## Fehlerfall: Workflow fehlt in n8n

1. Prüfen, ob n8n mit dem richtigen lokalen Benutzerprofil läuft.
2. Workflow erneut importieren:

   ```powershell
   cd C:\Jarvis\jarvis-web
   powershell -ExecutionPolicy Bypass -File scripts/import-n8n-workflow.ps1
   ```

3. Workflow in n8n öffnen.
4. OpenAI-Credential lokal verbinden.
5. Workflow speichern und veröffentlichen/aktivieren.
6. Mit „Hallo Jarvis“ testen.

## Fehlerfall: OpenAI-Credential fehlt

1. n8n öffnen: `http://localhost:5678`.
2. Neues OpenAI-Credential in **Credentials** anlegen.
3. API-Key nur in n8n speichern.
4. Workflow öffnen und Node **OpenAI-Chatmodell** mit dem Credential verbinden.
5. Workflow speichern und veröffentlichen/aktivieren.
6. Mit „Hallo Jarvis“ testen.

Nie einen API-Key in GitHub committen.

## Fehlerfall: Jarvis-Web zeigt „Verbindung fehlgeschlagen“

1. Prüfen, ob n8n läuft: `http://localhost:5678`.
2. Prüfen, ob Jarvis-Web läuft: `http://localhost:5173`.
3. Prüfen, ob der Workflow veröffentlicht/aktiviert ist.
4. Prüfen, ob der Webhook-Pfad erreichbar ist:

   ```text
   http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6
   ```

5. Direkten Webhook-Test mit `Invoke-RestMethod` ausführen.
6. Wenn n8n einen Credential-Fehler meldet: OpenAI-Credential neu verbinden.
7. Wenn der Workflow fehlt: Workflow erneut importieren.
8. Wenn Jarvis-Web nicht läuft: `npm run dev -- --host 127.0.0.1 --port 5173` starten.

## Sicherheitsregel

Keine API-Keys, Secrets oder Passwörter in GitHub speichern. Lokale Credentials bleiben ausschließlich in n8n beziehungsweise im geschützten lokalen Benutzerprofil.
