# 1UP Match · Golden Youngstars

Zusammengeführte Fassung der GitHub-App und des Golden-Youngstars-Exports. Grünes Clubdesign, vereinfachte Navigation, zentrale Turnierverwaltung und ergänzende lokale Clubfunktionen.

## Lokal starten

Voraussetzung: Node.js ab 22.13, empfohlen Node 24.

```powershell
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --config dist/server/wrangler.json --local --persist-to .wrangler/state --file drizzle/0000_sharp_spirit.sql
npm run dev
```

Die SQL-Datei einmalig für eine neue lokale Datenbank ausführen. Anschließend http://127.0.0.1:5173/ öffnen. Die lokale Anmeldung /signin-with-chatgpt?return_to=/ verwendet ausschließlich die vom vorhandenen Starter bereitgestellte Testidentität. Unter Admin den eigenen PIN festlegen.

Die vollständige bisherige Browser-App ist unter /offline/ erreichbar. Bestehende Browserdaten einer anderen Website zuerst dort als JSON exportieren und in der neuen Offline-App importieren. Unter Admin → „1UP-Match-Daten aus GitHub übernehmen“ können vollständige Turnierdaten zusätzlich in die zentrale Datenbank übernommen werden.

## Prüfung

```powershell
npm test
npx tsc --noEmit
npm run build
```

## Betrieb

Die zentrale App benötigt Cloudflare Workers, D1 und eine vertrauenswürdige Eigentümeranmeldung. GitHub Pages unterstützt nur die lokale Offline-App. Die mitgelieferte Hosting-Konfiguration enthält bewusst keine bestehende Site-ID. Es wurde keine bestehende Website aktualisiert.

Kalender, Chat, Medien und Sponsoren bleiben wie in der GitHub-Version auf diesem Gerät gespeichert. Medien sind nicht in JSON-Sicherungen enthalten. Lokale Rollenansichten sind keine Serveranmeldung. Die genaue Zuordnung aller Funktionen und Importgrenzen steht in [MERGE_NOTES.md](MERGE_NOTES.md).
