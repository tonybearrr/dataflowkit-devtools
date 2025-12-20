<script lang="ts">
	import { browser } from '$app/environment';
	import { SvelteSet } from 'svelte/reactivity';
	import JsonTree from '$lib/components/JsonTree.svelte';
	import {
		parseJson,
		isLargeJson,
		checkBracketBalance,
		getBracketBalanceMessage
	} from '$lib/tools/json/parse';
	import { prettify, minify } from '$lib/tools/json/format';
	import type { JsonValue, ParseResult, BracketBalance } from '$lib/tools/json/types';

	let input = $state('');
	let output = $state('');
	let parsedValue: JsonValue | null = $state(null);
	let parseResult: ParseResult | null = $state(null);
	let bracketBalance: BracketBalance | null = $state(null);
	let sortKeys = $state(false);
	let autoValidate = $state(true);
	let searchTerm = $state('');
	let activeTab: 'output' | 'tree' = $state('output');
	let isLarge = $state(false);
	let textareaEl: HTMLTextAreaElement | null = $state(null);
	let lineNumbersEl: HTMLDivElement | null = $state(null);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	
	// Derived bracket balance message
	const bracketMessage = $derived(
		bracketBalance ? getBracketBalanceMessage(bracketBalance) : null
	);

	// Get lines with bracket issues for highlighting
	function getBracketIssueLines(): SvelteSet<number> {
		if (!bracketBalance) return new SvelteSet<number>();
		const lines = new SvelteSet<number>();
		bracketBalance.unclosed.forEach((b) => lines.add(b.line));
		bracketBalance.unexpected.forEach((b) => lines.add(b.line));
		return lines;
	}

	// Get line highlighting class
	function getLineClass(lineNum: number): string {
		const isErrorLine = parseResult && !parseResult.ok && parseResult.line === lineNum;
		const isBracketIssue = getBracketIssueLines().has(lineNum);

		if (isErrorLine) {
			return 'text-[var(--color-error)] bg-[var(--color-error)]/10';
		}
		if (isBracketIssue) {
			return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10';
		}
		return 'text-[var(--color-text-muted)]/50';
	}

	// Calculate line numbers
	const lineCount = $derived(input ? input.split('\n').length : 1);
	const lineNumbers = $derived(Array.from({ length: lineCount }, (_, i) => i + 1));

	// Get error line content
	function getErrorLineContent(line: number): string | null {
		if (!input || !line) return null;
		const lines = input.split('\n');
		if (line > 0 && line <= lines.length) {
			return lines[line - 1];
		}
		return null;
	}

	// Sync scroll between line numbers and textarea
	function handleScroll() {
		if (lineNumbersEl && textareaEl) {
			const inner = lineNumbersEl.querySelector('.line-numbers-inner') as HTMLElement;
			if (inner) {
				inner.style.transform = `translateY(-${textareaEl.scrollTop}px)`;
			}
		}
	}

	// Auto-validate on input
	$effect(() => {
		if (autoValidate && input) {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(validate, 300);
		}
	});

	function validate() {
		isLarge = isLargeJson(input);
		const result = parseJson(input);
		parseResult = result;

		if (result.ok) {
			parsedValue = result.value;
			bracketBalance = null;
		} else {
			parsedValue = null;
			// Check bracket balance to provide helpful hints
			bracketBalance = checkBracketBalance(input);
		}
	}

	function handlePrettify() {
		const result = parseJson(input);
		parseResult = result;

		if (result.ok) {
			parsedValue = result.value;
			output = prettify(result.value, sortKeys);
			input = output;
		}
	}

	function handleMinify() {
		const result = parseJson(input);
		parseResult = result;

		if (result.ok) {
			parsedValue = result.value;
			output = minify(result.value);
			input = output;
		}
	}

	function handleClear() {
		input = '';
		output = '';
		parsedValue = null;
		parseResult = null;
		bracketBalance = null;
		searchTerm = '';
	}

	async function copyOutput() {
		if (browser && navigator.clipboard && output) {
			await navigator.clipboard.writeText(output);
		}
	}

	async function copyMinified() {
		if (browser && navigator.clipboard && parsedValue !== null) {
			await navigator.clipboard.writeText(minify(parsedValue));
		}
	}

	function loadExample() {
		input = JSON.stringify(
			{
				name: 'Dev Toolbox',
				version: '1.0.0',
				tools: ['JWT', 'Cron', 'Timestamp', 'Request', 'JSON'],
				config: {
					theme: 'dark',
					autoValidate: true,
					features: {
						prettify: true,
						minify: true,
						treeView: true
					}
				},
				users: [
					{ id: 1, name: 'Alice', active: true },
					{ id: 2, name: 'Bob', active: false }
				],
				metadata: null
			},
			null,
			2
		);
		validate();
	}
