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
				'/ru/privacy',
				'/en/jwt',
				'/uk/jwt',
				'/ru/jwt',
				'/en/cron',
				'/uk/cron',
				'/ru/cron',
				'/en/timestamp',
				'/uk/timestamp',
				'/ru/timestamp',
				'/en/request',
				'/uk/request',
				'/ru/request',
				'/en/json',
				'/uk/json',
				'/ru/json',
				'/en/base64',
				'/uk/base64',
				'/ru/base64',
				'/en/url',
				'/uk/url',
				'/ru/url',
			]
		}
	}
};

export default config;
