<script lang="ts">
	import { browser } from '$app/environment';
	import type { ParsedUrl, QueryParam } from '$lib/tools/url/types';
	import { parseUrl } from '$lib/tools/url/parse';
	import { buildUrl, createEmptyUrl } from '$lib/tools/url/build';
	import { encodeValue, decodeValue } from '$lib/tools/url/encode';

	let urlInput = $state('');
	let parsedUrl: ParsedUrl = $state(createEmptyUrl());
	let queryParams: QueryParam[] = $state([]);
	let error: string | null = $state(null);
	let hasValidUrl = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const rebuiltUrl = $derived(hasValidUrl ? buildUrl(parsedUrl, queryParams) : '');

	$effect(() => {
		const currentInput = urlInput;
		
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (!currentInput.trim()) {
				parsedUrl = createEmptyUrl();
				queryParams = [];
				error = null;
				hasValidUrl = false;
				return;
			}
			
			const result = parseUrl(currentInput);
			if (result.ok) {
				parsedUrl = result.value;
				queryParams = result.params;
				error = null;
				hasValidUrl = true;
			} else {
				error = result.error;
				if (!hasValidUrl) {
					parsedUrl = createEmptyUrl();
					queryParams = [];
				}
			}
		}, 300);
	});

	function handleClear() {
		urlInput = '';
		parsedUrl = createEmptyUrl();
		queryParams = [];
		error = null;
		hasValidUrl = false;
	}

	function handleParse() {
		if (!urlInput.trim()) {
			error = 'Please enter a URL';
			return;
		}
		
		const result = parseUrl(urlInput);
		if (result.ok) {
			parsedUrl = result.value;
			queryParams = result.params;
			error = null;
			hasValidUrl = true;
		} else {
			error = result.error;
		}
	}

	async function copyToClipboard(text: string) {
		if (browser && navigator.clipboard && text) {
			await navigator.clipboard.writeText(text);
		}
	}

	function addParam() {
		queryParams = [
			...queryParams,
			{
				id: Math.random().toString(36).substring(2, 9),
				key: '',
				value: '',
				enabled: true
			}
		];
	}

	function removeParam(id: string) {
		queryParams = queryParams.filter(p => p.id !== id);
	}

	function toggleParam(id: string) {
		queryParams = queryParams.map(p => 
			p.id === id ? { ...p, enabled: !p.enabled } : p
		);
	}

	function updateParamKey(id: string, key: string) {
		queryParams = queryParams.map(p => 
			p.id === id ? { ...p, key } : p
		);
	}

	function updateParamValue(id: string, value: string) {
		queryParams = queryParams.map(p => 
			p.id === id ? { ...p, value } : p
		);
	}

	function clearAllParams() {
		queryParams = [];
	}

	function encodeParamValue(id: string) {
		queryParams = queryParams.map(p => 
			p.id === id ? { ...p, value: encodeValue(p.value) } : p
		);
	}

	function decodeParamValue(id: string) {
		queryParams = queryParams.map(p => {
			if (p.id !== id) return p;
			const result = decodeValue(p.value);
			return result.ok ? { ...p, value: result.value } : p;
		});
	}

	function loadExample() {
		urlInput = 'https://api.example.com/v1/users?id=42&active=true&name=John%20Doe#section';
	}

	const protocolDisplay = $derived(parsedUrl.protocol.replace(':', ''));
</script>

