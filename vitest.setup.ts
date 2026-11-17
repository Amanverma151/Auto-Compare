import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Testing Library only auto-cleans when Vitest globals are enabled; do it explicitly.
afterEach(() => cleanup());

// `server-only` throws outside a React Server environment; unit tests import pure modules only.
vi.mock("server-only", () => ({}));
