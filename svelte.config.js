import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: '',
			assets: '',
			relative: false
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			entries: [
				'*',
				'/en',
				'/uk',
				'/ru',
				'/en/privacy',
				'/uk/privacy',
				'/ru/privacy'
			]
		}
	}
};

export default config;