</script>

<svelte:head>
	<title>JSON Formatter & Inspector – Dev Toolbox</title>
	<meta
		name="description"
		content="Prettify, minify, validate, and inspect JSON locally. Search keys/values and copy clean output instantly."
	/>
	<meta property="og:title" content="JSON Formatter & Inspector – Dev Toolbox" />
	<meta
		property="og:description"
		content="Prettify, minify, validate, and inspect JSON locally. Search keys/values and copy clean output instantly."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://devtools.dataflowkit.dev/json" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="JSON Formatter & Inspector – Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Prettify, minify, validate, and inspect JSON locally. Search keys/values and copy clean output instantly."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/json" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "JSON Formatter & Inspector",
			"description": "Prettify, minify, validate, and inspect JSON locally. Search keys/values and copy clean output instantly.",
			"url": "https://devtools.dataflowkit.dev/json",
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

<div class="max-w-7xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">JSON Formatter & Inspector</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			Format, minify, validate, and inspect JSON locally. Useful for debugging API responses,
			configuration files, and logs. No data leaves your browser.
		</p>
	</header>

	{#if isLarge}
		<div
			class="mb-6 p-4 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
		>
			<p class="text-sm text-[var(--color-warning)]">
				⚠️ Large JSON detected (> 2MB). Processing may be slow.
			</p>
		</div>
	{/if}

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-4">
			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm font-medium">Input</span>
					<div class="flex items-center gap-2">
						<button
							onclick={loadExample}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							Example
						</button>
					</div>
				</div>

				<div class="relative flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] h-64">
					<div
						bind:this={lineNumbersEl}
						class="flex-shrink-0 w-10 py-2 bg-[var(--color-bg-tertiary)] border-r border-[var(--color-border)] overflow-hidden select-none pointer-events-none"
					>
						<div class="line-numbers-inner">
							{#each lineNumbers as num (num)}
								<div
									class="h-5 px-2 text-right text-xs font-mono leading-5 {getLineClass(num)}"
								>
									{num}
								</div>
							{/each}
						</div>
					</div>
					<textarea
						bind:this={textareaEl}
						bind:value={input}
						onscroll={handleScroll}
						placeholder={'{\n  "key": "value"\n}'}
						class="flex-1 h-full py-2 px-3 bg-transparent text-sm font-mono resize-none focus:outline-none placeholder:text-[var(--color-text-muted)]/50 leading-5 overflow-y-auto"
						spellcheck="false"
					></textarea>
				</div>

				<div class="flex flex-wrap items-center gap-2 mt-3">
					<button
						onclick={validate}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
					>
						Validate
					</button>
					<button
						onclick={handlePrettify}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
					>
						Prettify
					</button>
					<button
						onclick={handleMinify}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
					>
						Minify
					</button>
					<button
						onclick={handleClear}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
					>
						Clear
					</button>
				</div>

				<div class="flex flex-wrap items-center gap-4 mt-3 text-xs">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={autoValidate}
							class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
						/>
						<span class="text-[var(--color-text-muted)]">Auto-validate</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={sortKeys}
							class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
						/>
						<span class="text-[var(--color-text-muted)]">Sort keys</span>
					</label>
				</div>
			</div>

			{#if parseResult}
				{#if parseResult.ok}
					<div
						class="p-3 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10"
					>
						<p class="text-sm text-[var(--color-success)]">✓ Valid JSON</p>
					</div>
				{:else}
					<div
						class="p-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10"
					>
						<p class="text-sm text-[var(--color-error)]">✗ Invalid JSON</p>
						<p class="text-xs text-[var(--color-text-muted)] mt-1">{parseResult.error}</p>
						{#if parseResult.line || parseResult.column}
							<p class="text-xs text-[var(--color-text-muted)]">
								Line {parseResult.line}, Column {parseResult.column}
							</p>
							{@const errorLine = getErrorLineContent(parseResult.line ?? 0)}
							{#if errorLine}
								<div class="mt-2 p-2 rounded bg-[var(--color-bg-tertiary)] overflow-x-auto">
									<pre class="text-xs font-mono"><span class="text-[var(--color-text-muted)]/50 mr-2">{parseResult.line}</span><span class="text-[var(--color-text)]">{errorLine}</span></pre>
									{#if parseResult.column}
										<pre class="text-xs font-mono text-[var(--color-error)]">{' '.repeat(String(parseResult.line).length + 2 + (parseResult.column - 1))}^</pre>
									{/if}
								</div>
							{/if}
						{/if}
						{#if bracketMessage}
							<div class="mt-3 p-2 rounded bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
								<p class="text-xs text-[var(--color-warning)] font-medium mb-1">💡 Tip:</p>
								<p class="text-xs text-[var(--color-text-muted)]">{bracketMessage}</p>
								{#if bracketBalance && bracketBalance.unclosed.length > 0}
									<div class="mt-2 flex flex-wrap gap-1">
										{#each bracketBalance.unclosed as bracket (bracket.position)}
											<button
												type="button"
											onclick={() => {
												// Focus and select the bracket position
												if (textareaEl) {
													textareaEl.focus();
													textareaEl.setSelectionRange(bracket.position, bracket.position + 1);
												}
											}}
												class="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20 transition-colors"
											>
												{bracket.char} line {bracket.line}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>

		<div class="space-y-4">
			<div
				class="flex gap-1 p-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
			>
				<button
					onclick={() => (activeTab = 'output')}
					class="flex-1 px-3 py-2 text-sm rounded-md transition-colors {activeTab === 'output'
						? 'bg-[var(--color-accent)] text-white'
						: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
				>
					Output
				</button>
				<button
					onclick={() => (activeTab = 'tree')}
					class="flex-1 px-3 py-2 text-sm rounded-md transition-colors {activeTab === 'tree'
						? 'bg-[var(--color-accent)] text-white'
						: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
				>
					Tree
				</button>
			</div>

			{#if activeTab === 'output'}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-3">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
						>
							OUTPUT
						</span>
						{#if parsedValue !== null}
							<div class="flex gap-2">
								<button
									onclick={copyOutput}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
								>
									Copy output
								</button>
								<button
									onclick={copyMinified}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
								>
									Copy minified
								</button>
							</div>
						{/if}
					</div>

					{#if parsedValue !== null}
						<pre
							class="text-sm font-mono text-[var(--color-text-muted)] overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">{output ||
								prettify(parsedValue, sortKeys)}</pre>
					{:else}
						<div class="py-8 text-center text-[var(--color-text-muted)]">
							<p>Enter valid JSON to see output</p>
						</div>
					{/if}
				</div>
			{:else}
				<div
					class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<div class="flex items-center justify-between mb-3">
						<span
							class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]"
						>
							TREE VIEWER
						</span>
					</div>

					<div class="mb-3">
						<input
							type="text"
							bind:value={searchTerm}
							placeholder="Search keys and values..."
							class="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
						/>
					</div>

					{#if parsedValue !== null}
						<div class="max-h-96 overflow-y-auto overflow-x-auto">
							<JsonTree value={parsedValue} search={searchTerm} />
						</div>
					{:else}
						<div class="py-8 text-center text-[var(--color-text-muted)]">
							<p>Enter valid JSON to see tree view</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">About JSON Formatter</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			This tool helps you work with JSON data quickly and efficiently. Whether you're debugging API
			responses, editing configuration files, or inspecting logs, the JSON Formatter has you
			covered.
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">Features</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>Prettify</strong> — Format JSON with proper indentation</li>
			<li><strong>Minify</strong> — Compress JSON to a single line</li>
			<li><strong>Validate</strong> — Check JSON syntax with detailed error messages</li>
			<li><strong>Tree View</strong> — Navigate large JSON with collapsible nodes</li>
			<li><strong>Search</strong> — Find keys and values instantly</li>
			<li><strong>Sort Keys</strong> — Alphabetically sort object keys</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Tips</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>Click on a key in the tree view to copy its JSONPath</li>
			<li>Use the search box to filter the tree and highlight matches</li>
			<li>Enable "Sort keys" for consistent output when comparing JSON</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Privacy Note</h3>
		<p class="text-[var(--color-text-muted)]">
			This tool runs entirely in your browser. No JSON data is sent to any server. Your data stays
			private.
		</p>
	</section>
</div>

