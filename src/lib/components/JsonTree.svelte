<script lang="ts">
	import { browser } from '$app/environment';
	import type { JsonValue, JsonObject } from '$lib/tools/json/types';
	import { getValueType } from '$lib/tools/json/parse';
	import { countChildren, formatPrimitive, truncateString } from '$lib/tools/json/format';
	import { matchesSearch, hasMatchingDescendant, highlightMatch, buildPath } from '$lib/tools/json/search';
	import JsonTree from './JsonTree.svelte';

	interface Props {
		value: JsonValue;
		search?: string;
		rootKey?: string;
		path?: string;
		depth?: number;
		defaultExpanded?: boolean;
	}

	let {
		value,
		search = '',
		rootKey = '',
		path = '$',
		depth = 0,
		defaultExpanded = true
	}: Props = $props();

	const initialExpanded = $derived(depth < 2 ? defaultExpanded : false);
	let expanded = $state<boolean | null>(null);
	
	$effect(() => {
		if (expanded === null) {
			expanded = initialExpanded;
		}
	});

	const type = $derived(getValueType(value));
	const isExpandable = $derived(type === 'object' || type === 'array');
	const childCount = $derived(countChildren(value));
	const isMatch = $derived(matchesSearch(rootKey, value, search));
	const hasDescendantMatch = $derived(hasMatchingDescendant(value, search));
	const shouldShow = $derived(!search || isMatch || hasDescendantMatch);

	// Auto-expand when searching
	$effect(() => {
		if (search && hasDescendantMatch && !expanded) {
			expanded = true;
		}
	});

	function toggle() {
		expanded = !expanded;
	}

	async function copyPath() {
		if (browser && navigator.clipboard) {
			await navigator.clipboard.writeText(path);
		}
	}

	function getChildPath(key: string | number): string {
		return buildPath(path, key);
	}

	function renderHighlightedText(text: string): { type: 'plain' | 'highlight'; text: string }[] {
		if (!search) return [{ type: 'plain', text }];

		const highlight = highlightMatch(text, search);
		if (!highlight) return [{ type: 'plain', text }];

		return [
			{ type: 'plain', text: highlight.before },
			{ type: 'highlight', text: highlight.match },
			{ type: 'plain', text: highlight.after }
		];
	}
</script>

{#if shouldShow}
	<div
		class="json-node"
		class:json-node--match={isMatch && search}
		style="--depth: {depth}"
	>
		<div class="json-node__row">
			{#if isExpandable}
				<button
					class="json-node__toggle"
					onclick={toggle}
					aria-expanded={expanded}
				>
					{expanded ? '▼' : '▶'}
				</button>
			{:else}
				<span class="json-node__spacer"></span>
			{/if}

			{#if rootKey}
				<button
					type="button"
					class="json-node__key"
					onclick={copyPath}
					title="Click to copy path: {path}"
				>
					{#each renderHighlightedText(rootKey) as part, i (i)}
						{#if part.type === 'highlight'}
							<mark class="json-node__highlight">{part.text}</mark>
						{:else}
							{part.text}
						{/if}
					{/each}
				</button>
				<span class="json-node__colon">:</span>
			{/if}

			{#if type === 'object'}
				<span class="json-node__bracket">&#123;</span>
				{#if !expanded}
					<span class="json-node__count">{childCount} keys</span>
					<span class="json-node__bracket">&#125;</span>
				{/if}
			{:else if type === 'array'}
				<span class="json-node__bracket">[</span>
				{#if !expanded}
					<span class="json-node__count">{childCount} items</span>
					<span class="json-node__bracket">]</span>
				{/if}
			{:else if type === 'string'}
				<span class="json-node__value json-node__value--string">
					{#each renderHighlightedText(formatPrimitive(value)) as part, i (i)}
						{#if part.type === 'highlight'}
							<mark class="json-node__highlight">{part.text}</mark>
						{:else}
							{truncateString(part.text, 100)}
						{/if}
					{/each}
				</span>
			{:else if type === 'number'}
				<span class="json-node__value json-node__value--number">
					{#each renderHighlightedText(String(value)) as part, i (i)}
						{#if part.type === 'highlight'}
							<mark class="json-node__highlight">{part.text}</mark>
						{:else}
							{part.text}
						{/if}
					{/each}
				</span>
			{:else if type === 'boolean'}
				<span class="json-node__value json-node__value--boolean">{String(value)}</span>
			{:else if type === 'null'}
				<span class="json-node__value json-node__value--null">null</span>
			{/if}

			<span class="json-node__type">{type}</span>
		</div>

		{#if isExpandable && expanded}
			<div class="json-node__children">
				{#if type === 'object'}
					{#each Object.entries(value as JsonObject) as [key, childValue] (key)}
						<JsonTree
							value={childValue}
							{search}
							rootKey={key}
							path={getChildPath(key)}
							depth={depth + 1}
						/>
					{/each}
				{:else if type === 'array'}
					{#each value as childValue, index (index)}
						<JsonTree
							value={childValue}
							{search}
							rootKey={String(index)}
							path={getChildPath(index)}
							depth={depth + 1}
						/>
					{/each}
				{/if}
			</div>

			<div class="json-node__row">
				<span class="json-node__spacer"></span>
				<span class="json-node__bracket">{type === 'object' ? '}' : ']'}</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.json-node {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.json-node--match {
		background-color: var(--color-warning, #f59e0b);
		background-opacity: 0.1;
		border-radius: 2px;
	}

	.json-node__row {
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 0.125rem 0;
		padding-left: calc(var(--depth) * 1rem);
	}

	.json-node__toggle {
		width: 1rem;
		height: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--color-text-muted, #71717a);
		cursor: pointer;
		font-size: 0.625rem;
		flex-shrink: 0;
	}

	.json-node__toggle:hover {
		color: var(--color-accent, #3b82f6);
	}

	.json-node__spacer {
		width: 1rem;
		flex-shrink: 0;
	}

	.json-node__key {
		color: var(--color-accent, #3b82f6);
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
		font-size: inherit;
	}

	.json-node__key:hover {
		text-decoration: underline;
	}

	.json-node__colon {
		color: var(--color-text-muted, #71717a);
	}

	.json-node__bracket {
		color: var(--color-text-muted, #71717a);
	}

	.json-node__count {
		color: var(--color-text-muted, #71717a);
		font-style: italic;
		font-size: 0.75rem;
		margin: 0 0.25rem;
	}

	.json-node__value {
		word-break: break-all;
	}

	.json-node__value--string {
		color: var(--color-success, #22c55e);
	}

	.json-node__value--number {
		color: var(--color-warning, #f59e0b);
	}

	.json-node__value--boolean {
		color: var(--color-error, #ef4444);
	}

	.json-node__value--null {
		color: var(--color-text-muted, #71717a);
		font-style: italic;
	}

	.json-node__type {
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		background: var(--color-bg-tertiary, #1c1c1f);
		color: var(--color-text-muted, #71717a);
		border-radius: 0.25rem;
		margin-left: 0.5rem;
	}

	.json-node__highlight {
		background-color: var(--color-warning, #f59e0b);
		color: var(--color-bg, #0a0a0b);
		padding: 0 0.125rem;
		border-radius: 2px;
	}

	.json-node__children {
		border-left: 1px dashed var(--color-border, #2a2a2e);
		margin-left: calc(var(--depth) * 1rem + 0.5rem);
	}
</style>

