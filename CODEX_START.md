# Golden Youngstars · Ryder Cup – Übergabe an Codex

Export: 17.10.2026. Quellstand: 388111eb0da047f85b3c57ca9a45f1efd5049f7e.
Website: https://golden-youngstars-cup.clevercalf5.chatgpt.site

## Einstieg

ZIP entpacken und diesen Ordner in Codex öffnen oder seinen Inhalt in das gewünschte GitHub-Repository übernehmen. Bei einem vorhandenen Repository zuerst dessen Stand prüfen und vorhandene Dateien nicht blind überschreiben.

Auftrag zum Einfügen in Codex:

> Übernimm dieses Ryder-Cup-Projekt. Lies CODEX_START.md, package.json, app/model.ts, app/courses.ts und app/api/cup/route.ts. Prüfe die vorhandenen Tests. Behalte die Clubregeln bei. Prüfe für meine Zielumgebung die Cloudflare-D1-Anbindung und den Eigentümer-Login, bevor du Hosting oder Authentifizierung änderst. Zeige mir danach, wie ich die App lokal starte und bereitstelle.

## Enthalten

- Vollständiger versionierter Anwendungscode, Styles, Assets, Datenbankschema, Migrationen, Abhängigkeitssperrdatei und Tests.
- Kursdaten zusätzlich als JSON und als CSV in `transfer/`.
- Der vollständige Quellcode zur Erzeugung von Beispieldaten steht in `app/model.ts`.
- Keine installierten Abhängigkeiten, Git-Zugangstoken oder lokale Laufzeitdateien.

Dies ist ein Quellcode-Export, kein Backup der produktiven Datenbank. Bereits eingegebene Live-Ergebnisse, Mitgliederuploads, Unterschriften, Konten und Einstellungen aus der laufenden Website sind nicht exportiert. Beispieldaten werden bei einer neuen Datenbank über die Anwendung erzeugt.

## Technik und Start

React/TypeScript mit Vinext/Vite und Cloudflare Workers; Cloudflare D1 speichert den zentralen Cup-Zustand. Node-Version und pnpm-Version stehen in `package.json`.

Nach Installation der dort angegebenen Node-/pnpm-Version:

```sh
pnpm install --frozen-lockfile
node tests/cup.test.mjs
pnpm dev
```

Der Start allein richtet keine Datenbank oder Eigentümeridentität ein. `app/api/cup/route.ts` benötigt das Cloudflare-Binding `DB`. Die erstmalige Initialisierung und Admin-PIN-Vergabe benötigen den vertrauenswürdigen, serverseitig gesetzten Header `oai-authenticated-user-id`. Bei Betrieb außerhalb von Sites muss Codex eine geeignete Eigentümerauthentifizierung einrichten; diesen Header niemals ungeprüft vom öffentlichen Client übernehmen. Die vorhandene Sites-Identität steht in `.openai/hosting.json`. Eine Veröffentlichung in einer anderen Umgebung erfordert deren eigene Konfiguration. GitHub Pages allein unterstützt dieses Backend nicht.

Wichtige Dateien: `app/model.ts` (Regeln/Beispieldaten), `app/courses.ts` (Plätze), `app/api/cup/route.ts` (API/Rechte), `app/cup-auth.ts` (PIN/Sessions), `app/team-management.tsx` (Excel/Mitglieder), `db/schema.ts` und `drizzle/` (Datenbank).

## Clubregeln und Funktionen

- Einzel: Spieler-HCP vor Berechnung auf maximal 36 begrenzen; Standardvorgabe 75 %. HCP über 36 ergibt bei 18 Löchern somit 27.
- Doppel: zwei Spieler je Seite, ein Match. Jeden Spieler einzeln auf HCP 36 begrenzen, danach Mittelwert bilden und mit 0,75 multiplizieren. Kein Platzhandicap in dieser Clubberechnung.
- Die Verwaltung unterstützt konfigurierbare Regeln und 9/18 Löcher; die vorhandene Skalierung/Rundung in `app/model.ts` erhalten.
- Mitglieder per Excel importieren, Spieler per Dropdown wählen, Handicap automatisch übernehmen.
- Teamkapitäne sehen vor Freigabe nur ihre eigene Aufstellung. Veröffentlichung erst nach Abgabe aller erforderlichen Aufstellungen und zum Admin-Freigabezeitpunkt.
- Vierstelliger Admin-PIN, Kapitänsrechte, Teamfarben und Logos, Live-Scoring, optionale Gegenprüfung, Tagesübersicht, Löschung auch gestarteter Matches, Ergebnisbestätigung mit Unterschriften.

## Platzdaten

A = Bergergut, B = Panorama, C = Scherndlgut. Kursfolgen: AB, BA, AC, CA, BC, CB und CC. Die Lochvorgaben von C hängen von der Kombination ab; beim Tauschen der Kursfolge bleiben sie dem jeweiligen Loch zugeordnet. JSON und CSV wurden aus dem aktuellen Anwendungscode erzeugt, nicht erneut recherchiert. Quellen stehen in JSON und `app/courses.ts`.

CR/Slope sind für AB/BA und CC hinterlegt; für AC/CA/BC/CB fehlen belegte Ratings. Keine Werte schätzen. CR/Slope dienen als Platzinformation und ändern die Club-Handicapformel nicht.

## Prüfung dieses Exports

`node tests/cup.test.mjs` im Quellprojekt erfolgreich ausgeführt. Für alle sieben exportierten Kursfolgen geprüft: Lochvorgaben 1 bis 18 jeweils genau einmal. Für diesen unveränderten Quellcode-Export wurde kein neuer Build ausgeführt.
