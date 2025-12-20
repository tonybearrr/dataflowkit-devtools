<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';
	import type { InputKind, ConvertResult } from '$lib/tools/base64/types';
	import { textToBytes, bytesToText } from '$lib/tools/base64/bytes';
	import { bytesToBase64, base64ToBytes } from '$lib/tools/base64/base64';
	import { bytesToBase64Url, base64UrlToBytes, base64ToBase64Url, base64UrlToBase64 } from '$lib/tools/base64/base64url';
	import { bytesToHex, hexToBytes } from '$lib/tools/base64/hex';
	import { detectInputKind } from '$lib/tools/base64/detect';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/base64`);

	let input = $state('');
	let inputKind: InputKind = $state('auto');
	let trimWhitespace = $state(true);
	let strictMode = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const processedInput = $derived(trimWhitespace ? input.trim() : input);
	const detectedKind = $derived(detectInputKind(processedInput));
	const effectiveKind = $derived(inputKind === 'auto' ? detectedKind : inputKind);

	// Conversion results
	interface ConversionResults {
		text: ConvertResult<string>;
		base64: ConvertResult<string>;
		base64url: ConvertResult<string>;
		hex: ConvertResult<string>;
	}

	let results: ConversionResults = $state({
		text: { ok: true, value: '' },
		base64: { ok: true, value: '' },
		base64url: { ok: true, value: '' },
		hex: { ok: true, value: '' }
	});

	$effect(() => {
		const currentInput = processedInput;
		const currentKind = effectiveKind;
		const currentStrict = strictMode;
		
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			results = convert(currentInput, currentKind, currentStrict);
		}, 200);
	});

	function convert(value: string, kind: Exclude<InputKind, 'auto'>, strict: boolean): ConversionResults {
		if (!value) {
			return {
				text: { ok: true, value: '' },
				base64: { ok: true, value: '' },
				base64url: { ok: true, value: '' },
				hex: { ok: true, value: '' }
			};
		}

		let bytes: Uint8Array;
		let textResult: ConvertResult<string>;

		// First, get bytes from input based on kind
		switch (kind) {
			case 'text': {
				bytes = textToBytes(value);
				textResult = { ok: true, value };
				break;
			}
			case 'base64': {
				const decoded = base64ToBytes(value, strict);
				if (!decoded.ok) {
					return {
						text: decoded,
						base64: { ok: true, value },
						base64url: { ok: true, value: base64ToBase64Url(value) },
						hex: decoded
					};
				}
				bytes = decoded.bytes;
				textResult = bytesToText(bytes);
				break;
			}
			case 'base64url': {
				const decoded = base64UrlToBytes(value, strict);
				if (!decoded.ok) {
					return {
						text: decoded,
						base64: { ok: true, value: base64UrlToBase64(value) },
						base64url: { ok: true, value },
						hex: decoded
					};
				}
				bytes = decoded.bytes;
				textResult = bytesToText(bytes);
				break;
			}
			case 'hex': {
				const decoded = hexToBytes(value, strict);
				if (!decoded.ok) {
					return {
						text: decoded,
						base64: decoded,
						base64url: decoded,
						hex: { ok: true, value }
					};
				}
				bytes = decoded.bytes;
				textResult = bytesToText(bytes);
				break;
			}
		}

		// Encode to all formats
		return {
			text: textResult,
			base64: { ok: true, value: bytesToBase64(bytes) },
			base64url: { ok: true, value: bytesToBase64Url(bytes) },
			hex: { ok: true, value: bytesToHex(bytes) }
		};
	}

	function handleClear() {
		input = '';
	}

	function handleSwap() {
		// Swap input with Base64 output by default
		if (results.base64.ok && results.base64.value) {
			input = results.base64.value;
			inputKind = 'base64';
		}
	}

	function handleSwapWith(kind: 'text' | 'base64' | 'base64url' | 'hex') {
		const result = results[kind];
		if (result.ok && result.value) {
			input = result.value;
			inputKind = kind;
		}
	}

	async function copyToClipboard(text: string) {
		if (browser && navigator.clipboard) {
			await navigator.clipboard.writeText(text);
		}
	}

	function loadExample() {
		input = 'Hello, World! 🌍 Привіт!';
		inputKind = 'text';
	}

	const kindOptions = $derived([
		{ value: 'auto' as InputKind, label: tStringReactive('base64.autoDetect', $locale) },
		{ value: 'text' as InputKind, label: tStringReactive('base64.text', $locale) },
		{ value: 'base64' as InputKind, label: tStringReactive('base64.base64', $locale) },
		{ value: 'base64url' as InputKind, label: tStringReactive('base64.base64url', $locale) },
		{ value: 'hex' as InputKind, label: tStringReactive('base64.hex', $locale) }
	]);
</script>

<svelte:head>
	<title>{tStringReactive('base64.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('base64.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('base64.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('base64.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Base64 Converter - Dev Toolbox" />
	<meta
		name="twitter:description"
		content="Encode and decode Base64, Base64URL, and Hex locally. UTF-8 safe. Convert between variants and copy results instantly."
	/>
	<link rel="canonical" href="https://devtools.dataflowkit.dev/base64" />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Base64 Converter",
			"description": "Encode and decode Base64, Base64URL, and Hex locally. UTF-8 safe. Convert between variants and copy results instantly.",
			"url": "https://devtools.dataflowkit.dev/base64",
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
		<h1 class="text-3xl font-bold mb-3">{tStringReactive('base64.heading', $locale)}</h1>
		<p class="text-[var(--color-text-muted)] max-w-2xl">
			{tStringReactive('base64.subtitle', $locale)}
		</p>
	</header>

	<div class="grid lg:grid-cols-2 gap-8">
		<div class="space-y-4">
			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="text-sm font-medium">{tStringReactive('base64.input', $locale)}</span>
					<div class="flex items-center gap-2">
						<button
							onclick={loadExample}
							class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{tStringReactive('request.example', $locale)}
						</button>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-2 mb-3">
					{#each kindOptions as option (option.value)}
						<button
							onclick={() => inputKind = option.value}
							class="px-3 py-1.5 text-xs rounded-md border transition-colors {inputKind === option.value
								? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
								: 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}"
						>
							{option.label}
						</button>
					{/each}
				</div>

				{#if inputKind === 'auto' && processedInput}
					<div class="mb-3 px-2 py-1 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded inline-block">
						{tStringReactive('base64.detectedAs', $locale)} <span class="text-[var(--color-accent)]">{detectedKind}</span>
					</div>
				{/if}

				<textarea
					bind:value={input}
					placeholder={tStringReactive('base64.pasteText', $locale)}
					class="w-full h-48 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]/50"
					spellcheck="false"
				></textarea>

				<div class="flex flex-wrap items-center gap-2 mt-3">
					<button
						onclick={handleSwap}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
					>
						↕ {tStringReactive('base64.swap', $locale)}
					</button>
					<button
						onclick={handleClear}
						class="px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
					>
						{tStringReactive('common.clear', $locale)}
					</button>
				</div>

				<div class="flex flex-wrap items-center gap-4 mt-3 text-xs">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={trimWhitespace}
							class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
						/>
						<span class="text-[var(--color-text-muted)]">{tStringReactive('base64.trimWhitespace', $locale)}</span>
					</label>
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={strictMode}
							class="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
						/>
						<span class="text-[var(--color-text-muted)]">{tStringReactive('base64.strictMode', $locale)}</span>
					</label>
				</div>
			</div>

			{#if strictMode}
				<div class="p-3 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10">
					<p class="text-xs text-[var(--color-warning)]">
						<strong>{tStringReactive('base64.strictMode', $locale)}:</strong> {tStringReactive('base64.strictModeDesc', $locale)}
					</p>
				</div>
			{/if}
		</div>

		<div class="space-y-4">
			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]">
						{tStringReactive('base64.decodedText', $locale)}
					</span>
					{#if results.text.ok && results.text.value}
						<div class="flex gap-2">
							<button
								onclick={() => results.text.ok && copyToClipboard(results.text.value)}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('common.copy', $locale)}
							</button>
							<button
								onclick={() => handleSwapWith('text')}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('base64.useAsInput', $locale)}
							</button>
						</div>
					{/if}
				</div>
				{#if results.text.ok}
					{#if results.text.value}
						<pre class="text-sm font-mono text-[var(--color-text)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{results.text.value}</pre>
					{:else}
						<p class="text-sm text-[var(--color-text-muted)]">{tStringReactive('base64.enterInput', $locale)}</p>
					{/if}
				{:else}
					<p class="text-sm text-[var(--color-error)]">{results.text.error}</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
						BASE64
					</span>
					{#if results.base64.ok && results.base64.value}
						<div class="flex gap-2">
							<button
								onclick={() => results.base64.ok && copyToClipboard(results.base64.value)}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								Copy
							</button>
							<button
								onclick={() => handleSwapWith('base64')}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								Use as input
							</button>
						</div>
					{/if}
				</div>
				{#if results.base64.ok}
					{#if results.base64.value}
						<pre class="text-sm font-mono text-[var(--color-text-muted)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{results.base64.value}</pre>
					{:else}
						<p class="text-sm text-[var(--color-text-muted)]">—</p>
					{/if}
				{:else}
					<p class="text-sm text-[var(--color-error)]">{results.base64.error}</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-warning)]/20 text-[var(--color-warning)]">
						{tStringReactive('base64.base64urlLabel', $locale)}
					</span>
					{#if results.base64url.ok && results.base64url.value}
						<div class="flex gap-2">
							<button
								onclick={() => results.base64url.ok && copyToClipboard(results.base64url.value)}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('common.copy', $locale)}
							</button>
							<button
								onclick={() => handleSwapWith('base64url')}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('base64.useAsInput', $locale)}
							</button>
						</div>
					{/if}
				</div>
				{#if results.base64url.ok}
					{#if results.base64url.value}
						<pre class="text-sm font-mono text-[var(--color-text-muted)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{results.base64url.value}</pre>
					{:else}
						<p class="text-sm text-[var(--color-text-muted)]">—</p>
					{/if}
				{:else}
					<p class="text-sm text-[var(--color-error)]">{results.base64url.error}</p>
				{/if}
			</div>

			<div class="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
				<div class="flex items-center justify-between mb-3">
					<span class="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
						{tStringReactive('base64.hexLabel', $locale)}
					</span>
					{#if results.hex.ok && results.hex.value}
						<div class="flex gap-2">
							<button
								onclick={() => results.hex.ok && copyToClipboard(results.hex.value)}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('common.copy', $locale)}
							</button>
							<button
								onclick={() => handleSwapWith('hex')}
								class="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
							>
								{tStringReactive('base64.useAsInput', $locale)}
							</button>
						</div>
					{/if}
				</div>
				{#if results.hex.ok}
					{#if results.hex.value}
						<pre class="text-sm font-mono text-[var(--color-text-muted)] whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{results.hex.value}</pre>
					{:else}
						<p class="text-sm text-[var(--color-text-muted)]">—</p>
					{/if}
				{:else}
					<p class="text-sm text-[var(--color-error)]">{results.hex.error}</p>
				{/if}
			</div>
		</div>
	</div>

	<section class="mt-16 prose prose-invert max-w-none">
		<h2 class="text-xl font-semibold mb-4">{tStringReactive('base64.about', $locale)}</h2>
		<p class="text-[var(--color-text-muted)] mb-4">
			{tStringReactive('base64.aboutDescription', $locale)}
		</p>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('base64.supportedFormats', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>{tStringReactive('base64.text', $locale)}</strong> — {tStringReactive('base64.formatText', $locale)}</li>
			<li><strong>{tStringReactive('base64.base64', $locale)}</strong> — {tStringReactive('base64.formatBase64', $locale)}</li>
			<li><strong>{tStringReactive('base64.base64url', $locale)}</strong> — {tStringReactive('base64.formatBase64url', $locale)}</li>
			<li><strong>{tStringReactive('base64.hex', $locale)}</strong> — {tStringReactive('base64.formatHex', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('base64.features', $locale)}</h3>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li><strong>{tStringReactive('base64.autoDetect', $locale)}</strong> — {tStringReactive('base64.featureAutoDetect', $locale)}</li>
			<li><strong>UTF-8 Safe</strong> — {tStringReactive('base64.featureUtf8', $locale)}</li>
			<li><strong>{tStringReactive('base64.strictMode', $locale)}</strong> — {tStringReactive('base64.featureStrict', $locale)}</li>
			<li><strong>Instant Conversion</strong> — {tStringReactive('base64.featureInstant', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('base64.base64vsBase64url', $locale)}</h3>
		<p class="text-[var(--color-text-muted)] mb-2">
			{tStringReactive('base64.base64vsDescription', $locale)}
		</p>
		<ul class="text-[var(--color-text-muted)] space-y-2 list-disc list-inside">
			<li>{tStringReactive('base64.base64vs1', $locale)}</li>
			<li>{tStringReactive('base64.base64vs2', $locale)}</li>
			<li>{tStringReactive('base64.base64vs3', $locale)}</li>
		</ul>

		<h3 class="text-lg font-medium mt-6 mb-3">{tStringReactive('base64.privacyNote', $locale)}</h3>
		<p class="text-[var(--color-text-muted)]">
			{tStringReactive('base64.privacyText', $locale)}
		</p>
	</section>
</div>

