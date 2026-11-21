import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Node 22 has an experimental global localStorage that shadows jsdom's window.localStorage.
// We provide a reliable Storage implementation for tests.
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

const storageInstance = new LocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: storageInstance,
  writable: true,
  configurable: true,
});
Object.defineProperty(window, 'localStorage', {
  value: storageInstance,
  writable: true,
  configurable: true,
});

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Polyfill window.scrollTo
window.scrollTo = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
