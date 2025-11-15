import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { config } from 'dotenv';

config();

/** @type {import('@sveltejs/kit').Config} */
const configObj = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		csp: {
			directives: {
				'default-src': ['self'],
				'img-src': ['self', 'data:'],
				'style-src': ['self', 'unsafe-inline'],
				'script-src': ['self'],
				'font-src': ['self', 'data:'],
				'connect-src': ['self']
			}
		}
	}
};

export default configObj;