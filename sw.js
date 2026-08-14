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
// einer Sound-Datei). Cache-first-Strategie: liegt eine Antwort schon im Cache, wird
// diese direkt zurueckgegeben (funktioniert auch offline). Nur wenn nichts im Cache
// liegt, wird ganz normal ueber das Netzwerk nachgeladen.
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (gecachteAntwort) {
      return gecachteAntwort || fetch(event.request);
    })
  );
});
