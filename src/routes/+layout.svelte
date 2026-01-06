<script lang="ts">
	import '../app.css';
	import logo from '$lib/assets/logo.png';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { locale, tStringReactive, getPath, type Locale } from '$lib/i18n';
	import { HeartHandshake } from 'lucide-svelte';
	import { HUB_URL, DEVTOOLS_URL, QATOOLS_URL, FETOOLS_URL } from '$lib/config';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	const currentLang = $derived($locale);
	const currentPath = $derived($page.url.pathname);
	const langFromPath = $derived(($page.params.lang as string | undefined) || currentLang) as Locale;

	function switchLanguage(newLang: Locale) {
		const pathWithoutLang = currentPath.replace(/^\/(en|uk|ru)/, '') || '/';
		goto(`/${newLang}${pathWithoutLang}`);
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-[var(--color-bg)]">
	<header class="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-4">
			<div class="h-14 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<a href={HUB_URL} class="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
						{tStringReactive('common.hub', $locale)}
					</a>
					<span class="text-[var(--color-border)]">/</span>
					<a href={getPath('/', langFromPath)} class="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-accent)] transition-colors">
						<img src={logo} alt={tStringReactive('common.devToolbox', $locale)} class="h-8 w-auto" />
						<span class="sm:inline">{tStringReactive('common.devToolbox', $locale)}</span>
					</a>
				</div>

				<nav class="hidden lg:flex items-center gap-6">
					<a
						href={getPath('/jwt', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/jwt') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.jwt', $locale)}
					</a>
					<a
						href={getPath('/cron', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/cron') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.cron', $locale)}
					</a>
					<a
						href={getPath('/timestamp', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/timestamp') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.timestamp', $locale)}
					</a>
					<a
						href={getPath('/request', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/request') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.request', $locale)}
					</a>
					<a
						href={getPath('/json', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/json') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.json', $locale)}
					</a>
					<a
						href={getPath('/base64', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/base64') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.base64', $locale)}
					</a>
					<a
						href={getPath('/url', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/url') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('nav.url', $locale)}
					</a>
				</nav>

				<div class="flex items-center gap-2 sm:gap-4">
					<a
						href="https://send.monobank.ua/jar/ABUXaikGMB"
						target="_blank"
						rel="noopener noreferrer"
						aria-label={tStringReactive('common.donate', $locale)}
						class="px-2 py-1 text-sm font-[100] flex items-center rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
					>
						<HeartHandshake class="w-4 h-4 sm:w-4 sm:h-4 sm:mr-2" />
						<span class="hidden sm:inline">
							{tStringReactive('common.donate', $locale)}
						</span>
					</a>
					<select
						value={langFromPath}
						onchange={(e) => switchLanguage(e.currentTarget.value as Locale)}
						class="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
					>
						<option value="en">EN</option>
						<option value="uk">UK</option>
						<option value="ru">RU</option>
					</select>
					
					<button
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="lg:hidden p-2 hover:bg-[var(--color-bg-tertiary)] rounded transition-colors"
						aria-label="Toggle menu"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if mobileMenuOpen}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							{/if}
						</svg>
					</button>
				</div>
			</div>

			{#if mobileMenuOpen}
				<nav class="lg:hidden py-4 border-t border-[var(--color-border)]">
					<div class="flex flex-col space-y-3">
						<a
							href={getPath('/jwt', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/jwt') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.jwt', $locale)}
						</a>
						<a
							href={getPath('/cron', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/cron') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.cron', $locale)}
						</a>
						<a
							href={getPath('/timestamp', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/timestamp') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.timestamp', $locale)}
						</a>
						<a
							href={getPath('/request', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/request') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.request', $locale)}
						</a>
						<a
							href={getPath('/json', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/json') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.json', $locale)}
						</a>
						<a
							href={getPath('/base64', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/base64') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.base64', $locale)}
						</a>
						<a
							href={getPath('/url', langFromPath)}
							onclick={closeMobileMenu}
							class="px-4 py-2 text-sm transition-colors rounded hover:bg-[var(--color-bg-tertiary)] {$page.url.pathname.includes('/url') ? 'text-[var(--color-text)] bg-[var(--color-bg-tertiary)]' : 'text-[var(--color-text-muted)]'}"
						>
							{tStringReactive('nav.url', $locale)}
						</a>
					</div>
				</nav>
			{/if}
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-6">
		<div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 text-sm text-[var(--color-text-muted)]">
			<div class="flex items-center justify-center">
				<p class="max-sm:text-center">{tStringReactive('common.privacyFirst', $locale)}</p>
				
			</div>
			<p class="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
				<a href={DEVTOOLS_URL} class="hover:text-[var(--color-accent)] transition-colors">
					{tStringReactive('common.devtools', $locale)}
				</a>
				<span class="opacity-50">•</span>
				<a href={QATOOLS_URL} class="hover:text-[var(--color-accent)] transition-colors">
					{tStringReactive('common.qatools', $locale)}
				</a>
				<span class="opacity-50">•</span>
				<a href={FETOOLS_URL} class="hover:text-[var(--color-accent)] transition-colors">
					{tStringReactive('common.fetools', $locale)}
				</a>
				<span class="text-[var(--color-text-muted)] ml-1">|</span>

                <a href={'https://dataflowkit.dev'} class="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
                    DataflowKit
				</a>
				<span class="text-[var(--color-text-muted)] ml-1">|</span>

				<a
					href={getPath('/privacy', langFromPath)}
					class="px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent)] text-[var(--color-text)] transition-colors {$page.url.pathname.includes('/privacy') ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-accent)]' : ''}"
				>
					{tStringReactive('common.privacy', $locale)}
				</a>
			</p>
		</div>
	</footer>
</div>
