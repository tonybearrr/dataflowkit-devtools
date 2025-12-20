<script lang="ts">
	import '../app.css';
	import logo from '$lib/assets/logo.png';
	import favicon from '$lib/assets/favicon.ico';
	// import faviconSvg from '$lib/assets/favicon.svg';

	let { children } = $props();
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
				<a href="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-[var(--color-accent)] transition-colors">
					<img src={logo} alt="Dev Toolbox" class="h-8 w-auto" />
					<span>Dev Toolbox</span>
				</a>
				<nav class="flex items-center gap-6">
					<a
						href="/jwt"
						class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						JWT
					</a>
					<a
						href="/cron"
						class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						Cron
					</a>
					<a
						href="/timestamp"
						class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						Timestamp
					</a>
					<a
						href="/request"
						class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						Request
					</a>
				<a
					href="/json"
					class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
				>
					JSON
				</a>
			<a
				href="/base64"
				class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
			>
				Base64
			</a>
			<a
				href="/url"
				class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
			>
				URL
			</a>
			<a
				href="/privacy"
						class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
					>
						Privacy
					</a>
				</nav>
			</div>
			<div class="flex items-center gap-4">
				<a
					href="/about"
					class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
				>
					Made by Anton
				</a>
				<a
					href="https://send.monobank.ua/jar/ABUXaikGMB"
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm px-3 py-1.5 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
				>
					☕ Donate
				</a>
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-6">
		<div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
			<p>Privacy-first. No tracking. Local-only.</p>
			<p>
				Built by{' '}
				<a href="/about" class="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
					Anton Bulavenko
				</a>
			</p>
		</div>
	</footer>
</div>
