<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import type {
		RequestModel,
		HttpMethod,
		BodyType,
		GeneratorType,
		KeyValuePair
	} from '$lib/tools/request/types';
	import { normalizeRequest, isValidUrl, generateId } from '$lib/tools/request/normalize';
	import { prettifyJson, minifyJson, validateJson } from '$lib/tools/request/json';
	import { generateCurl, generateFetchTs, generateAxios, generateHttpie } from '$lib/tools/request/generators';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/request`);

	// Request model state
	let method: HttpMethod = $state('GET');
	let url = $state('');
	let query: KeyValuePair[] = $state([{ id: generateId(), key: '', value: '', enabled: true }]);
	let headers: KeyValuePair[] = $state([{ id: generateId(), key: '', value: '', enabled: true }]);
	let bodyType: BodyType = $state('none');
	let bodyValue = $state('');
	let maskHeaders = $state(false);

	// UI state
	let activeTab: GeneratorType = $state('curl');
	let jsonError: string | null = $state(null);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Generated code
	let generatedCode = $state('');
	let warnings: string[] = $state([]);

	const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

	// Auto-update body type based on method
	$effect(() => {
		if (['POST', 'PUT', 'PATCH'].includes(method) && bodyType === 'none') {
			bodyType = 'json';
		}
	});

	// Generate code on changes
	$effect(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(generateCode, 300);
	});

	function generateCode() {
		if (!url.trim()) {
			generatedCode = '';
			warnings = [];
			return;
		}

		const model: RequestModel = {
			method,
			url,
			query,
			headers,
			body: { type: bodyType, value: bodyValue }
		};

		const normalized = normalizeRequest(model);
		let result;

		switch (activeTab) {
			case 'curl':
				result = generateCurl(normalized);
				break;
			case 'fetch':
				result = generateFetchTs(normalized);
				break;
			case 'axios':
				result = generateAxios(normalized);
				break;
			case 'httpie':
				result = generateHttpie(normalized);
				break;
		}

		generatedCode = result.code;
		warnings = result.warnings;
	}

	function addQueryParam() {
		query = [...query, { id: generateId(), key: '', value: '', enabled: true }];
	}

	function removeQueryParam(id: string) {
		query = query.filter((p) => p.id !== id);
	}

	function addHeader() {
		headers = [...headers, { id: generateId(), key: '', value: '', enabled: true }];
	}

	function removeHeader(id: string) {
		headers = headers.filter((h) => h.id !== id);
	}

	function addJsonHeader() {
		const existing = headers.find((h) => h.key.toLowerCase() === 'content-type');
		if (existing) {
			existing.value = 'application/json';
			existing.enabled = true;
			headers = [...headers];
		} else {
			headers = [
				...headers,
				{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true }
			];
		}
	}

	function addAuthHeader() {
		const existing = headers.find((h) => h.key.toLowerCase() === 'authorization');
		if (!existing) {
			headers = [
				...headers,
				{ id: generateId(), key: 'Authorization', value: 'Bearer ', enabled: true }
			];
		}
	}

	function handlePrettify() {
		const result = prettifyJson(bodyValue);
		if (result.ok) {
			bodyValue = result.result;
			jsonError = null;
		} else {
			jsonError = result.error;
		}
	}

	function handleMinify() {
		const result = minifyJson(bodyValue);
		if (result.ok) {
			bodyValue = result.result;
			jsonError = null;
		} else {
			jsonError = result.error;
		}
	}

	function handleValidate() {
		const result = validateJson(bodyValue);
		if (result.valid) {
			jsonError = null;
		} else {
			jsonError = result.error;
		}
	}

	function loadExample() {
		url = 'https://jsonplaceholder.typicode.com/posts';
		method = 'POST';
		headers = [
			{ id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
			{ id: generateId(), key: 'Authorization', value: 'Bearer your-token-here', enabled: true }
		];
		bodyType = 'json';
		bodyValue = JSON.stringify(
			{
				title: 'Hello World',
				body: 'This is a test post',
				userId: 1
			},
			null,
			2
		);
		query = [{ id: generateId(), key: '', value: '', enabled: true }];
	}

	function resetForm() {
		method = 'GET';
		url = '';
		query = [{ id: generateId(), key: '', value: '', enabled: true }];
		headers = [{ id: generateId(), key: '', value: '', enabled: true }];
		bodyType = 'none';
		bodyValue = '';
		jsonError = null;
	}

	async function copyCode() {
		if (browser && navigator.clipboard && generatedCode) {
			await navigator.clipboard.writeText(generatedCode);
		}
	}
</script>

<svelte:head>
	<title>{tStringReactive('request.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('request.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('request.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('request.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="API Request Builder – Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Build API requests and generate curl, fetch, and axios snippets instantly. Works locally, no tracking."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/request" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "API Request Builder",
			"description": "Build API requests and generate curl, fetch, and axios snippets instantly. Works locally, no tracking.",
			"url": "https://devtools.dataflowkit.dev/request",
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
		<h1 class="text-3xl font-bold mb-3">{tStringReactive('request.heading', $locale)}</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('request.subtitle', $locale)}
		</p>
	</header>

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-6">
			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm font-medium">{tStringReactive('request.request', $locale)}</span>
					<div class="flex gap-2">
						<button
							onclick={loadExample}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{tStringReactive('request.example', $locale)}
						</button>
						<button
							onclick={resetForm}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
						>
							{tStringReactive('request.reset', $locale)}
						</button>
					</div>
				</div>

				<div class="flex gap-2">
					<select
						bind:value={method}
						class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-medium focus:outline-none focus:border-[var(--color-accent)]"
					>
						{#each methods as m}
							<option value={m}>{m}</option>
						{/each}
					</select>

					<input
						type="text"
						bind:value={url}
						placeholder="https://api.example.com/endpoint"
						class="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
					/>
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm font-medium">{tStringReactive('request.queryParams', $locale)}</span>
					<button
						onclick={addQueryParam}
						class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
					>
						+ {tStringReactive('request.add', $locale)}
					</button>
				</div>

				<div class="space-y-2">
					{#each query as param (param.id)}
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={param.enabled}
								class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
							/>
							<input
								type="text"
								bind:value={param.key}
								placeholder={tStringReactive('request.key', $locale)}
								class="flex-1 px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
							/>
							<input
								type="text"
								bind:value={param.value}
								placeholder={tStringReactive('request.value', $locale)}
								class="flex-1 px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
							/>
							<button
								onclick={() => removeQueryParam(param.id)}
								class="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-3">
						<span class="text-sm font-medium">{tStringReactive('request.headers', $locale)}</span>
						<label class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer">
							<input
								type="checkbox"
								bind:checked={maskHeaders}
								class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
							/>
							{tStringReactive('request.maskValues', $locale)}
						</label>
					</div>
					<div class="flex gap-2">
						<button
							onclick={addJsonHeader}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							+ {tStringReactive('request.json', $locale)}
						</button>
						<button
							onclick={addAuthHeader}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							+ Auth
						</button>
						<button
							onclick={addHeader}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							+ {tStringReactive('request.add', $locale)}
						</button>
					</div>
				</div>

				<div class="space-y-2">
					{#each headers as header (header.id)}
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={header.enabled}
								class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
							/>
							<input
								type="text"
								bind:value={header.key}
								placeholder="Header-Name"
								class="flex-1 px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
							/>
							<input
								type={maskHeaders ? 'password' : 'text'}
								bind:value={header.value}
								placeholder={tStringReactive('request.value', $locale)}
								class="flex-1 px-2 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
							/>
							<button
								onclick={() => removeHeader(header.id)}
								class="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm font-medium">{tStringReactive('request.body', $locale)}</span>
					<select
						bind:value={bodyType}
						class="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
					>
						<option value="none">{tStringReactive('request.none', $locale)}</option>
						<option value="json">{tStringReactive('request.json', $locale)}</option>
						<option value="raw">{tStringReactive('request.raw', $locale)}</option>
						<option value="form">{tStringReactive('request.formData', $locale)}</option>
					</select>
				</div>

				{#if bodyType !== 'none'}
					{#if bodyType === 'json'}
						<div class="flex gap-2 mb-2">
							<button
								onclick={handlePrettify}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('json.prettify', $locale)}
							</button>
							<button
								onclick={handleMinify}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('json.minify', $locale)}
							</button>
							<button
								onclick={handleValidate}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('json.validate', $locale)}
							</button>
						</div>
					{/if}

					<textarea
						bind:value={bodyValue}
						placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
						class="w-full h-32 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
					></textarea>

					{#if jsonError}
						<p class="mt-2 text-xs text-[var(--color-error)]">⚠️ {jsonError}</p>
					{/if}
				{/if}
			</div>
		</div>

		<div class="space-y-4">
			<div class="flex gap-1 p-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
				{#each ['curl', 'fetch', 'axios', 'httpie'] as tab}
					<button
						onclick={() => {
							activeTab = tab as GeneratorType;
							generateCode();
						}}
						class="flex-1 px-3 py-2 text-sm rounded-md transition-colors {activeTab === tab
							? 'bg-[var(--color-accent)] text-white'
							: 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tab === 'fetch' ? 'fetch (TS)' : tab}
					</button>
				{/each}
			</div>

			<div
				class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
			>
				<div class="flex items-center justify-between mb-3">
					<span
						class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
					>
						{activeTab.toUpperCase()}
					</span>
					{#if generatedCode}
						<button
							onclick={copyCode}
							class="text-xs px-3 py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
						>
							{tStringReactive('request.copy', $locale)}
						</button>
					{/if}
				</div>

				{#if !url.trim()}
					<div class="py-8 text-center text-[var(--color-text-muted)]">
						<p>{tStringReactive('request.enterUrl', $locale)}</p>
					</div>
				{:else if !isValidUrl(url)}
					<div
						class="p-4 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
					>
						<p class="text-sm text-[var(--color-warning)]">⚠️ Please enter a valid URL</p>
					</div>
				{:else}
					{#if warnings.length > 0}
						<div class="mb-3 p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
							{#each warnings as warning}
								<p class="text-xs text-[var(--color-warning)]">⚠️ {warning}</p>
							{/each}
						</div>
					{/if}

					<pre
						class="text-sm font-mono text-[var(--color-text-muted)] overflow-x-auto whitespace-pre-wrap break-all">{generatedCode}</pre>
				{/if}
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div
					class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<h4 class="text-xs font-medium text-[var(--color-accent)] mb-1">curl</h4>
					<p class="text-xs text-[var(--color-text-muted)]">
						Command-line tool. Works in terminals, scripts, and CI/CD.
					</p>
				</div>
				<div
					class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<h4 class="text-xs font-medium text-[var(--color-success)] mb-1">fetch</h4>
					<p class="text-xs text-[var(--color-text-muted)]">
						Native browser API. TypeScript-ready, no dependencies.
					</p>
				</div>
				<div
					class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<h4 class="text-xs font-medium text-[var(--color-warning)] mb-1">axios</h4>
					<p class="text-xs text-[var(--color-text-muted)]">
						Popular HTTP client. Works in Node.js and browsers.
					</p>
				</div>
				<div
					class="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
				>
					<h4 class="text-xs font-medium text-[var(--color-text)] mb-1">httpie</h4>
					<p class="text-xs text-[var(--color-text-muted)]">
						Human-friendly CLI. Great for testing and debugging.
					</p>
				</div>
			</div>
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">{tStringReactive('request.about', $locale)}</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			{tStringReactive('request.aboutDescription', $locale)}
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('request.supportedFormats', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>
				<strong>curl</strong> — {tStringReactive('request.curlDescription', $locale)}
			</li>
			<li>
				<strong>fetch</strong> — {tStringReactive('request.fetchDescription', $locale)}
			</li>
			<li>
				<strong>axios</strong> — {tStringReactive('request.axiosDescription', $locale)}
			</li>
			<li>
				<strong>httpie</strong> — {tStringReactive('request.httpieDescription', $locale)}
			</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('request.privacyNote', $locale)}</h3>
		<p class="text-[var(--color-text-muted)]">
			{tStringReactive('request.privacyText', $locale)}
		</p>
	</section>
</div>

