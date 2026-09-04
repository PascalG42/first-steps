# Intervalltimer-App – Phasenplan

## Ziel
Web-App (PWA) als Intervalltimer für Dehnübungen. Läuft im Browser, auf Android über Chrome als App installierbar ("Zum Startbildschirm hinzufügen"). Nutzung ausschließlich auf dem eigenen Handy, keine Veröffentlichung im Play Store geplant.

## Tech-Stack
- HTML, CSS, JavaScript – kein Framework
- Persistenz für Presets später über `localStorage`
- Für volle PWA-Fähigkeit (Installierbarkeit, Offline-Nutzung): Manifest-Datei + Service Worker
- Hinweis: Service Worker benötigen HTTPS (Ausnahme: `localhost`). Für Tests im lokalen WLAN über die Rechner-IP funktioniert der Timer selbst, aber ggf. nicht die Installierbarkeit – dafür später z. B. über GitHub Pages hosten.

## Phasen

### Phase 1 – Basis-Timer ✅ erledigt
Ein Intervall, Dauer eingeben, Start/Stopp/Reset, große Countdown-Anzeige.

### Phase 2 – Mehrphasen-Logik ✅ erledigt
- Zwei Phasenarten: "Übung" und "Pause", jeweils eigene einstellbare Dauer
- Automatischer Wechsel Übung → Pause → Übung ...
- Rundenzähler (z. B. "Runde 3 von 5"), automatischer Stopp nach letzter Runde
- Aktuelle Phase klar erkennbar (Text/Farbwechsel)
- Start/Stopp/Reset aus Phase 1 bleiben erhalten

### Phase 3 – Sound/Vibration ✅ erledigt
Akustisches Signal (Web Audio API) und Vibration (Vibration API, Android/Chrome) beim Phasenwechsel, eigenes Signal beim Trainingsende.

### Phase 4 – Presets speichern ✅ erledigt
Gespeicherte Vorlagen (z. B. "Dehnroutine Morgen") über `localStorage`, bleiben nach Schließen der App erhalten. Presets lassen sich per Klick laden und wieder löschen.

### Phase 5 – Design-Feinschliff ✅ erledigt
Fortschrittsring um die Countdown-Anzeige (leert sich synchron zur verbleibenden Zeit), neues blaues Farbschema für Übung/Pause statt Rot/Grün, ausgewogenere vertikale Layout-Verteilung und 2x2-Raster für die vier Buttons.

### Phase 6 – PWA-Fähigkeit ✅ erledigt
Manifest + Service Worker + Icons ergänzt, App ist auf Android über Chrome/Edge installierbar (getestet, funktioniert). Gehostet über GitHub Pages: https://pascalg42.github.io/first-steps/

### Phase 7 – Individuelle Übungsliste statt fester Rundenformel ✅ erledigt

**Problem:** Der Ablauf wird bisher aus einer Formel berechnet (Übungsdauer × Pausendauer × Rundenzahl) und ist deshalb für jede Runde identisch. Dehnübungen, bei denen erst die eine und dann die andere Seite gedehnt wird (Seitenwechsel ohne Pause dazwischen), lassen sich damit nicht abbilden – ein zusätzlicher Schalter würde immer für alle Runden gleichzeitig gelten.

**Lösung:** Wechsel des Datenmodells von der Formel zu einer Übungsliste. Jede Übung hat einen optionalen Namen, eine eigene Dauer und ein Häkchen "beide Seiten". Vor dem Start erzeugt die App daraus einen Ablaufplan (Array von Abschnitten), den der Timer nur noch der Reihe nach abarbeitet.

**Beispielablauf** (Übung 1 zweiseitig, Übung 2 einseitig):

```
Hamstring links   30s
SEITE WECHSELN     5s
Hamstring rechts  30s
PAUSE             15s
Nacken            30s
(Ende – keine Pause nach der letzten Übung)
```

