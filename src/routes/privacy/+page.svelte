<svelte:head>
	<title>Privacy - Dev Toolbox</title>
	<meta
		name="description"
		content="Privacy policy for Dev Toolbox. We don't collect, store, or transmit any data."
	/>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16">
	<h1 class="text-3xl font-bold mb-6">Privacy</h1>

	<div class="space-y-6 text-[var(--color-text-muted)]">
		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">No Data Collection</h2>
			<p>
				Dev Toolbox does not collect, store, or transmit any data to external servers. All
				processing happens locally in your browser.
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">Local Storage</h2>
			<p>
				The JWT Inspector uses your browser's localStorage to save your preferences and history.
				This data never leaves your device. You can clear it at any time from the tool interface or
				by clearing your browser data.
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">No Analytics</h2>
			<p>
				We don't use any analytics, tracking pixels, or third-party scripts. No cookies are set
				except for essential functionality.
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">No Backend</h2>
			<p>
				This is a static website. There is no server processing your requests. All tool logic runs
				entirely in JavaScript within your browser.
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">Share Links</h2>
			<p>
				When you enable "Share Link" for the JWT Inspector, the token is added to the URL. Be aware
				that shared URLs may be logged in browser history, server logs, and analytics tools of
				whoever receives the link.
			</p>
		</section>

		<section>
			<h2 class="text-xl font-semibold text-[var(--color-text)] mb-3">Open Source</h2>
			<p>
				The source code is available for review. You can verify these privacy claims by inspecting
				the code yourself.
			</p>
		</section>
	</div>

	<div class="mt-12 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
		<p class="text-sm text-[var(--color-text-muted)]">
			<strong class="text-[var(--color-text)]">TL;DR:</strong> Your data stays on your device. We don't
			see it, store it, or sell it.
		</p>
	</div>
</div>

