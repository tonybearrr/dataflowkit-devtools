<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tReactive, tStringReactive, getPath, type Locale } from '$lib/i18n';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}`);
</script>

<svelte:head>
	<title>Dev Toolbox - Privacy-First Developer Tools</title>
	<meta
		name="description"
		content={tStringReactive('home.description', $locale)}
	/>
	<meta property="og:title" content="Dev Toolbox - Privacy-First Developer Tools" />
	<meta
		property="og:description"
		content={tStringReactive('home.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Dev Toolbox - Privacy-First Developer Tools" />
	<meta
		name="twitter:description"
		content={tStringReactive('home.description', $locale)}
	/>
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			"name": "Dev Toolbox",
			"description": "Fast, privacy-first tools for developers. JWT Inspector and more. Everything runs locally in your browser.",
			"url": "https://devtools.dataflowkit.dev",
			"applicationCategory": "DeveloperApplication",
			"operatingSystem": "Web Browser",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			},
			"creator": {
				"@type": "Person",
				"name": "Anton Bulavenko",
				"url": "https://tonylab.dev"
			},
			"featureList": [
				"JWT Inspector",
				"Cron Explainer",
				"Timestamp Converter",
				"API Request Builder",
				"JSON Formatter",
				"Base64 Converter",
				"URL Inspector"
			]
		}
		</script>
	`}
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8 sm:py-16">
	<div class="text-center mb-8 sm:mb-16">
		<h1 class="text-3xl sm:text-4xl font-bold mb-4">{tStringReactive('home.title', $locale)}</h1>
		<p class="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto px-4">
			{tStringReactive('home.description', $locale)}
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a
			href={getPath('/jwt', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.jwtInspector.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.jwtInspector.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.jwtInspector.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/cron', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">⏰</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.cronExplainer.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.cronExplainer.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.cronExplainer.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/timestamp', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🕐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.timestampConverter.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.timestampConverter.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.timestampConverter.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/request', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🌐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.apiRequestBuilder.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.apiRequestBuilder.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.apiRequestBuilder.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/json', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">📋</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.jsonFormatter.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.jsonFormatter.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.jsonFormatter.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/base64', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔤</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.base64Converter.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.base64Converter.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.base64Converter.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<a
			href={getPath('/url', lang)}
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔗</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				{tStringReactive('home.urlInspector.title', $locale)}
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				{tStringReactive('home.urlInspector.description', $locale)}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each (tReactive('home.urlInspector.tags', $locale) as string[]) as tag}
					<span
						class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
					>
						{tag}
					</span>
				{/each}
			</div>
		</a>

		<div
			class="p-6 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 flex flex-col items-center justify-center text-center"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4"
			>
				<span class="text-2xl opacity-50">🔧</span>
			</div>
			<p class="text-sm text-[var(--color-text-muted)]">{tStringReactive('common.moreToolsComing', $locale)}</p>
		</div>
	</div>
</div>