**Festgelegte Entscheidungen:**
- Seitenwechsel ist ein eigener kurzer Abschnitt mit einstellbarer Dauer (Standard 5 Sek., 0 = sofortiger Wechsel), zentral für alle Übungen.
- Die Rundenzahl entfällt ersatzlos. Wiederholungen werden mehrfach in die Liste eingetragen; dafür bekommt jede Zeile einen "Duplizieren"-Button.
- Die Pausendauer bleibt zentral für alle Übungen. Eine Pause pro Übung lässt sich später ohne Umbau nachrüsten, weil der Ablaufplan ohnehin pro Abschnitt rechnet.
- Keine Migration alter Presets (vom Nutzer ausdrücklich nicht gewünscht). Presets bekommen einen neuen localStorage-Schlüssel; der alte Schlüssel wird beim ersten Start der neuen Version entfernt, damit keine unbrauchbaren Daten im Browser zurückbleiben.

**Teilschritte:**

*7a – Umbau im Inneren, Verhalten unverändert* ✅ erledigt
Timer auf den Ablaufplan umstellen (`wechsleZurNaechstenPhase`, `stehtNormalerPhasenwechselBevor`, alle Prüfungen auf `aktuellePhase === "uebung"` bei Sounds, Ringfarbe und Vorwarnung). Die drei Eingabefelder bleiben zunächst unverändert und erzeugen intern denselben Ablauf wie bisher. Testkriterium: kein sichtbarer oder hörbarer Unterschied zur bisherigen Version.

*7b – Übungsliste als Bedienoberfläche* ✅ erledigt
Die drei Eingabefelder wurden durch eine Liste ersetzt: Übungen anlegen, bearbeiten, duplizieren, löschen und in der Reihenfolge verschieben. Pro Zeile Name, Dauer, Häkchen "beide Seiten". Darunter zentral Pausendauer und Seitenwechseldauer. Presets speichern die komplette Routine. Während des Trainings werden Liste und Presets ausgeblendet, sodass nur Ring, Phasenanzeige und Steuerbuttons sichtbar bleiben.

Gegenüber der ursprünglichen Planung mit aufgenommen, weil der Schritt sonst nicht sinnvoll testbar gewesen wäre bzw. die Liste sonst unpraktisch bliebe:
- Anzeige des Seitenwechsels ("SEITE WECHSELN") samt eigener Hintergrund- und Ringfarbe (warmer Bernsteinton), sowie Übungsname und Seite in der Phasenanzeige — ursprünglich für 7c vorgesehen.
- Die eingestellte Routine wird automatisch gespeichert und beim nächsten Öffnen wiederhergestellt. Ohne das müsste die Liste nach jedem Schließen der App neu eingetippt oder aus einem Preset geladen werden.
- Anzeige der Gesamtdauer unter der Liste, da diese bei frei zusammengestellten Übungen sonst nicht mehr absehbar ist.

*7c – Akustische Unterscheidung des Seitenwechsels* ✅ erledigt
Der Seitenwechsel meldet sich mit der bislang ungenutzten `pop.wav` (zweimal kurz hintereinander) und einem doppelten Vibrationsstoß `[120, 80, 120]`. Die Datei ist kurz und perkussiv und hebt sich damit von den längeren, abfallenden Tönen `end.wav` und `start.wav` ab. Der Klang richtet sich ab jetzt nach dem *beginnenden* Abschnitt, nicht mehr nach dem endenden – das ist die Information, die während der Übung gebraucht wird: umlagern, ausruhen oder weitermachen. Bei einer Seitenwechseldauer von 0 Sekunden (zwei Übungsabschnitte direkt hintereinander) erklingt ebenfalls das Seitenwechsel-Signal. `pop.wav` wurde in den Service-Worker-Cache aufgenommen (Cache-Version auf v2 erhöht), damit sie auch offline verfügbar ist.

