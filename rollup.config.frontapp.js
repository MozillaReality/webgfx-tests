import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/frontapp/index.js',
  plugins: [
    resolve({customResolveOptions: 'node_modules'}),
    commonjs()
	],
	output: [
		{
			format: 'umd',
			name: 'APP',
			file: 'src/frontapp/app.bundle.js',
			indent: '\t'
		},
	]
};
