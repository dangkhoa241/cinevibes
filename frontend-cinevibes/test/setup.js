import '@testing-library/jest-dom/vitest';

// Node 22+ ships its own global `localStorage`, which can shadow jsdom's
// window.localStorage depending on Node version/flags. Install a small,
// self-contained polyfill so tests behave the same on every Node version.
class MemoryStorage {
    #store = new Map();
    getItem(key) { return this.#store.has(key) ? this.#store.get(key) : null; }
    setItem(key, value) { this.#store.set(key, String(value)); }
    removeItem(key) { this.#store.delete(key); }
    clear() { this.#store.clear(); }
    key(index) { return Array.from(this.#store.keys())[index] ?? null; }
    get length() { return this.#store.size; }
}

Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
});
