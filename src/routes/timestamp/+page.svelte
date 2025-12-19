<script lang="ts">
	import { browser } from '$app/environment';
	import { parseUnix, parseDatetimeLocal, detectUnit } from '$lib/tools/timestamp/parse';
	import {
		formatIso,
		formatFriendly,
		toUnix,
		toDatetimeLocal,
		getTimezoneAbbr
	} from '$lib/tools/timestamp/format';
	import type { TimestampUnit, TimezoneOption } from '$lib/tools/timestamp/types';

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
	<title>Timestamp Converter – Dev Toolbox</title>
	<meta
		name="description"
		content="Convert Unix timestamps, ISO dates, and milliseconds. Preview in local time or UTC instantly."
	/>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">Timestamp Converter</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			Convert Unix timestamps (seconds or milliseconds) to human-readable time and back. Switch
			between local time and UTC instantly.
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
					<label for="unix-input" class="text-sm font-medium">Unix Timestamp</label>
					<div class="flex items-center gap-2">
						<button
							onclick={autoDetectUnit}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							title="Auto-detect seconds or milliseconds"
						>
							Auto
						</button>
						<select
							bind:value={unit}
							onchange={handleUnitChange}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
						>
							<option value="s">Seconds</option>
							<option value="ms">Milliseconds</option>
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
						Now
					</button>
					{#if unixInput}
						<button
							onclick={() => copyToClipboard(unixInput)}
							class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
						>
							Copy
						</button>
					{/if}
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<label for="datetime-input" class="text-sm font-medium">Date & Time</label>
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
				<h3 class="text-sm font-medium mb-3">Options</h3>
				<div class="flex flex-wrap gap-4">
					<div class="space-y-2">
						<label for="timezone-select" class="text-xs text-[var(--color-text-muted)]"
							>Timezone</label
						>
						<select
							id="timezone-select"
							bind:value={timezone}
							onchange={handleTimezoneChange}
							class="block px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
						>
							<option value="local">Local</option>
							<option value="utc">UTC</option>
						</select>
					</div>

					<div class="space-y-2">
						<span class="text-xs text-[var(--color-text-muted)]">Precision</span>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={showMs}
								class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
							/>
							<span class="text-sm">Show milliseconds</span>
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
							Copy
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
								FRIENDLY
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">{timezoneAbbr}</span>
						</div>
						<button
							onclick={() => copyToClipboard(friendlyString)}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							Copy
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
					<p class="text-[var(--color-text-muted)]">Enter a timestamp or select a date/time</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">What is a Unix Timestamp?</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			A Unix timestamp is the number of seconds (or milliseconds) that have elapsed since January 1,
			1970, 00:00:00 UTC. This epoch-based system is widely used in programming, databases, and
			APIs.
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">Seconds vs Milliseconds</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>
				<strong>Seconds</strong> — 10 digits (e.g., 1734540000). Common in Unix systems and most
				APIs.
			</li>
			<li>
				<strong>Milliseconds</strong> — 13 digits (e.g., 1734540000000). Used by JavaScript,
				Java, and some databases.
			</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Common Use Cases</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>Debugging API responses and log files</li>
			<li>Converting between time zones</li>
			<li>Working with JWT expiration times</li>
			<li>Database timestamp fields</li>
			<li>Cron job scheduling</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Privacy Note</h3>
		<p class="text-[var(--color-text-muted)]">
			This tool processes timestamps entirely in your browser. No data is sent to any server.
		</p>
	</section>
</div>

