# Zusammenführung vom 17.10.2026

Quellen: ZIP `Golden_Youngstars_Codex_2026-10-17.zip` und GitHub `kevinhbg-blip/1UP-Match`, Branch `main`. Die ursprünglichen Quellen liegen zum Vergleich unverändert in den lokal ignorierten Ordnern `imported/` und `current/`.

## Gemeinsame Oberfläche

Das grüne, cremefarbene und goldene Design stammt aus dem ZIP. Vier Hauptbereiche ersetzen die lange Navigation: Übersicht (Live, Heute, Ergebnisse), Spielplan, Teams (Teamübersicht, Mitglieder und Aufstellungen) und Club. Admin enthält die Verwaltung, Beispieleingabe und den neuen JSON-Import.

| Funktionen | Umsetzung |
| --- | --- |
| Live-Scores, Gegenprüfung, Benachrichtigungen, Teamduelle, Tagesübersicht | Originalmodule aus dem ZIP, zentrale D1-Datenbank |
| PIN, Kapitänskonten, Rechte und Aufstellungsfreigabe | Originale serverseitige Prüfung |
| Einzel, Doppel, HCP-Begrenzung 36, ¾-Vorgabe, 9/18 Löcher, Kursfolgen | Originale Berechnungen und Kursdaten |
| Excel-Import, Teamlogos, Farben, Spielereingabelinks | Originalmodule aus dem ZIP |
| Ergebnisbestätigung, Druck/PDF, E-Mail-Vorbereitung | Originalmodule aus dem ZIP |
| Kalender, Zu-/Absagen, Team- und Kapitänschat, Album, Sponsoren | Originale GitHub-App im Clubbereich eingebettet, weiterhin lokaler Speicher |
| CSV-/Feed-Import, Gruppen A–D, lokale Rollenansichten, vollständige Offline-Turnierverwaltung und JSON-Sicherungen | Vollständige GitHub-App unter `/offline/`, im gemeinsamen Design |
| Übernahme der bisherigen Turnierdaten | Neuer Admin-Import einer JSON-Sicherung; ergänzt Mitglieder, Teamlogos und vollständige Duelle mit Aufstellungen und Scores |

## Speicherung und Importgrenzen

Die Clubfunktionen verwenden weiterhin localStorage und IndexedDB. Sie sind in dieser Fassung **nicht zwischen Geräten synchronisiert**. Lokale Rollen sind Ansichten und kein Zugriffsschutz. Die gemeinsame Server-Anmeldung steuert die zentralen Turnierfunktionen. Es wurden keine echten Nachrichten verschickt oder Live-Daten importiert.

Browserdaten von GitHub Pages oder der bestehenden veröffentlichten Site können wegen der unterschiedlichen Herkunft nicht automatisch gelesen werden. Eine JSON-Sicherung überträgt die bisherigen Turnierdaten. Medien bleiben in IndexedDB am ursprünglichen Standort und sind nicht Bestandteil dieser Sicherung.

Der zentrale Import ergänzt bestehende Daten, statt Duelle zu löschen. Er benötigt Admin-Rechte, eine passende Revision und gültige Teams, Handicaps, Termine sowie vollständige Aufstellungen mit lückenlosen Lochwerten. Abweichende Namen `OG’s`, `Bachspin` und `Red Hot Chillis` werden zugeordnet. Andere Namen werden mit Fehlermeldung zurückgewiesen. Identische Spielernamen im selben Team werden aktualisiert; doppelte Quell-Duelle werden zurückgewiesen. Bei einem Fehler bleibt der gesamte gespeicherte Zustand unverändert.

Gruppen und Mitgliedereigenschaften bleiben beim Import erhalten. Historische Bestätigungen werden als Archiv am Duell mitgeführt; sie erteilen keine aktuellen Schreibrechte und sperren die importierten Duelle nicht. Beide Kapitäne müssen sie erneut bestätigen. Manuell beendete Offline-Matches behalten ihren Endstatus.

Die neue Server-App kann nicht vollständig auf GitHub Pages betrieben werden. Dafür bleiben die ursprüngliche Offline-App und ihr Service Worker erhalten. Der Service Worker ist auf `/offline/` begrenzt und speichert keine API-Antworten der Server-App.

## Prüfung

Ergänzung zur Spielplanung: Unter Admin → Spielplanung legt der Admin pro neuem oder umgeplantem Teamduell 12–20 Matches fest. Die Verteilungstabelle speichert je Gruppe A–D die Anzahl für Einzel, klassischen Vierer, Vierer mit Auswahldrive und Vierball. Erst bei passender Gesamtsumme kann gespeichert werden. Spielerbedarf, Aufstellungen und erzeugte Matches folgen dieser Verteilung. Gruppen werden direkt bei Mitgliedern oder optional über die dritte Excel-Spalte `Gruppe` gepflegt. Server und Oberfläche prüfen die Gruppenzugehörigkeit; bereits gestartete oder bestätigte Duelle bleiben gesperrt. Bestehende ältere Duelle werden nicht automatisch geändert.

- `npm test`: ursprüngliche API-/Berechtigungs- und Renderingtests, Importtests und sämtliche GitHub-Tests erfolgreich.
- `npx tsc --noEmit`: erfolgreich.
- `npm run build`: erfolgreich.
- Browserprüfung der Übersicht mit drei Beispielduellen und des eingebetteten Kalenders; lokale D1-Datenbank eingerichtet.

Es wurde nichts auf GitHub oder auf einer bestehenden Website veröffentlicht. Die fremde Sites-Projekt-ID aus dem ZIP ist aus der lokalen Hosting-Konfiguration entfernt, damit diese Kopie nicht versehentlich die bestehende Site überschreibt.
