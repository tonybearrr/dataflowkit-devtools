<script lang="ts">
	import { explainCron } from '$lib/tools/cron/explain';
	import { getNextRuns, formatRunTime } from '$lib/tools/cron/nextRuns';
	import { validateCron } from '$lib/tools/cron/validate';
	import { cronPresets } from '$lib/tools/cron/presets';
	import type { TimezoneOption, CronExplainResult, CronNextRunsResult } from '$lib/tools/cron/types';

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
	<title>Cron Explainer & Simulator – Dev Toolbox</title>
	<meta
		name="description"
		content="Explain cron expressions in plain English and preview upcoming run times in your timezone."
	/>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">Cron Explainer & Simulator</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			Explain cron expressions in plain English and preview upcoming execution times. This tool
			supports standard Linux-style 5-field cron syntax commonly used in servers and cloud
			schedulers.
		</p>
	</header>

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-6">
			<div class="space-y-3">
				<label for="cron-input" class="text-sm font-medium">Cron Expression</label>
				<input
					id="cron-input"
					type="text"
					bind:value={cronInput}
					oninput={handleInput}
					placeholder="*/5 * * * *"
					class="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-lg font-mono focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-muted)]/50"
				/>
				<p class="text-xs text-[var(--color-text-muted)]">
					Format: minute hour day-of-month month day-of-week
				</p>
			</div>

			<div class="space-y-3">
				<span class="text-sm font-medium">Quick Presets</span>
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
					<label for="timezone" class="text-sm font-medium">Timezone</label>
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
					<label for="run-count" class="text-sm font-medium">Upcoming Runs</label>
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
				<h3 class="text-sm font-medium mb-3">Field Reference</h3>
				<div class="grid grid-cols-5 gap-2 text-xs font-mono">
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">min</div>
						<div class="text-[var(--color-text-muted)]/60">0-59</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">hour</div>
						<div class="text-[var(--color-text-muted)]/60">0-23</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">day</div>
						<div class="text-[var(--color-text-muted)]/60">1-31</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">month</div>
						<div class="text-[var(--color-text-muted)]/60">1-12</div>
					</div>
					<div class="text-center">
						<div class="text-[var(--color-accent)]">*</div>
						<div class="text-[var(--color-text-muted)]">weekday</div>
						<div class="text-[var(--color-text-muted)]/60">0-6</div>
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
						<span class="font-medium">Invalid Expression</span>
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
								{timezone === 'UTC' ? 'UTC' : 'Local time'}
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
					<p class="text-[var(--color-text-muted)]">Enter a cron expression to see explanation</p>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">What is a Cron Expression?</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			A cron expression is a string used to define a schedule for running tasks automatically. It
			consists of 5 fields that specify when a task should execute: minute, hour, day of month,
			month, and day of week.
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">Special Characters</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>*</strong> — matches any value</li>
			<li><strong>,</strong> — separates multiple values (e.g., 1,3,5)</li>
			<li><strong>-</strong> — defines a range (e.g., 1-5)</li>
			<li><strong>/</strong> — defines a step (e.g., */5 means every 5)</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Common Examples</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">* * * * *</code> — Every minute</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 * * * *</code> — Every hour</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 0 * * *</code> — Every day at midnight</li>
			<li><code class="font-mono bg-[var(--color-bg-tertiary)] px-1 rounded">0 0 * * 0</code> — Every Sunday at midnight</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Privacy Note</h3>
		<p class="text-[var(--color-text-muted)]">
			This tool processes cron expressions entirely in your browser. No data is sent to any server.
		</p>
	</section>
</div>

