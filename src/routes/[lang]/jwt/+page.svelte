<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { locale, tStringReactive, getPath, type Locale } from '$lib/i18n';
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
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let urlSyncTimer: ReturnType<typeof setTimeout> | null = null;
	let hasLoadedFromUrl = $state(false);

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/jwt`);

	$effect(() => {
		if (!browser || hasLoadedFromUrl) return;
		
		settings = getSettings();
		history = getHistory();

		const urlToken = $page.url.searchParams.get('t');
		if (urlToken && !tokenInput) {
			tokenInput = urlToken;
			shareEnabled = true;
			decodeToken();
			hasLoadedFromUrl = true;
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
		}
	}

	function updateUrl() {
		if (!browser) return;

		if (urlSyncTimer) clearTimeout(urlSyncTimer);
		
		urlSyncTimer = setTimeout(() => {
			const currentPath = getPath('/jwt', lang);
			if (shareEnabled && tokenInput.trim()) {
				goto(`${currentPath}?t=${encodeURIComponent(tokenInput)}`, { 
					replaceState: true, 
					noScroll: true 
				});
			} else {
				goto(currentPath, { 
					replaceState: true, 
					noScroll: true 
				});
			}
		}, 100);
	}

	function handleInput() {
		if (tokenInput.trim()) {
			decodeToken();
			
			if (shareEnabled) {
				shareEnabled = false;
				updateUrl();
			}
		} else {
			result = null;
			if (shareEnabled) {
				shareEnabled = false;
			}
			updateUrl();
		}
	}

	function loadFromHistory(item: JWTHistoryItem) {
		if (!item.token) {
			showHistory = false;
			return;
		}

		tokenInput = item.token;
		shareEnabled = false;
		decodeToken();
		showHistory = false;
		updateUrl();
	}

	function handleClearHistory() {
		clearHistory();
		history = [];
	}

	function toggleSetting(key: keyof JWTHistorySettings) {
		settings[key] = !settings[key];
		saveSettings(settings);
	}

	async function copyToClipboard(text: string) {
		if (browser && navigator.clipboard && text) {
			try {
				await navigator.clipboard.writeText(text);
			} catch (_e) {
				// Fallback for older browsers
			}
		}
	}

	function toggleShare() {
		shareEnabled = !shareEnabled;
		
		if (browser && tokenInput.trim()) {
			const currentPath = getPath('/jwt', lang);
			if (shareEnabled) {
				const shareUrl = `${window.location.origin}${currentPath}?t=${encodeURIComponent(tokenInput)}`;
				copyToClipboard(shareUrl);
			}
			updateUrl();
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
	<title>{tStringReactive('jwt.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('jwt.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('jwt.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('jwt.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={tStringReactive('jwt.title', $locale)} />
	<meta
		name="twitter:description"
		content={tStringReactive('jwt.description', $locale)}
	/>
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "JWT Inspector",
			"description": "Decode and inspect JSON Web Tokens (JWT) locally in your browser. View header, payload, check expiration, and more. No data sent to servers.",
			"url": "https://devtools.dataflowkit.dev/jwt",
			"applicationCategory": "DeveloperApplication",
			"operatingSystem": "Web Browser",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			}
		}
		</script>
	`}
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-4 sm:py-8">
	<header class="mb-6 sm:mb-8">
		<h1 class="text-2xl sm:text-3xl font-bold mb-3">{tStringReactive('jwt.heading', $locale)}</h1>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('jwt.subtitle', $locale)}
		</p>
	</header>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
		<div class="space-y-4 min-w-0">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<label for="jwt-input" class="text-sm font-medium">{tStringReactive('jwt.pasteJWT', $locale)}</label>
				<div class="flex items-center gap-4">
					<button
						onclick={() => (showHistory = !showHistory)}
						class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors whitespace-nowrap"
					>
						{showHistory ? tStringReactive('jwt.hideHistory', $locale) : tStringReactive('jwt.showHistory', $locale)} ({history.length})
					</button>
				</div>
			</div>

			<textarea
				id="jwt-input"
				bind:value={tokenInput}
				oninput={handleInput}
				placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
				class="w-full min-w-0 h-48 sm:h-64 p-3 sm:p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs sm:text-sm font-mono resize-none focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]/50"
			></textarea>

			<div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-xs">
				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={settings.saveToHistory}
						onchange={() => toggleSetting('saveToHistory')}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex-shrink-0"
					/>
					<span class="text-[var(--color-text-muted)]">{tStringReactive('jwt.saveToHistory', $locale)}</span>
				</label>

				<label class="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={settings.maskTokens}
						onchange={() => toggleSetting('maskTokens')}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] flex-shrink-0"
					/>
					<span class="text-[var(--color-text-muted)]">{tStringReactive('jwt.maskTokens', $locale)}</span>
				</label>

				<label class="flex items-center gap-2 {tokenInput.trim() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}">
					<input
						type="checkbox"
						checked={shareEnabled}
						disabled={!tokenInput.trim()}
						onchange={toggleShare}
						class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] disabled:cursor-not-allowed flex-shrink-0"
					/>
					<span class="text-[var(--color-text-muted)]">{tStringReactive('jwt.enableShareLink', $locale)}</span>
				</label>
			</div>

			{#if shareEnabled}
				<div
					class="p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-xs text-[var(--color-warning)]"
				>
					{tStringReactive('jwt.shareWarning', $locale)}
				</div>
			{/if}

			{#if showHistory && history.length > 0}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-3">
						<span class="text-sm font-medium">{tStringReactive('jwt.recentTokens', $locale)}</span>
						<button
							onclick={handleClearHistory}
							class="text-xs text-[var(--color-error)] hover:underline"
						>
							{tStringReactive('jwt.clearAll', $locale)}
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

		<div class="space-y-4 min-w-0">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<label for="jwt-input" class="text-sm font-medium">{tStringReactive('jwt.outputJWT', $locale)}</label>
			</div>
			{#if result}
				{#if result.success}
					<div
						class="p-3 sm:p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex flex-wrap items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
							>
								{tStringReactive('jwt.header', $locale).toUpperCase()}
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">
								{tStringReactive('jwt.algorithm', $locale)}: {result.data.header.alg}
							</span>
						</div>
						<pre
							class="text-xs sm:text-sm font-mono overflow-x-auto text-[var(--color-text-muted)]">{formatJson(
								result.data.header
							)}</pre>
					</div>

					<div
						class="p-3 sm:p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex flex-wrap items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]"
							>
								{tStringReactive('jwt.payload', $locale).toUpperCase()}
							</span>
						</div>

						<div class="space-y-2 text-xs sm:text-sm font-mono">
							{#each Object.entries(result.data.payload) as [key, value]}
								<div class="flex flex-wrap gap-x-2 items-baseline">
									<span class="text-[var(--color-accent)] whitespace-nowrap">"{key}":</span>
									<span class="{getClaimStyle(key, value)} break-all">
										{JSON.stringify(value)}
									</span>

									{#if key === 'exp'}
										{@const expInfo = getTimeUntilExpiration(value as number)}
										{#if expInfo}
											<span
												class="text-xs px-2 py-0.5 rounded whitespace-nowrap {expInfo.expired
													? 'bg-[var(--color-error)]/20 text-[var(--color-error)]'
													: 'bg-[var(--color-success)]/20 text-[var(--color-success)]'}"
											>
												{expInfo.expired ? tStringReactive('jwt.expired', $locale) : tStringReactive('jwt.valid', $locale)} · {expInfo.formatted}
											</span>
										{/if}
									{/if}

									{#if key === 'iat' || key === 'nbf'}
										{@const formatted = formatTimestamp(value as number)}
										{#if formatted}
											<span
												class="text-xs px-2 py-0.5 rounded whitespace-nowrap bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
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
						class="p-3 sm:p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex flex-wrap items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
							>
								{tStringReactive('jwt.signature', $locale).toUpperCase()}
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">{tStringReactive('jwt.notVerified', $locale)}</span>
						</div>
						<pre
							class="text-xs sm:text-sm font-mono text-[var(--color-text-muted)] break-all overflow-x-auto">{result.data
								.signature}</pre>
					</div>
				{:else}
					<div
						class="p-3 sm:p-4 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10"
					>
						<div class="flex items-center gap-2 text-[var(--color-error)]">
							<span class="text-lg">⚠️</span>
							<span class="font-medium text-sm sm:text-base">{tStringReactive('jwt.invalidJWT', $locale)}</span>
						</div>
						<p class="mt-2 text-xs sm:text-sm text-[var(--color-text-muted)]">{result.error}</p>
					</div>
				{/if}
			{:else}
				<div
					class="h-32 sm:h-22 p-6 sm:p-8 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-center flex items-center justify-center"
				>
					<p class="text-sm sm:text-base text-[var(--color-text-muted)]">{tStringReactive('jwt.pasteToDecode', $locale)}</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-8 sm:mt-16 prose prose-invert max-w-none">
		<h2 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{tStringReactive('jwt.whatIsJWT', $locale)}</h2>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)] mb-4">
			{tStringReactive('jwt.jwtDescription', $locale)}
		</p>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('jwt.commonClaims', $locale)}</h3>
		<ul class="text-sm sm:text-base text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>exp</strong> - {tStringReactive('jwt.expClaim', $locale)}</li>
			<li><strong>iat</strong> - {tStringReactive('jwt.iatClaim', $locale)}</li>
			<li><strong>nbf</strong> - {tStringReactive('jwt.nbfClaim', $locale)}</li>
			<li><strong>iss</strong> - {tStringReactive('jwt.issClaim', $locale)}</li>
			<li><strong>sub</strong> - {tStringReactive('jwt.subClaim', $locale)}</li>
			<li><strong>aud</strong> - {tStringReactive('jwt.audClaim', $locale)}</li>
		</ul>

		<h3 class="text-base sm:text-lg font-medium mt-4 sm:mt-6 mb-2 sm:mb-3">{tStringReactive('jwt.privacyNote', $locale)}</h3>
		<p class="text-sm sm:text-base text-[var(--color-text-muted)]">
			{tStringReactive('jwt.privacyText', $locale)}
		</p>
	</section>
</div>

