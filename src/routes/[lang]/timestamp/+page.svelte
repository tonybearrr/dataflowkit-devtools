<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import { parseUnix, parseDatetimeLocal, detectUnit } from '$lib/tools/timestamp/parse';
	import {
		formatIso,
		formatFriendly,
		toUnix,
		toDatetimeLocal,
		getTimezoneAbbr
	} from '$lib/tools/timestamp/format';
	import type { TimestampUnit, TimezoneOption } from '$lib/tools/timestamp/types';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/timestamp`);

	// Source of truth - milliseconds
	let currentMs: number | null = $state(Date.now());
	let error: string | null = $state(null);

	// Input states
	let unixInput = $state('');
	let unit: TimestampUnit = $state('s');
	let timezone: TimezoneOption = $state('local');
	let showMs = $state(false);

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Computed values
	let datetimeLocalValue = $derived(currentMs !== null ? toDatetimeLocal(currentMs, timezone) : '');
	let unixPair = $derived(currentMs !== null ? toUnix(currentMs) : null);
	let isoString = $derived(currentMs !== null ? formatIso(currentMs, timezone) : '');
	let friendlyString = $derived(
		currentMs !== null ? formatFriendly(currentMs, timezone, showMs) : ''
	);
	let timezoneAbbr = $derived(getTimezoneAbbr(timezone));

	// Initialize unix input on mount
	$effect(() => {
		if (browser && currentMs !== null && !unixInput) {
			unixInput = String(Math.floor(currentMs / 1000));
		}
	});

	function handleUnixInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (!unixInput.trim()) {
				currentMs = null;
				error = null;
				return;
			}

			const result = parseUnix(unixInput, unit);
			if (result.ok) {
				currentMs = result.ms;
				error = null;
			} else {
				error = result.error;
			}
		}, 200);
	}

	function handleDatetimeInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (!value) {
			currentMs = null;
			error = null;
			return;
		}

		const result = parseDatetimeLocal(value, timezone);
		if (result.ok) {
			currentMs = result.ms;
			error = null;
			// Update unix input to match
			unixInput = unit === 's' ? String(Math.floor(result.ms / 1000)) : String(result.ms);
		} else {
			error = result.error;
		}
	}

	function handleUnitChange() {
		// Re-parse with new unit
		if (unixInput.trim()) {
			const result = parseUnix(unixInput, unit);
			if (result.ok) {
				currentMs = result.ms;
				error = null;
			}
		}
	}

	function handleTimezoneChange() {
		// Timezone change doesn't affect the timestamp value, just display
		// But we need to update unix input if it was entered as datetime
	}

	function setNow() {
		currentMs = Date.now();
		error = null;
		if (unit === 's') {
			unixInput = String(Math.floor(currentMs / 1000));
		} else {
			unixInput = String(currentMs);
		}
	}

	function autoDetectUnit() {
		const detected = detectUnit(unixInput);
		if (detected !== unit) {
			unit = detected;
			handleUnixInput();
		}
	}

	async function copyToClipboard(text: string) {
		if (browser && navigator.clipboard) {
			await navigator.clipboard.writeText(text);
		}
	}
</script>

<svelte:head>
	<title>{tStringReactive('timestamp.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('timestamp.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('timestamp.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('timestamp.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Timestamp Converter – Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Convert Unix timestamps, ISO dates, and milliseconds. Preview in local time or UTC instantly."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/timestamp" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Timestamp Converter",
			"description": "Convert Unix timestamps, ISO dates, and milliseconds. Preview in local time or UTC instantly.",
			"url": "https://devtools.dataflowkit.dev/timestamp",
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

<div class="max-w-6xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">{tStringReactive('timestamp.heading', $locale)}</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('timestamp.subtitle', $locale)}
		</p>
	</header>

	{#if error}
		<div
			class="mb-6 p-4 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10"
		>
			<div class="flex items-center gap-2 text-[var(--color-error)]">
				<span>⚠️</span>
				<span>{error}</span>
			</div>
		</div>
	{/if}

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-6">
			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<label for="unix-input" class="text-sm font-medium">{tStringReactive('timestamp.unixTimestamp', $locale)}</label>
					<div class="flex items-center gap-2">
						<button
							onclick={autoDetectUnit}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							title="Auto-detect seconds or milliseconds"
						>
							{tStringReactive('base64.auto', $locale)}
						</button>
						<select
							bind:value={unit}
							onchange={handleUnitChange}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
						>
							<option value="s">{tStringReactive('timestamp.seconds', $locale)}</option>
							<option value="ms">{tStringReactive('timestamp.milliseconds', $locale)}</option>
						</select>
					</div>
				</div>

				<input
					id="unix-input"
					type="text"
					bind:value={unixInput}
					oninput={handleUnixInput}
					placeholder={unit === 's' ? '1734540000' : '1734540000000'}
					class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]/50"
				/>

				<div class="flex items-center gap-2 mt-3">
					<button
						onclick={setNow}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
					>
						{tStringReactive('timestamp.now', $locale)}
					</button>
					{#if unixInput}
						<button
							onclick={() => copyToClipboard(unixInput)}
							class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
						>
							{tStringReactive('common.copy', $locale)}
						</button>
					{/if}
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<label for="datetime-input" class="text-sm font-medium">{tStringReactive('timestamp.dateTime', $locale)}</label>
					<span class="text-xs text-[var(--color-text-muted)]">{timezoneAbbr}</span>
				</div>

				<input
					id="datetime-input"
					type="datetime-local"
					value={datetimeLocalValue}
					oninput={handleDatetimeInput}
					class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors"
				/>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<h3 class="text-sm font-medium mb-3">{tStringReactive('timestamp.unit', $locale)}</h3>
				<div class="flex flex-wrap gap-4">
					<div class="space-y-2">
						<label for="timezone-select" class="text-xs text-[var(--color-text-muted)]"
							>{tStringReactive('timestamp.unit', $locale)}</label
						>
						<select
							id="timezone-select"
							bind:value={timezone}
							onchange={handleTimezoneChange}
							class="block px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
						>
							<option value="local">{tStringReactive('timestamp.local', $locale)}</option>
							<option value="utc">{tStringReactive('timestamp.utc', $locale)}</option>
						</select>
					</div>

					<div class="space-y-2">
						<span class="text-xs text-[var(--color-text-muted)]">{tStringReactive('timestamp.unit', $locale)}</span>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={showMs}
								class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
							/>
							<span class="text-sm">{tStringReactive('timestamp.milliseconds', $locale)}</span>
						</label>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			{#if currentMs !== null && !error}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-2">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
						>
							UNIX SECONDS
						</span>
						<button
							onclick={() => unixPair && copyToClipboard(String(unixPair.s))}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							Copy
						</button>
					</div>
					<p class="text-lg font-mono text-[var(--color-text-muted)]">
						{unixPair?.s}
					</p>
				</div>

				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-2">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
						>
							UNIX MILLISECONDS
						</span>
						<button
							onclick={() => unixPair && copyToClipboard(String(unixPair.ms))}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							Copy
						</button>
					</div>
					<p class="text-lg font-mono text-[var(--color-text-muted)]">
						{unixPair?.ms}
					</p>
				</div>

				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-2">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]"
						>
							ISO 8601
						</span>
						<button
							onclick={() => copyToClipboard(isoString)}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{tStringReactive('common.copy', $locale)}
						</button>
					</div>
					<p class="text-lg font-mono text-[var(--color-text-muted)] break-all">
						{isoString}
					</p>
				</div>

				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-2">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text)]"
							>
								{tStringReactive('timestamp.friendly', $locale).toUpperCase()}
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">{timezoneAbbr}</span>
						</div>
						<button
							onclick={() => copyToClipboard(friendlyString)}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{tStringReactive('common.copy', $locale)}
						</button>
					</div>
					<p class="text-lg text-[var(--color-text-muted)]">
						{friendlyString}
					</p>
				</div>
			{:else if !error}
				<div
					class="p-8 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-center"
				>
					<p class="text-[var(--color-text-muted)]">{tStringReactive('timestamp.enterTimestamp', $locale)}</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">{tStringReactive('timestamp.whatIsUnixTimestamp', $locale)}</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			{tStringReactive('timestamp.unixTimestampDescription', $locale)}
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('timestamp.secondsVsMilliseconds', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>
				<strong>{tStringReactive('timestamp.seconds', $locale)}</strong> — {tStringReactive('timestamp.secondsDescription', $locale)}
			</li>
			<li>
				<strong>{tStringReactive('timestamp.milliseconds', $locale)}</strong> — {tStringReactive('timestamp.millisecondsDescription', $locale)}
			</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('timestamp.commonUseCases', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>{tStringReactive('timestamp.useCase1', $locale)}</li>
			<li>{tStringReactive('timestamp.useCase2', $locale)}</li>
			<li>{tStringReactive('timestamp.useCase3', $locale)}</li>
			<li>{tStringReactive('timestamp.useCase4', $locale)}</li>
			<li>{tStringReactive('timestamp.useCase5', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('timestamp.privacyNote', $locale)}</h3>
		<p class="text-[var(--color-text-muted)]">
			{tStringReactive('timestamp.privacyText', $locale)}
		</p>
	</section>
</div>

