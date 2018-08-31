import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/client/index.js',
  plugins: [
    resolve({customResolveOptions: 'node_modules'}),
    commonjs()
  ],
	// sourceMap: true,
	output: [
		{
			format: 'umd',
			name: 'PERFTESTS',
			file: 'dist/perftests.js',
			indent: '\t'
		},
	]
};