import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/client/index.js',
  plugins: [
    resolve({customResolveOptions: 'node_modules'}),
    commonjs({
			include: 'node_modules/**'
		})
	],
	external: ['crypto'],
	// sourceMap: true,
	output: [
		{
			format: 'umd',
			name: 'WEBGFXTESTS',
			file: 'dist/webgfx-tests.js',
			indent: '\t'
		},
	]
};
