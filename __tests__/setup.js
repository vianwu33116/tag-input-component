import { beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

beforeEach(() => {
  // Mock the localStorage API
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});
