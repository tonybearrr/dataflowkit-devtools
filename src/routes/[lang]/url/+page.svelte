<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import type { ParsedUrl, QueryParam } from '$lib/tools/url/types';
	import { parseUrl } from '$lib/tools/url/parse';
	import { buildUrl, createEmptyUrl } from '$lib/tools/url/build';
	import { encodeValue, decodeValue } from '$lib/tools/url/encode';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/url`);

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
	<title>{tStringReactive('url.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('url.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('url.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('url.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="URL Inspector & Builder – Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Parse, inspect, and build URLs. Edit query parameters, encode values, and copy clean URLs instantly."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/url" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "URL Inspector & Builder",
			"description": "Parse, inspect, and build URLs. Edit query parameters, encode values, and copy clean URLs instantly.",
			"url": "https://devtools.dataflowkit.dev/url",
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
		<h1 class="text-3xl font-bold mb-3">{tStringReactive('url.heading', $locale)}</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('url.subtitle', $locale)}
		</p>
	</header>

	<div class="mb-8 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-medium">{tStringReactive('url.enterUrl', $locale)}</span>
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
				{tStringReactive('common.parse', $locale)}
			</button>
			<button
				onclick={handleClear}
				class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
			>
				{tStringReactive('common.clear', $locale)}
			</button>
			<button
				onclick={() => copyToClipboard(rebuiltUrl)}
				disabled={!rebuiltUrl}
				class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{tStringReactive('url.copyUrl', $locale)}
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
				<h2 class="text-sm font-medium mb-4">{tStringReactive('url.parsedComponents', $locale)}</h2>
				
				{#if hasValidUrl}
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.protocol', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{protocolDisplay}
								</code>
								<button
									onclick={() => copyToClipboard(protocolDisplay)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									{tStringReactive('common.copy', $locale)}
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.hostname', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.hostname || '—'}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.hostname)}
									disabled={!parsedUrl.hostname}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0 disabled:opacity-50"
								>
									{tStringReactive('common.copy', $locale)}
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.port', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.port || tStringReactive('url.default', $locale)}
								</code>
								{#if parsedUrl.port}
									<button
										onclick={() => copyToClipboard(parsedUrl.port)}
										class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
									>
										{tStringReactive('common.copy', $locale)}
									</button>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.pathname', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.pathname || '/'}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.pathname)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									{tStringReactive('common.copy', $locale)}
								</button>
							</div>
						</div>

						<div class="flex items-center gap-2">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.hash', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.hash ? '#' + parsedUrl.hash : '(none)'}
								</code>
								{#if parsedUrl.hash}
									<button
										onclick={() => copyToClipboard('#' + parsedUrl.hash)}
										class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
									>
										{tStringReactive('common.copy', $locale)}
									</button>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
							<span class="w-24 text-xs text-[var(--color-text-muted)] shrink-0">{tStringReactive('url.origin', $locale)}</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<code class="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] overflow-x-auto whitespace-nowrap min-w-0">
									{parsedUrl.origin}
								</code>
								<button
									onclick={() => copyToClipboard(parsedUrl.origin)}
									class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									{tStringReactive('common.copy', $locale)}
								</button>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">{tStringReactive('url.enterUrl', $locale)}</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]">
						{tStringReactive('url.output', $locale).toUpperCase()}
					</span>
					{#if rebuiltUrl}
						<button
							onclick={() => copyToClipboard(rebuiltUrl)}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{tStringReactive('common.copy', $locale)}
						</button>
					{/if}
				</div>
				{#if rebuiltUrl}
					<pre class="text-sm font-mono text-[var(--color-text)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto overflow-x-hidden">{rebuiltUrl}</pre>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">{tStringReactive('url.enterUrl', $locale)}</p>
				{/if}
			</div>
		</div>

		<div class="space-y-4 min-w-0">
			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-sm font-medium">{tStringReactive('url.queryParams', $locale)}</h2>
					<div class="flex gap-2">
						<button
							onclick={addParam}
							class="text-xs px-2 py-1 rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
						>
							+ {tStringReactive('url.addParam', $locale)}
						</button>
						{#if queryParams.length > 0}
							<button
								onclick={clearAllParams}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
							>
								{tStringReactive('url.clearAll', $locale)}
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
									placeholder={tStringReactive('url.key', $locale)}
									class="w-28 px-2 py-1 text-xs font-mono rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
									spellcheck="false"
								/>
								
								<span class="text-[var(--color-text-muted)]">=</span>
								
								<input
									type="text"
									value={param.value}
									oninput={(e) => updateParamValue(param.id, e.currentTarget.value)}
									placeholder={tStringReactive('url.value', $locale)}
									class="flex-1 min-w-0 px-2 py-1 text-xs font-mono rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] focus:outline-none focus:border-[var(--color-accent)]"
									spellcheck="false"
								/>
								
								<button
									onclick={() => encodeParamValue(param.id)}
									title={tStringReactive('url.encodeValue', $locale)}
									class="text-xs px-1.5 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors shrink-0"
								>
									%
								</button>
								<button
									onclick={() => decodeParamValue(param.id)}
									title={tStringReactive('url.decodeValue', $locale)}
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
						{hasValidUrl ? tStringReactive('url.noQueryParams', $locale) : tStringReactive('url.parseUrlToSeeParams', $locale)}
					</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<h2 class="text-sm font-medium mb-3">{tStringReactive('url.encodingHelper', $locale)}</h2>
				<p class="text-xs text-[var(--color-text-muted)] mb-3">
					{tStringReactive('url.encodingHelperDescription', $locale)}
				</p>
				<div class="text-xs text-[var(--color-text-muted)] space-y-1">
					<p><code class="text-[var(--color-accent)]">%</code> → {tStringReactive('url.encodingEncode', $locale)}</p>
					<p><code class="text-[var(--color-accent)]">A</code> → {tStringReactive('url.encodingDecode', $locale)}</p>
				</div>
			</div>
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">{tStringReactive('url.about', $locale)}</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			{tStringReactive('url.aboutDescription', $locale)}
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('url.urlComponents', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>{tStringReactive('url.protocol', $locale)}</strong> — {tStringReactive('url.componentProtocol', $locale)}</li>
			<li><strong>{tStringReactive('url.hostname', $locale)}</strong> — {tStringReactive('url.componentHostname', $locale)}</li>
			<li><strong>{tStringReactive('url.port', $locale)}</strong> — {tStringReactive('url.componentPort', $locale)}</li>
			<li><strong>{tStringReactive('url.pathname', $locale)}</strong> — {tStringReactive('url.componentPathname', $locale)}</li>
			<li><strong>Query</strong> — {tStringReactive('url.componentQuery', $locale)}</li>
			<li><strong>{tStringReactive('url.hash', $locale)}</strong> — {tStringReactive('url.componentHash', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('url.features', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>Live Parsing</strong> — {tStringReactive('url.featureLiveParsing', $locale)}</li>
			<li><strong>Query Editor</strong> — {tStringReactive('url.featureQueryEditor', $locale)}</li>
			<li><strong>Encoding</strong> — {tStringReactive('url.featureEncoding', $locale)}</li>
			<li><strong>Copy Buttons</strong> — {tStringReactive('url.featureCopyButtons', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('url.urlEncoding', $locale)}</h3>
		<p class="text-[var(--color-text-muted)] mb-2">
			{tStringReactive('url.urlEncodingDescription', $locale)}
		</p>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>{tStringReactive('url.encodingSpace', $locale)}</li>
			<li>{tStringReactive('url.encodingAmpersand', $locale)}</li>
			<li>{tStringReactive('url.encodingEquals', $locale)}</li>
			<li>{tStringReactive('url.encodingQuestion', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('url.privacyNote', $locale)}</h3>
		<p class="text-[var(--color-text-muted)]">
			{tStringReactive('url.privacyText', $locale)}
		</p>
	</section>
</div>

