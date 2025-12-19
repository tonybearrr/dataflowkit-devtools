<svelte:head>
	<title>Dev Toolbox - Privacy-First Developer Tools</title>
	<meta
		name="description"
		content="Fast, privacy-first tools for developers. JWT Inspector and more. Everything runs locally in your browser."
	/>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16">
	<div class="text-center mb-16">
		<h1 class="text-4xl font-bold mb-4">Dev Toolbox</h1>
		<p class="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
			Fast, privacy-first tools for developers. No backend. No tracking. Everything runs locally in
			your browser.
		</p>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a
			href="/jwt"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				JWT Inspector
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Decode and inspect JSON Web Tokens. View header, payload, and check expiration status.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Base64URL
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Claims
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Expiration
				</span>
			</div>
		</a>

		<a
			href="/cron"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">⏰</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				Cron Explainer
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Explain cron expressions in plain English and preview upcoming execution times.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Scheduler
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Simulator
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					5-field
				</span>
			</div>
		</a>

		<a
			href="/timestamp"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🕐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				Timestamp Converter
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Convert Unix timestamps, ISO dates, and milliseconds. Local time or UTC.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Unix
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					ISO 8601
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Timezone
				</span>
			</div>
		</a>

		<a
			href="/request"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🌐</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				API Request Builder
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Build HTTP requests and generate curl, fetch, axios code snippets.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					curl
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					fetch
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					axios
				</span>
			</div>
		</a>

		<a
			href="/json"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">📋</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				JSON Formatter
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Prettify, minify, validate, and inspect JSON with tree view.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Prettify
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Tree View
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Search
				</span>
			</div>
		</a>

		<a
			href="/base64"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔤</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				Base64 Converter
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Encode and decode Base64, Base64URL, and Hex. UTF-8 safe.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Base64
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Base64URL
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Hex
				</span>
			</div>
		</a>

		<a
			href="/url"
			class="group p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent)] transition-all hover:shadow-lg hover:shadow-[var(--color-accent)]/5"
		>
			<div
				class="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/10 transition-colors"
			>
				<span class="text-2xl">🔗</span>
			</div>
			<h2 class="text-lg font-semibold mb-2 group-hover:text-[var(--color-accent)] transition-colors">
				URL Inspector
			</h2>
			<p class="text-sm text-[var(--color-text-muted)]">
				Parse, inspect, and build URLs. Edit query parameters and copy clean URLs.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Query Params
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Encoding
				</span>
				<span
					class="text-xs px-2 py-1 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
				>
					Builder
				</span>
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
			<p class="text-sm text-[var(--color-text-muted)]">More tools coming soon...</p>
		</div>
	</div>
</div>
