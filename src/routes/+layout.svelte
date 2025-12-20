<script lang="ts">
	import '../app.css';
	import logo from '$lib/assets/logo.png';
	import favicon from '$lib/assets/favicon.ico';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { locale, tStringReactive, getPath, type Locale } from '$lib/i18n';
	// import faviconSvg from '$lib/assets/favicon.svg';

	let { children } = $props();

	const currentLang = $derived($locale);
	const currentPath = $derived($page.url.pathname);
	const langFromPath = $derived(($page.params.lang as string | undefined) || currentLang) as Locale;

	function switchLanguage(newLang: Locale) {
		const pathWithoutLang = currentPath.replace(/^\/(en|uk|ru)/, '') || '/';
		goto(`/${newLang}${pathWithoutLang}`);
	}
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon} />
	<!-- <link rel="icon" type="image/svg+xml" href={faviconSvg} /> -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col bg-[var(--color-bg)]">
	<header class="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
			<div class="flex items-center gap-8">
				<a href={getPath('/', langFromPath)} class="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-accent)] transition-colors">
					<img src={logo} alt={tStringReactive('common.devToolbox', $locale)} class="h-8 w-auto" />
					<span>{tStringReactive('common.devToolbox', $locale)}</span>
				</a>
				<nav class="flex items-center gap-6">
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
					<a
						href={getPath('/privacy', langFromPath)}
						class="text-sm transition-colors {$page.url.pathname.includes('/privacy') ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}"
					>
						{tStringReactive('common.privacy', $locale)}
					</a>
				</nav>
			</div>
			<div class="flex items-center gap-4">
				<a
					href={getPath('/about', langFromPath)}
					class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
				>
					{tStringReactive('common.madeBy', $locale)}
				</a>
				<a
					href="https://send.monobank.ua/jar/ABUXaikGMB"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm px-3 py-1.5 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
				>
					{tStringReactive('common.donate', $locale)}
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
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-6">
		<div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
			<p>{tStringReactive('common.privacyFirst', $locale)}</p>
			<p>
				{tStringReactive('common.builtBy', $locale)}{' '}
				<a href={getPath('/about', langFromPath)} class="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
					Anton Bulavenko
				</a>
			</p>
		</div>
	</footer>
</div>
