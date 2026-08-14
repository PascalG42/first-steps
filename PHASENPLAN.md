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

### Phase 5 – PWA-Fähigkeit ⏳ offen
Manifest + Service Worker ergänzen, damit die App auf Android installierbar wird.

## Workflow nach jeder Phase
1. Im Browser testen
2. `git add .`
3. `git commit -m "Phase X: <Kurzbeschreibung>"`
4. `git push`
5. CLAUDE.md mit aktuellem Stand aktualisieren lassen (Prompt an Claude Code)
