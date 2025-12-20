<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import { explainCron } from '$lib/tools/cron/explain';
	import { getNextRuns, formatRunTime } from '$lib/tools/cron/nextRuns';
	import { validateCron } from '$lib/tools/cron/validate';
	import { cronPresets } from '$lib/tools/cron/presets';
	import type { TimezoneOption, CronExplainResult, CronNextRunsResult } from '$lib/tools/cron/types';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/cron`);

	let cronInput = $state('*/5 * * * *');
	let timezone: TimezoneOption = $state('local');
	let runCount = $state(10);

	let explanation: CronExplainResult | null = $state(null);
	let nextRuns: CronNextRunsResult | null = $state(null);
	let validationError: string | null = $state(null);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function evaluateCron() {
		const trimmed = cronInput.trim();

		if (!trimmed) {
			explanation = null;
			nextRuns = null;
			validationError = null;
			return;
		}

		const validation = validateCron(trimmed);
		if (!validation.valid) {
			validationError = validation.error || 'Invalid cron expression';
			explanation = null;
			nextRuns = null;
			return;
		}

		validationError = null;
		explanation = explainCron(trimmed);
		nextRuns = getNextRuns(trimmed, runCount, timezone);
	}

	function handleInput() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(evaluateCron, 300);
	}

	function applyPreset(expression: string) {
		cronInput = expression;
		evaluateCron();
	}

	function handleTimezoneChange() {
		evaluateCron();
	}

	function handleRunCountChange() {
		evaluateCron();
	}

	// Initial evaluation
	$effect(() => {
		evaluateCron();
	});
</script>

<svelte:head>
	<title>{tStringReactive('cron.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('cron.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('cron.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('cron.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Cron Explainer & Simulator – Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Explain cron expressions in plain English and preview upcoming run times in your timezone."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/cron" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Cron Explainer & Simulator",
			"description": "Explain cron expressions in plain English and preview upcoming run times in your timezone.",
			"url": "https://devtools.dataflowkit.dev/cron",
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
		<h1 class="text-3xl font-bold mb-3">{tStringReactive('cron.heading', $locale)}</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('cron.subtitle', $locale)}
		</p>
	</header>

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-6">
			<div class="space-y-3">
				<label for="cron-input" class="text-sm font-medium">{tStringReactive('cron.cronExpression', $locale)}</label>
				<input
					id="cron-input"
					type="text"
					bind:value={cronInput}
					oninput={handleInput}
					placeholder="*/5 * * * *"
					class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]/50"
				/>
				<p class="text-xs text-[var(--color-text-muted)]">
					{tStringReactive('cron.format', $locale)}
				</p>
			</div>

			<div class="space-y-3">
				<span class="text-sm font-medium">{tStringReactive('cron.quickPresets', $locale)}</span>
				<div class="flex flex-wrap gap-2">
					{#each cronPresets as preset}
						<button
							onclick={() => applyPreset(preset.expression)}
							class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
							title={preset.description}
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap gap-6">
				<div class="space-y-2">
					<label for="timezone" class="text-sm font-medium">{tStringReactive('cron.timezone', $locale)}</label>
					<select
						id="timezone"
						bind:value={timezone}
						onchange={handleTimezoneChange}
						class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
					>
						<option value="local">Local</option>
						<option value="UTC">UTC</option>
					</select>
				</div>

				<div class="space-y-2">
					<label for="run-count" class="text-sm font-medium">{tStringReactive('cron.nextRuns', $locale)}</label>
					<select
						id="run-count"
						bind:value={runCount}
						onchange={handleRunCountChange}
						class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
					</select>
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<h3 class="text-sm font-medium mb-3">{tStringReactive('cron.fieldReference', $locale)}</h3>
				<div class="grid grid-cols-5 gap-2 text-xs font-mono">
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">{tStringReactive('cron.minute', $locale)}</div>
						<div class="text-[var(--color-text-muted)]/60">{tStringReactive('cron.rangeMinute', $locale)}</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">{tStringReactive('cron.hour', $locale)}</div>
						<div class="text-[var(--color-text-muted)]/60">{tStringReactive('cron.rangeHour', $locale)}</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">{tStringReactive('cron.day', $locale)}</div>
						<div class="text-[var(--color-text-muted)]/60">{tStringReactive('cron.rangeDay', $locale)}</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">{tStringReactive('cron.month', $locale)}</div>
						<div class="text-[var(--color-text-muted)]/60">{tStringReactive('cron.rangeMonth', $locale)}</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">{tStringReactive('cron.weekday', $locale)}</div>
						<div class="text-[var(--color-text-muted)]/60">{tStringReactive('cron.rangeWeekday', $locale)}</div>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			{#if validationError}
				<div
					class="p-4 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10"
				>
					<div class="flex items-center gap-2 text-[var(--color-error)]">
						<span class="text-lg">⚠️</span>
						<span class="font-medium">{tStringReactive('cron.invalidExpression', $locale)}</span>
					</div>
					<p class="mt-2 text-sm text-[var(--color-text-muted)]">{validationError}</p>
				</div>
			{:else if explanation && explanation.success}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center gap-2 mb-3">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
						>
							EXPLANATION
						</span>
					</div>
					<p class="text-lg">{explanation.text}</p>
				</div>

				{#if nextRuns && nextRuns.success}
					<div
						class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
					>
						<div class="flex items-center gap-2 mb-3">
							<span
								class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]"
							>
								NEXT {runCount} RUNS
							</span>
							<span class="text-xs text-[var(--color-text-muted)]">
								{timezone === 'UTC' ? tStringReactive('cron.utcTime', $locale) : tStringReactive('cron.localTime', $locale)}
							</span>
						</div>
						<ul class="space-y-2">
							{#each nextRuns.runs as run, i}
								<li class="flex items-center gap-3 text-sm">
									<span
										class="w-6 h-6 rounded bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs text-[var(--color-text-muted)]"
									>
										{i + 1}
									</span>
									<span class="font-mono text-[var(--color-text-muted)]">
										{formatRunTime(run, timezone)}
									</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{:else if !cronInput.trim()}
				<div
					class="p-8 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-center"
				>
					<p class="text-[var(--color-text-muted)]">{tStringReactive('cron.enterCronExpression', $locale)}</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">{tStringReactive('cron.whatIsCron', $locale)}</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			{tStringReactive('cron.cronDescription', $locale)}
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('cron.specialCharacters', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>*</strong> — {tStringReactive('cron.asterisk', $locale)}</li>
			<li><strong>,</strong> — {tStringReactive('cron.comma', $locale)}</li>
			<li><strong>-</strong> — {tStringReactive('cron.dash', $locale)}</li>
			<li><strong>/</strong> — {tStringReactive('cron.slash', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('cron.commonExamples', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">* * * * *</code> — {tStringReactive('cron.everyMinute', $locale)}</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 * * * *</code> — {tStringReactive('cron.everyHour', $locale)}</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 0 * * *</code> — {tStringReactive('cron.everyDay', $locale)}</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 0 * * 0</code> — {tStringReactive('cron.everySunday', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('cron.privacyNote', $locale)}</h3>
		<p class="text-[var(--color-text-muted)]">
			{tStringReactive('cron.privacyText', $locale)}
		</p>
	</section>
</div>

