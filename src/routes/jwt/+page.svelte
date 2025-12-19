<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { parseJWT, getTimeUntilExpiration, formatTimestamp, maskToken } from '$lib/tools/jwt/parse';
	import {
		getHistory,
		getSettings,
		saveSettings,
		addToHistory,
		clearHistory
	} from '$lib/storage/jwtHistory';
	import type { JWTResult, JWTHistoryItem, JWTHistorySettings } from '$lib/tools/jwt/types';

	let tokenInput = $state('');
	let result: JWTResult | null = $state(null);
	let history: JWTHistoryItem[] = $state([]);
	let settings: JWTHistorySettings = $state({ saveToHistory: true, maskTokens: true });
	let shareEnabled = $state(false);
	let showHistory = $state(false);

	// Load from URL on mount
	$effect(() => {
		if (browser) {
			settings = getSettings();
			history = getHistory();

			const urlToken = $page.url.searchParams.get('t');
			if (urlToken) {
				tokenInput = urlToken;
				decodeToken();
			}
		}
	});

	function decodeToken() {
		if (!tokenInput.trim()) {
			result = null;
			return;
		}

		result = parseJWT(tokenInput);

		if (result.success && browser) {
			addToHistory(tokenInput, result.data.header, result.data.payload);
			history = getHistory();

			if (shareEnabled) {
				goto(`?t=${encodeURIComponent(tokenInput)}`, { replaceState: true, noScroll: true });
			}
		}
	}

	function handleInput() {
		if (tokenInput.trim()) {
			decodeToken();
		} else {
			result = null;
			if (shareEnabled && browser) {
				goto('/jwt', { replaceState: true, noScroll: true });
			}
		}
	}

	function loadFromHistory(item: JWTHistoryItem) {
		if (item.token) {
			tokenInput = item.token;
			decodeToken();
		}
		showHistory = false;
	}

	function handleClearHistory() {
		clearHistory();
		history = [];
	}

	function toggleSetting(key: keyof JWTHistorySettings) {
		settings[key] = !settings[key];
		saveSettings(settings);
	}

	function toggleShare() {
		shareEnabled = !shareEnabled;
		if (shareEnabled && tokenInput.trim() && browser) {
			goto(`?t=${encodeURIComponent(tokenInput)}`, { replaceState: true, noScroll: true });
		} else if (!shareEnabled && browser) {
			goto('/jwt', { replaceState: true, noScroll: true });
		}
	}

	function formatJson(obj: unknown): string {
		return JSON.stringify(obj, null, 2);
	}

	function getClaimStyle(key: string, value: unknown): string {
		if (key === 'exp') {
			const expInfo = getTimeUntilExpiration(value as number);
			if (expInfo?.expired) return 'text-[var(--color-error)]';
			return 'text-[var(--color-success)]';
		}
		if (key === 'iat' || key === 'nbf') return 'text-[var(--color-warning)]';
		return '';
	}
</script>