<svelte:head>
	<title>URL Inspector & Builder – Dev Toolbox</title>
	<meta
		name="description"
		content="Parse, inspect, and build URLs. Edit query parameters, encode values, and copy clean URLs instantly."
	/>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
	<header class="mb-8">
		<h1 class="text-3xl font-bold mb-3">URL Inspector & Builder</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			Parse, inspect, and build URLs. Edit query parameters, encode values, and copy clean URLs instantly.
			All processing happens locally — no data leaves your browser.
		</p>
	</header>

	<div class="mb-8 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium">URL Input</span>
			<button
				onclick={loadExample}
				class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
			>
				Example
			</button>
		</div>
		
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={urlInput}
				placeholder="https://api.example.com/v1/users?id=42&active=true"
				class="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
				spellcheck="false"
			/>
		</div>

		<div class="flex flex-wrap items-center gap-2 mt-3">
			<button
				onclick={handleParse}
				class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
			>
				Parse
			</button>
			<button
				onclick={handleClear}
				class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
			>
				Clear
			</button>
			<button
				onclick={() => copyToClipboard(rebuiltUrl)}
				disabled={!rebuiltUrl}
				class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Copy URL
			</button>
		</div>

		{#if error}
			<div class="mt-3 px-3 py-2 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10">
				<p class="text-sm text-[var(--color-error)]">{error}</p>
			</div>
		{/if}
	</div>

	<div class="grid lg:grid-cols-2 gap-8 overflow-hidden">
		<div class="space-y-4 min-w-0">
			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h2 class="text-sm font-medium mb-4">Parsed Components</h2>
				
				{#if hasValidUrl}
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Protocol</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{protocolDisplay}
								</code>
								<button
									onclick={() => copyToClipboard(protocolDisplay)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									Copy
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Hostname</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.hostname || '—'}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.hostname)}
									disabled={!parsedUrl.hostname}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0 disabled:opacity-50"
								>
									Copy
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Port</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.port || '(default)'}
								</code>
								{#if parsedUrl.port}
									<button
										onclick={() => copyToClipboard(parsedUrl.port)}
										class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
									>
										Copy
									</button>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Pathname</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.pathname || '/'}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.pathname)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									Copy
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Hash</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.hash ? '#' + parsedUrl.hash : '(none)'}
								</code>
								{#if parsedUrl.hash}
									<button
										onclick={() => copyToClipboard('#' + parsedUrl.hash)}
										class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
									>
										Copy
									</button>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">Origin</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.origin}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.origin)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									Copy
								</button>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">Enter a URL to see parsed components</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]">
						REBUILT URL
					</span>
					{#if rebuiltUrl}
						<button
							onclick={() => copyToClipboard(rebuiltUrl)}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							Copy
						</button>
					{/if}
				</div>
				{#if rebuiltUrl}
					<pre class="text-sm font-mono text-[var(--color-text)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto overflow-x-hidden">{rebuiltUrl}</pre>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">Enter a URL to see the rebuilt output</p>
				{/if}
			</div>
		</div>

		<div class="space-y-4 min-w-0">
			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-sm font-medium">Query Parameters</h2>
					<div class="flex gap-2">
						<button
							onclick={addParam}
							class="text-xs px-2 py-1 rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
						>
							+ Add
						</button>
						{#if queryParams.length > 0}
							<button
								onclick={clearAllParams}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
							>
								Clear all
							</button>
						{/if}
					</div>
				</div>

				{#if queryParams.length > 0}
					<div class="space-y-2">
						{#each queryParams as param (param.id)}
							<div class="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] overflow-hidden {!param.enabled ? 'opacity-50' : ''}">
								<label class="shrink-0">
									<input
										type="checkbox"
										checked={param.enabled}
										onchange={() => toggleParam(param.id)}
										class="rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
									/>
								</label>
								
								<input
									type="text"
									value={param.key}
									oninput={(e) => updateParamKey(param.id, e.currentTarget.value)}
									placeholder="key"
									class="w-28 px-2 py-1 text-xs font-mono rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
									spellcheck="false"
								/>
								
								<span class="text-[var(--color-text-muted)]">=</span>
								
								<input
									type="text"
									value={param.value}
									oninput={(e) => updateParamValue(param.id, e.currentTarget.value)}
									placeholder="value"
									class="flex-1 min-w-0 px-2 py-1 text-xs font-mono rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
									spellcheck="false"
								/>
								
								<button
									onclick={() => encodeParamValue(param.id)}
									title="Encode value"
									class="text-xs px-1.5 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									%
								</button>
								<button
									onclick={() => decodeParamValue(param.id)}
									title="Decode value"
									class="text-xs px-1.5 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									A
								</button>
								
								<button
									onclick={() => removeParam(param.id)}
									title="Remove parameter"
									class="text-xs px-1.5 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors shrink-0"
								>
									×
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">
						{hasValidUrl ? 'No query parameters. Click "Add" to create one.' : 'Parse a URL to see its query parameters'}
					</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h2 class="text-sm font-medium mb-3">Encoding Helper</h2>
				<p class="text-xs text-[var(--color-text-muted)] mb-3">
					Use the <code class="px-1 py-0.5 bg-[var(--color-bg-tertiary)] rounded">%</code> and <code class="px-1 py-0.5 bg-[var(--color-bg-tertiary)] rounded">A</code> buttons on each parameter to encode or decode its value.
				</p>
				<div class="text-xs text-[var(--color-text-muted)] space-y-1">
					<p><code class="text-[var(--color-accent)]">%</code> → Encode (e.g., "hello world" → "hello%20world")</p>
					<p><code class="text-[var(--color-accent)]">A</code> → Decode (e.g., "hello%20world" → "hello world")</p>
				</div>
			</div>
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">About URL Inspector</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			Inspect and build URLs locally. Parse components, edit query parameters, and copy clean URLs for APIs and debugging.
			No data leaves your browser.
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">URL Components</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>Protocol</strong> — The scheme (http, https, ftp, etc.)</li>
			<li><strong>Hostname</strong> — The domain or IP address</li>
			<li><strong>Port</strong> — Optional port number (default is implicit)</li>
			<li><strong>Pathname</strong> — The path to the resource</li>
			<li><strong>Query</strong> — Key-value parameters after the ?</li>
			<li><strong>Hash</strong> — Fragment identifier after the #</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Features</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>Live Parsing</strong> — URLs are parsed as you type</li>
			<li><strong>Query Editor</strong> — Add, remove, and toggle parameters</li>
			<li><strong>Encoding</strong> — Encode and decode parameter values</li>
			<li><strong>Copy Buttons</strong> — Copy any component instantly</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">URL Encoding</h3>
		<p class="text-[var(--color-text-muted)] mb-2">
			Special characters in URLs must be percent-encoded:
		</p>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>Space → <code class="text-[var(--color-accent)]">%20</code></li>
			<li>Ampersand → <code class="text-[var(--color-accent)]">%26</code></li>
			<li>Equals → <code class="text-[var(--color-accent)]">%3D</code></li>
			<li>Question mark → <code class="text-[var(--color-accent)]">%3F</code></li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">Privacy Note</h3>
		<p class="text-[var(--color-text-muted)]">
			This tool runs entirely in your browser. No URLs or data are sent to any server. Your data stays private.
		</p>
	</section>
</div>

