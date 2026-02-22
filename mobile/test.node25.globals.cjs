'use strict';

const problematicGlobals = [
  'FormData',
  'Headers',
  'Request',
  'Response',
  'MessageEvent',
  'CloseEvent',
  'ErrorEvent',
  'WebSocket'
];

for (const key of problematicGlobals) {
  try {
    // Node 25 can throw while introspecting descriptors for these lazy web globals.
    // Replacing them with plain configurable classes avoids Jest environment bootstrap failures.
    delete globalThis[key];
    Object.defineProperty(globalThis, key, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: class {},
    });
  } catch {
    // Ignore; Jest can continue with whichever globals remain.
  }
}