**Risiken:**
- Fehler in der Timer-Logik beim Umbau (z. B. letzte Pause wird nicht weggelassen, Signal am falschen Punkt): Wahrscheinlichkeit mittel, Auswirkung mittel. Gegenmaßnahme: 7a strikt verhaltensneutral halten und vor 7b testen, jeder Teilschritt ein eigener Commit.
- Bedienoberfläche wird auf dem Handy zu voll: Wahrscheinlichkeit mittel, Auswirkung mittel. Gegenmaßnahme: Liste während des Trainings ausblenden, erweiterte Einstellungen einklappbar.
- Presetverlust: entfällt als Risiko, da die alten Presets bewusst verworfen werden.

**Noch offen (nicht Teil von Phase 7):** Vorbereitungszeit vor dem Trainingsstart, Pausendauer pro Übung, Import/Export von Routinen.

### Phase 8 – UI-Feinschliff der Einrichtungsansicht ✅ erledigt
Die Trainingsansicht bleibt unverändert (vom Nutzer als gut bewertet); überarbeitet wurde nur die Ansicht, in der die Routine zusammengestellt wird.

**Behobene Fehler:**
- Das Namensfeld war auf wenige Pixel zusammengequetscht, das Dauer-Feld dafür zeilenbreit. Ursache: Die allgemeine Regel `input[type="number"] { width: 100% }` ist spezifischer als `.uebung-dauer` und gewann. Die Regeln für die Felder einer Übungszeile nennen den Attributselektor jetzt selbst mit und überstimmen ihn damit.
- Ein deaktivierter Zeilenbutton (z. B. "nach oben" in der ersten Zeile) war durch die allgemeine `button:disabled`-Regel dunkler und damit auffälliger als die aktiven Buttons daneben. Deaktivierte Zeilenbuttons treten jetzt zurück, statt sich hervorzuheben.

