// Service Worker fuer die Offline-Nutzung des Intervalltimers.
// Ein Service Worker ist ein kleines Skript, das der Browser separat vom eigentlichen
// Seitencode ausfuehrt und das Netzwerk-Anfragen (fetch) abfangen kann - so lassen sich
// Dateien zwischenspeichern (cachen) und auch ohne Internetverbindung wieder ausliefern.

// Name des Caches. Die Versionsnummer am Ende (v1) erhoehen, wenn sich die Liste der
// zu cachenden Dateien aendert - so wird beim naechsten Laden ein neuer Cache angelegt
// und der alte (siehe "activate" weiter unten) aufgeraeumt.
const CACHE_NAME = "intervalltimer-cache-v1";

// Alle Dateien, die fuer die Offline-Nutzung im Cache liegen sollen
const CACHE_DATEIEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sound_effects/beep.wav",
  "./sound_effects/end.wav",
  "./sound_effects/start.wav",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// "install" laeuft einmalig, wenn der Service Worker zum ersten Mal (oder nach einer
// Aenderung) registriert wird. Hier werden alle Dateien aus CACHE_DATEIEN heruntergeladen
// und im Cache abgelegt.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHE_DATEIEN);
    })
  );
  self.skipWaiting(); // neuen Service Worker sofort aktiv werden lassen, ohne Warten
});

// "activate" laeuft, sobald der neue Service Worker uebernimmt. Hier werden alte,
// nicht mehr benoetigte Caches frueherer Versionen geloescht.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (vorhandeneCacheNamen) {
      return Promise.all(
        vorhandeneCacheNamen
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// "fetch" faengt jede Netzwerk-Anfrage der Seite ab (z.B. Laden von index.html oder
// einer Sound-Datei). Netzwerk-first-Strategie (mit Cache-Fallback): zuerst wird immer
// versucht, die Datei ganz normal ueber das Netzwerk zu laden - so bekommt man bei
// bestehender Verbindung stets den aktuellen Stand, ohne auf eine neue Service-Worker-
// Version warten zu muessen. Nur wenn das Netzwerk fehlschlaegt (z.B. offline), wird auf
// die zuletzt im Cache gespeicherte Version zurueckgegriffen.
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (netzwerkAntwort) {
        // Bei Erfolg: eine Kopie der frischen Antwort im Cache ablegen, damit der
        // Offline-Fall weiterhin mit einem moeglichst aktuellen Stand funktioniert.
        // clone() ist noetig, weil eine Response nur einmal gelesen werden kann -
        // einmal fuer die Seite (return) und einmal fuer den Cache (cache.put).
        const antwortKopie = netzwerkAntwort.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, antwortKopie);
        });
        return netzwerkAntwort;
      })
      .catch(function () {
        // Netzwerk nicht erreichbar - auf die im Cache gespeicherte Version zurueckgreifen
        return caches.match(event.request);
      })
  );
});
