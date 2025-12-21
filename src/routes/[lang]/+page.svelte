<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tReactive, tStringReactive, getPath, type Locale } from '$lib/i18n';
	import { Lock, Asterisk, Clock, Globe, ClipboardList, Hash, Link, Wrench } from 'lucide-svelte';

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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors"
		>
			<Lock class="w-6 h-6 text-blue-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-purple-400 transition-all hover:shadow-lg hover:shadow-purple-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/15 transition-colors"
		>
			<Asterisk class="w-6 h-6 text-purple-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-amber-400 transition-all hover:shadow-lg hover:shadow-amber-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors"
		>
			<Clock class="w-6 h-6 text-amber-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-amber-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors"
		>
			<Globe class="w-6 h-6 text-emerald-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/15 transition-colors"
		>
			<ClipboardList class="w-6 h-6 text-cyan-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-rose-400 transition-all hover:shadow-lg hover:shadow-rose-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center mb-4 group-hover:bg-rose-500/15 transition-colors"
		>
			<Hash class="w-6 h-6 text-rose-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors">
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
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-indigo-400 transition-all hover:shadow-lg hover:shadow-indigo-400/10"
		>
		<div
			class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors"
		>
			<Link class="w-6 h-6 text-indigo-400" />
		</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
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
				<Wrench class="w-6 h-6 text-[var(--color-text-muted)] opacity-50" />
			</div>
			<p class="text-sm text-[var(--color-text-muted)]">{tStringReactive('common.moreToolsComing', $locale)}</p>
		</div>
	</div>
</div>
