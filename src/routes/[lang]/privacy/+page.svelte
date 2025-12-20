<script lang="ts">
	import { page } from '$app/stores';
	import { locale, tStringReactive, type Locale } from '$lib/i18n';

	const lang = $derived(($page.params.lang || 'en') as Locale);
	const baseUrl = 'https://devtools.dataflowkit.dev';
	const currentUrl = $derived(`${baseUrl}/${lang}/privacy`);
</script>

<svelte:head>
	<title>{tStringReactive('privacy.title', $locale)}</title>
	<meta
		name="description"
		content={tStringReactive('privacy.description', $locale)}
	/>
	<meta property="og:title" content={tStringReactive('privacy.title', $locale)} />
	<meta
		property="og:description"
		content={tStringReactive('privacy.description', $locale)}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={tStringReactive('privacy.title', $locale)} />
	<meta
		name="twitter:description"
		content={tStringReactive('privacy.description', $locale)}
	/>
	<link rel="canonical" href={currentUrl} />
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"name": "Privacy - Dev Toolbox",
			"description": "Privacy policy for Dev Toolbox. We don't collect, store, or transmit any data.",
			"url": "https://devtools.dataflowkit.dev/privacy"
		}
		</script>
	`}
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16">
	<h1 class="text-3xl font-bold mb-6">{tStringReactive('privacy.heading', $locale)}</h1>

	<div class="space-y-6 text-[var(--color-text-muted)]">
		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.noDataCollection.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.noDataCollection.text', $locale)}
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.localStorage.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.localStorage.text', $locale)}
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.noAnalytics.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.noAnalytics.text', $locale)}
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.noBackend.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.noBackend.text', $locale)}
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.shareLinks.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.shareLinks.text', $locale)}
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">
				{tStringReactive('privacy.openSource.title', $locale)}
			</h2>
			<p>
				{tStringReactive('privacy.openSource.text', $locale)}
			</p>
		</section>
	</div>

	<div class="mt-12 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<p class="text-sm text-[var(--color-text-muted)]">
			<strong class="text-[var(--color-text)]">TL;DR:</strong> {tStringReactive('privacy.tldr', $locale)}
		</p>
	</div>
</div>

