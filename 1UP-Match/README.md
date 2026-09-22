# Klub Ryder Cup – installierbare PWA

## Was ist enthalten?
Eine eigenständige Progressive Web App (PWA) für einen klubinternen Ryder Cup.

Enthalten:
- Teams und Kapitäne
- Mitgliederverwaltung mit Rollenlogik
- Foursomes, Fourballs und Einzel
- Admin-Modul: Anzahl Matches für Klassischer Vierer (1–10) und Einzel (1–16) frei einstellbar, inkl. Auswahl-Drive-Schalter für den klassischen Vierer
- Admin-Modul: Handicap-Vorgabe (z. B. ¾-Vorgabe) separat konfigurierbar für Einzel- und Doppel-Matches, mit Live-Formel-Vorschau
- Admin-Modul: Mitglieder-Import per CSV (Name, Klub, HCP) mit Vorschau und Team-Zuordnung vor dem Übernehmen
- Admin-Modul: Nennliste automatisch per Feed-URL abrufen (z. B. aus dem beiliegenden Scraper-Skript), inkl. dauerhaft sichtbarer Anzeige, wann die Nennliste zuletzt aktualisiert wurde
- Aufstellungen
- Kalender + RSVP
- Live-Leaderboard
- Loch-für-Loch-Scoring
- Begegnungs-Ergebnisse
- digitale Signatur-Demo
- Fotoalbum-Demo
- Team- und Kapitäns-Chat
- responsive Smartphone-/PC-Oberfläche
- lokale Datenspeicherung im Browser
- Offline-Cache über Service Worker
- PWA-Manifest für Installation

## Schnell starten am PC

Voraussetzung: Python 3.

Im Ordner des Projekts:
```bash
python -m http.server 8080
```

Dann im Browser öffnen:
http://localhost:8080

Wichtig: `index.html` nicht direkt per Doppelklick öffnen, wenn du PWA/Service Worker testen willst. Die App braucht HTTP/HTTPS.

## Am Smartphone installieren

Die App muss über HTTPS erreichbar sein, z.B. auf einem eigenen Webhosting.

Android/Chrome:
- Website öffnen
- Menü
- „App installieren“ / „Zum Startbildschirm hinzufügen“

iPhone/iPad:
- Website in Safari öffnen
- Teilen
- „Zum Home-Bildschirm“

PC:
- Chrome/Edge öffnen
- Installationssymbol in der Adressleiste auswählen.

## Weiterentwicklung

Die komplette Anwendung besteht bewusst aus normalen:
- HTML
- CSS
- JavaScript
- Web Manifest
- Service Worker

Dadurch kann sie mit VS Code, Cursor, WebStorm oder einem anderen Editor weiterentwickelt werden.

## Wichtig für eine echte Vereinsversion

Diese Version ist ein vollständiger installierbarer Frontend-Prototyp mit lokaler Speicherung. Für den echten Mehrbenutzerbetrieb müssen als nächster Schritt Benutzerkonten, zentrale Datenbank, Datei-Uploads und Echtzeit-Synchronisierung ergänzt werden.

Empfohlene Architektur:
Frontend/PWA + Backend/API + PostgreSQL + Storage + Authentifizierung.