<svelte:head>
	<title>JWT Inspector - Dev Toolbox</title>
	<meta
		name="description"
		content="Decode and inspect JSON Web Tokens (JWT) locally in your browser. View header, payload, check expiration, and more. No data sent to servers."
	/>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">JWT Inspector</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			Decode and inspect JSON Web Tokens locally. Your tokens never leave your browser. View header,
			payload, check expiration status, and understand your JWTs.
		</p>
	</header>

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<label for="jwt-input" class="text-sm font-medium">Paste your JWT</label>
				<div class="flex items-center gap-4">
					<button
						onclick={() => (showHistory = !showHistory)}
						class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						{showHistory ? 'Hide' : 'Show'} History ({history.length})
					</button>
				</div>
			</div>

			<textarea
				id="jwt-input"
				bind:value={tokenInput}
				oninput={handleInput}
				placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
				class="w-full h-32 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]/50"
			></textarea>

			<div class="flex flex-wrap items-center gap-4 text-xs">
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={settings.saveToHistory}
						onchange={() => toggleSetting('saveToHistory')}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
					/>
					<span class="text-[var(--color-text-muted)]">Save to history</span>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={settings.maskTokens}
						onchange={() => toggleSetting('maskTokens')}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
					/>
					<span class="text-[var(--color-text-muted)]">Mask tokens</span>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={shareEnabled}
						onchange={toggleShare}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
					/>
					<span class="text-[var(--color-text-muted)]">Enable share link</span>
				</label>
			</div>

			{#if shareEnabled}
				<div
					class="p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-xs text-[var(--color-warning)]"
				>
					⚠️ Sharing URLs may expose tokens in browser history and server logs.
				</div>
			{/if}

			{#if showHistory && history.length > 0}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-3">
						<span class="text-sm font-medium">Recent Tokens</span>
						<button
							onclick={handleClearHistory}
							class="text-xs text-[var(--color-error)] hover:underline"
						>
							Clear all
						</button>
					</div>
					<div class="space-y-2 max-h-48 overflow-y-auto">
						{#each history as item (item.id)}
							<button
								onclick={() => loadFromHistory(item)}
								disabled={!item.token}
								class="w-full p-2 rounded text-left text-xs bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<div class="font-mono truncate text-[var(--color-text-muted)]">
									{item.maskedToken}
								</div>
								<div class="flex gap-3 mt-1 text-[var(--color-text-muted)]/60">
									{#if item.headerAlg}
										<span>{item.headerAlg}</span>
									{/if}
									{#if item.subject}
										<span>sub: {item.subject}</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="space-y-4">
			{#if result}
				{#if result.success}
					<div
						class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
							>
								HEADER
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">
								Algorithm: {result.data.header.alg}
							</span>
						</div>
						<pre
							class="text-sm font-mono overflow-x-auto text-[var(--color-text-muted)]">{formatJson(
								result.data.header
							)}</pre>
					</div>

					<div
						class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]"
							>
								PAYLOAD
							</span>
						</div>

						<div class="space-y-2 text-sm font-mono">
							{#each Object.entries(result.data.payload) as [key, value]}
								<div class="flex flex-wrap gap-2">
									<span class="text-[var(--color-accent)]">"{key}":</span>
									<span class={getClaimStyle(key, value)}>
										{JSON.stringify(value)}
									</span>

									{#if key === 'exp'}
										{@const expInfo = getTimeUntilExpiration(value as number)}
										{#if expInfo}
											<span
												class="text-xs px-2 py-0.5 rounded {expInfo.expired
													? 'bg-[var(--color-error)]/20 text-[var(--color-error)]'
													: 'bg-[var(--color-success)]/20 text-[var(--color-success)]'}"
											>
												{expInfo.expired ? 'Expired' : 'Valid'} · {expInfo.formatted}
											</span>
										{/if}
									{/if}

									{#if key === 'iat' || key === 'nbf'}
										{@const formatted = formatTimestamp(value as number)}
										{#if formatted}
											<span
												class="text-xs px-2 py-0.5 rounded bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
											>
												{formatted}
											</span>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div
						class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
							>
								SIGNATURE
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">Not verified (client-side only)</span>
						</div>
						<pre
							class="text-sm font-mono text-[var(--color-text-muted)] break-all">{result.data
								.signature}</pre>
					</div>
				{:else}
					<div
						class="p-4 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10"
					>
						<div class="flex items-center gap-2 text-[var(--color-error)]">
							<span class="text-lg">⚠️</span>
							<span class="font-medium">Invalid JWT</span>
						</div>
						<p class="mt-2 text-sm text-[var(--color-text-muted)]">{result.error}</p>
					</div>
				{/if}
			{:else}
				<div
					class="p-8 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-center"
				>
					<p class="text-[var(--color-text-muted)]">Paste a JWT to decode it</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">What is a JWT?</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred
			between two parties. JWTs consist of three parts separated by dots: header, payload, and
			signature.
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">Common JWT Claims</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>exp</strong> - Expiration time (Unix timestamp)</li>
			<li><strong>iat</strong> - Issued at time</li>
			<li><strong>nbf</strong> - Not before time</li>
			<li><strong>iss</strong> - Issuer</li>
			<li><strong>sub</strong> - Subject</li>
			<li><strong>aud</strong> - Audience</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Privacy Note</h3>
		<p class="text-[var(--color-text-muted)]">
			This tool processes JWTs entirely in your browser. No data is sent to any server. Your tokens
			remain private and secure.
		</p>
	</section>
</div>

