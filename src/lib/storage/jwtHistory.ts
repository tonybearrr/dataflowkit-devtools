import { browser } from '$app/environment';
import { maskToken } from '$lib/tools/jwt/parse';
import type { JWTHistoryItem, JWTHistorySettings, JWTPayload, JWTHeader } from '$lib/tools/jwt/types';

const HISTORY_KEY = 'jwt-history';
const SETTINGS_KEY = 'jwt-settings';
const MAX_HISTORY_ITEMS = 50;


function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}


export function getSettings(): JWTHistorySettings {
	if (!browser) {
		return { saveToHistory: true, maskTokens: true };
	}

	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (stored) {
			return JSON.parse(stored) as JWTHistorySettings;
		}
	} catch {
		// Ignore parse errors
	}

	return { saveToHistory: true, maskTokens: true };
}


export function saveSettings(settings: JWTHistorySettings): void {
	if (!browser) return;

	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch {
		// Ignore storage errors
	}
}


export function getHistory(): JWTHistoryItem[] {
	if (!browser) return [];

	try {
		const stored = localStorage.getItem(HISTORY_KEY);
		if (stored) {
			return JSON.parse(stored) as JWTHistoryItem[];
		}
	} catch {
		// Ignore parse errors
	}

	return [];
}


export function addToHistory(
	token: string,
	header?: JWTHeader,
	payload?: JWTPayload
): void {
	if (!browser) return;

	const settings = getSettings();
	if (!settings.saveToHistory) return;

	const history = getHistory();

	// Check if token already exists
	const existingIndex = history.findIndex((item) => item.token === token);
	if (existingIndex !== -1) {
		// Move to top
		const [existing] = history.splice(existingIndex, 1);
		existing.timestamp = Date.now();
		history.unshift(existing);
	} else {
		// Add new item
		const item: JWTHistoryItem = {
			id: generateId(),
			token: settings.maskTokens ? '' : token,
			maskedToken: maskToken(token),
			timestamp: Date.now(),
			headerAlg: header?.alg,
			subject: payload?.sub as string | undefined
		};

		// Store full token only if masking is disabled
		if (!settings.maskTokens) {
			item.token = token;
		}

		history.unshift(item);
	}

	// Limit history size
	const trimmed = history.slice(0, MAX_HISTORY_ITEMS);

	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
	} catch {
		// Ignore storage errors
	}
}


export function removeFromHistory(id: string): void {
	if (!browser) return;

	const history = getHistory();
	const filtered = history.filter((item) => item.id !== id);

	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
	} catch {
		// Ignore storage errors
	}
}


export function clearHistory(): void {
	if (!browser) return;

	try {
		localStorage.removeItem(HISTORY_KEY);
	} catch {
		// Ignore storage errors
	}
}

