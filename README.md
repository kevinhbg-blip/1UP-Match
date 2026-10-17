# 1UP Match – Club Ryder Cup

Neu aufgebaute installierbare Browser-App im klassischen grünen Club-Design.

## Start

Die App wird direkt aus dem Hauptordner auf GitHub Pages bereitgestellt. Der frühere Pfad `/1UP-Match/1UP-Match/` leitet auf die Hauptseite weiter.

Lokal mit Node oder Python einen statischen HTTP-Server im Projektordner starten, beispielsweise `python -m http.server 8080`. Dann `http://localhost:8080` öffnen.

## Turnier einrichten

1. Unter **Teams** Namen, Farben und Kapitäne eintragen.
2. Unter **Mitglieder** Spieler anlegen oder unter **Admin** eine Nennliste importieren. Unterstützt CSV/Tab mit Kopfzeilen und JSON-Feeds.
3. Die Spieler innerhalb jedes Teams den Gruppen A–D zuordnen. Die Liste ist nach HCP sortiert. Es werden keine unvereinbarten HCP-Grenzen angenommen.
4. Unter **Admin** neue Teamduelle mit zwei Teams, Datum, Gruppen und Matchanzahl je Format anlegen. Klassische Vierer der Gruppe A spielen ohne Auswahl-Drive; B, C und D mit Auswahl-Drive. Fourball und Einzel haben keinen Auswahl-Drive.
5. Unter **Aufstellung** die Spieler je Match wählen. Zur Auswahl stehen aktive Spieler des passenden Teams und der passenden Gruppe. Einzel benötigt einen Spieler, Doppel zwei Spieler pro Seite.
6. Unter **Live** jedes gespielte Loch für A, B oder geteilt erfassen. Ein Match ausdrücklich beenden. Punkte: Sieg 1, Niederlage 0, geteilt 0,5. Die Tabelle berechnet sich aus den beendeten Matches.
7. Unter **Ergebnisse** können die Kapitäne das abgeschlossene Teamduell mit Name und Datum bestätigen. Score-Änderungen machen die Bestätigungen ungültig.

Bestehende Duelle lassen sich unter Admin einstellen. Gestartete oder beendete Matches werden beim Reduzieren der Anzahl erhalten. „Alle Teamduelle löschen“ entfernt nach Bestätigung Duelle, Aufstellungen, Scores und Ergebnisbestätigungen; Teams und Spieler bleiben bestehen.

## Weitere Funktionen

- Kalender mit anlegbaren und bearbeitbaren Terminen sowie gespeicherten Zusagen.
- Team-Chat und Kapitäns-Chat mit Nachrichten auf diesem Gerät.
- Foto- und Videoalbum mit IndexedDB-Speicherung, maximal 20 MB je Datei.
- Handicap-Anteil für Einzel und Doppel, mit gerundeter individueller Vorgabe.
- Nennlisten-Feed mit Quellstand und Abrufzeit; die Quelle muss CORS erlauben.
- CSV-Vorschau mit Team- und Gruppenzuordnung; identische Namen innerhalb desselben Teams werden aktualisiert.
- JSON-Sicherungen und Wiederherstellung der Turnierdaten. Medien sind separat im Browser gespeichert und nicht in JSON-Sicherungen enthalten.
- Admin-, Kapitäns- und Mitgliederansicht: Kapitäne bearbeiten die Aufstellung ihrer eigenen Seite, Admins alle Seiten.
- Offline-Service-Worker und Installationsmanifest.

## Datenspeicherung und Grenzen

Dies ist eine vollständige lokale App. Rollenwechsel ist eine Ansichts- und Bedienfunktion, keine sichere Authentifizierung. Es gibt keinen Server, keine gemeinsame Vereinsdatenbank und keine Echtzeit-Synchronisierung zwischen Geräten. Nachrichten, Ergebnisbestätigungen und Medien bleiben im jeweiligen Browser. Für echten Mehrbenutzerbetrieb sind Backend und Anmeldung erforderlich.

Die frühere Speicherung `ryderCupState` wird beim ersten Start übernommen, falls noch keine neue Speicherung `oneUpMatchV2` vorliegt. Die alten Daten bleiben unverändert erhalten. Alte Spieler ohne Gruppenzuordnung bleiben bewusst „Offen“. Bestehende Match-Ergebnisse werden übernommen, frühere Demo-Punktestände werden nicht als echte Ergebnisse gezählt.

## Tests

`node tests.cjs`

Die Tests decken Gruppenregeln, Konfigurationsänderungen mit Score-Erhalt, Punkte, HCP, CSV-Parsing, Datenmigration, Seitenrendering, Duellerstellung, Live-Scoring, Ergebnisaktualisierung, Kalenderzusagen, Chat-Escaping, Rollenprüfungen, Löschen und Speicherfehler ab.



## Ryder-Cup-Design, Teamlogos und Sponsoren

- Neue navyblaue, weiße und goldene Oberfläche mit roten und blauen Spielständen.
- Unter Teams können Kapitäne das Logo ihres eigenen Teams hochladen; Admins können alle Teamlogos verwalten. PNG, JPG und WebP bis 5 MB werden proportional auf 256 × 256 Pixel verkleinert. Logos erscheinen in Teamkarten, Rangliste, Teamduellen, Aufstellungen, Live-Matches und Ergebnissen. Ohne Upload erscheint ein Initialen-Wappen.
- Die sechs vorhandenen Teams werden beim ersten Start des Updates auf 32, 34, 36, 38, 33 und 35 Spieler ergänzt. Erfundene Spieler sind als „Fiktiv“ markiert und über HCP auf A–D verteilt. Bestehende Spieler werden nicht überschrieben; bereits größere Kader werden nicht verkleinert. Die Ergänzung erfolgt einmalig je Browserdatenbestand.
- Unter Admin → Sponsoren & Clubpartner lassen sich Partnername, kurzer Text, Website und Logo pflegen. Bis zu drei aktive Banner stehen unterhalb des Seiteninhalts. Keine Animation, kein Pop-up, keine Unterbrechung. Ohne Partner erscheint ein dezenter Werbeplatzhinweis.
- Team- und Sponsorlogos sind in JSON-Sicherungen enthalten. Wie die übrigen Turnierdaten werden sie lokal im Browser gespeichert. Die Rollenansicht ist weiterhin keine serverseitige Authentifizierung.
