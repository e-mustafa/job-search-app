import { defineConfig } from 'tsup';

export default defineConfig({
	// Entry point of the application
	entry: ['src/index.ts'],

	// Output format set strictly to ES Module
	format: ['esm'],

	// Enable code splitting and target modern Node.js environments
	splitting: false,
	sourcemap: true,
	clean: true,
	target: 'node18',

	// Bundling options
	bundle: true,
	minify: false, // Set to true if minification is desired in production

	// Exclude native/external dependencies from bundle
	external: ['express', 'mongoose', 'ioredis', 'socket.io', 'dotenv'],
});