**Gestalterische Anpassungen:**
- Trefferflächen: alle vier Symbol-Buttons mindestens 40 × 40 px, das Label "beide Seiten" schaltet auf voller Zeilenhöhe mit (Fitts's Law).
- Einheitliche Schriftgröße und Innenabstände für Name und Dauer, Abstände durchgehend aus der 4/8/16-Skala (Law of Similarity, Aesthetic-Usability).
- Eingabefelder mindestens 16 px Schriftgröße, damit mobile Browser beim Antippen nicht automatisch hineinzoomen.
- `accent-color` der Häkchen auf den dunklen Ringblauton, statt mit dem Systemblau gegen den Hintergrund zu konkurrieren.
- Vor dem Start wird der Ring auf etwa die halbe Größe verkleinert, Titel und Abstände fallen kompakter aus. Dadurch sind Steuerbuttons vollständig und die gespeicherten Routinen angeschnitten sichtbar, statt weit unterhalb des Bildschirms zu liegen. Beim Start wächst alles weich auf die gewohnte Größe.

**Prüfmethode:** Da Edge in der installierten Version `--window-size` ignoriert und immer mit 492 px rendert, wird die App für Layouttests in einen iframe fester Breite geladen – darin beziehen sich die `vw`-Einheiten korrekt auf die simulierte Handybreite. Geprüft bei 412 px und 360 px, jeweils ohne horizontalen Überlauf.

**Noch offen:** Die gespeicherten Routinen sind angeschnitten sichtbar, aber nicht vollständig – dafür müssten die Steuerbuttons deutlich kleiner werden, was der wichtigsten Aktion (Start) schaden würde.

*Hinweis:* Mit Phase 9 ist diese Einrichtungsansicht in dieser Form entfallen – die Übungsliste steckt jetzt im Editor, der Startbildschirm zeigt Kacheln.

### Phase 9 – Startbildschirm mit Routine-Kacheln ✅ erledigt

Die App besteht nicht mehr aus einer langen Seite, sondern aus **vier Ansichten**, von denen immer genau eine sichtbar ist. Gesteuert wird das über eine Klasse am `<body>` (`ansicht-start`, `ansicht-editor`, `ansicht-training`, `ansicht-frei`), die `zeigeAnsicht()` setzt – kein Framework, kein echter Seitenwechsel.

**Startbildschirm:** Kacheln der gespeicherten Routinen mit Name, Anzahl Übungen und Gesamtdauer. Ein Tipp startet die Routine sofort. Darunter „Bearbeiten" und „Neue Routine", darunter abgesetzt „Freier Modus".

**Editor:** Namensfeld (Pflicht – eine Kachel ohne Beschriftung wäre nicht wiederzuerkennen), die Übungsliste aus Phase 7b, Pause- und Seitenwechseldauer, „Speichern" und „Routine löschen". Bearbeitet wird immer auf Kopien, ein Abbruch lässt die gespeicherte Routine unverändert.

**Training:** unverändert gegenüber Phase 8.

**Freier Modus:** einfacher Intervalltimer mit Übungsdauer, Pausendauer und Rundenzahl – ohne Namen, Liste oder Routinen. Entspricht dem Verhalten vor Phase 7b. Dass sich das in wenigen Zeilen ausdrücken lässt (`baueFreienPlan`), ist der Nutzen des Ablaufplans aus Phase 7a: Beide Betriebsarten münden über `starteAblauf()` in denselben Timer. Die Fortschrittsanzeige zählt hier „Runde X von Y" statt „Übung X von Y".

**Festgelegte Entscheidungen:**
- „Bearbeiten" schaltet einen Modus um: Kacheln öffnen dann den Editor statt zu starten, erkennbar an gestrichelten Rahmen, geändertem Hinweistext und dem Button, der zu „Fertig" wird.
- Der Zurück-Pfeil oben links führt aus jeder Ansicht zum Startbildschirm und bricht ein laufendes Training ab (nötig, weil eine Kachel sofort startet und ein Fehltipp sonst nicht zu korrigieren wäre). Im Editor fragt er nur nach, wenn es ungespeicherte Änderungen gibt.
- Nach dem Trainingsende bleibt die Ansicht stehen, damit die Abschlussmeldung lesbar ist.
- Die unbenannte Arbeitsliste aus Phase 7b wird nicht übernommen; ihr Speicherplatz wird beim ersten Start geräumt. Benannte Routinen aus Phase 7b bleiben erhalten – sie sind im neuen Modell die Kacheln.

**Entfallen:** der separate Preset-Bereich (Speichern passiert im Editor), das automatische Speichern der unbenannten Arbeitsliste, das Sperren der Eingabefelder während des Trainings (Editor und Training sind jetzt getrennte Ansichten) und die Verkleinerung des Rings in der Einrichtungsansicht.

**Behobener Layoutfehler beim Umbau:** `#inhalt` hatte keine eigene Breite – bisher spannten die Kinder ihn mit eigenen `clamp()`-Breiten auf. Da die Ansichten `width: 100%` fordern, war das ein Zirkelschluss, und die Kacheln blieben auf ihrer Mindestbreite von 135 px stehen, wodurch ihre Beschriftungen umbrachen. `#inhalt` hat jetzt eine explizite Breite, der Ring ist auf `min(86vw, 460px)` begrenzt, damit er sie nicht überragt.

**Geprüft:** 60 automatische Prüfungen (headless) über Navigation, leeren Startbildschirm, Anlegen ohne Namen, Anlegen und Ändern, Speicherinhalt, Start per Kachel, Ablauf bis zum Ende, Zurück aus laufendem und beendetem Training, Bearbeiten-Modus, Verwerfen mit und ohne Änderungen, Löschen mit Rückfrage, freier Modus inklusive gemerkter Werte, beschädigte und unvollständige Speicherdaten sowie das Räumen alter Speicherstände. Layout per Screenshot bei 412 px und 360 px.

### Phase 10 – noch offen
Vorbereitungszeit vor dem Trainingsstart (relevant, weil eine Kachel sofort startet), Pausendauer pro Übung, Import/Export von Routinen, Umsortieren der Kacheln.

## Workflow nach jeder Phase
1. Im Browser testen
2. `git add .`
3. `git commit -m "Phase X: <Kurzbeschreibung>"`
4. `git push`
5. CLAUDE.md mit aktuellem Stand aktualisieren lassen (Prompt an Claude Code)
