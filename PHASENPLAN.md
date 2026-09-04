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

### Phase 8 – UI-Feinschliff der Übungsliste ⬜ offen
Die Funktionalität aus Phase 7 passt, mit der Gestaltung der Übungsliste ist der Nutzer aber noch nicht zufrieden. Konkrete Änderungen werden erst nach einem Test auf dem Handy festgelegt – dort zeigt sich, ob Zeilenhöhe, Trefferflächen der Symbol-Buttons, Scrollverhalten der Liste bei vielen Übungen und das Ausblenden der Einstellungen während des Trainings in der Praxis tragen.

## Workflow nach jeder Phase
1. Im Browser testen
2. `git add .`
3. `git commit -m "Phase X: <Kurzbeschreibung>"`
4. `git push`
5. CLAUDE.md mit aktuellem Stand aktualisieren lassen (Prompt an Claude Code)
