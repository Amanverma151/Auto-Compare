"use client";

import { useSyncExternalStore } from "react";
import { MAX_COMPARE } from "../constants";
import type { CompareTrayItem } from "../types";

/**
 * Tiny localStorage-backed store for the "queued to compare" tray.
 * Storage access is wrapped in try/catch so private mode / blocked storage
 * degrades to an in-memory tray.
 */
const KEY = "autocompare:tray";
const EMPTY: CompareTrayItem[] = [];
const listeners = new Set<() => void>();

let cache: { raw: string | null; items: CompareTrayItem[] } = { raw: null, items: EMPTY };
let memoryRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return memoryRaw;
  }
}

function parse(raw: string | null): CompareTrayItem[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data
      .filter((x): x is CompareTrayItem => typeof x?.slug === "string" && typeof x?.title === "string")
      .slice(0, MAX_COMPARE);
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CompareTrayItem[] {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, items: parse(raw) };
  return cache.items;
}

function write(items: CompareTrayItem[]) {
  const raw = JSON.stringify(items);
  memoryRaw = raw;
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    /* storage unavailable: memory fallback already set */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const compareTray = {
  add(item: CompareTrayItem) {
    const items = getSnapshot();
    if (items.some((i) => i.slug === item.slug) || items.length >= MAX_COMPARE) return;
    write([...items, item]);
  },
  remove(slug: string) {
    write(getSnapshot().filter((i) => i.slug !== slug));
  },
  clear() {
    write([]);
  },
};

export function useCompareTray(): CompareTrayItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
