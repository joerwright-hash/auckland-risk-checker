import { ScanResponse } from "./scanner-logic";

export interface ScanHistoryItem {
  id: string;
  text: string;
  result: ScanResponse;
  createdAt: Date;
}

const STORAGE_KEY = "green-claims-scan-history";
const MAX_HISTORY_ITEMS = 50;

export function saveScanToHistory(text: string, result: ScanResponse): void {
  if (typeof window === "undefined") return;

  const history = getScanHistory();
  const newItem: ScanHistoryItem = {
    id: Date.now().toString(),
    text,
    result,
    createdAt: new Date(),
  };

  history.unshift(newItem);
  
  // Keep only the most recent items
  const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
}

export function getScanHistory(): ScanHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((item: any) => ({
      ...item,
      result: {
        ...item.result,
        timestamp: new Date(item.result.timestamp),
      },
      createdAt: new Date(item.createdAt),
    }));
  } catch (error) {
    console.error("Error reading scan history:", error);
    return [];
  }
}

export function clearScanHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteScanFromHistory(id: string): void {
  if (typeof window === "undefined") return;

  const history = getScanHistory();
  const filtered = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
