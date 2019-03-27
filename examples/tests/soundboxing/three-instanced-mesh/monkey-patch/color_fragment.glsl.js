/**************************
 * Dusan Bosnjak @pailhead
 **************************/

// multiply the color with per instance color if enabled

module.exports = [

'#ifdef USE_COLOR',

	'diffuseColor.rgb *= vColor;',

'#endif',

'#if defined(INSTANCE_COLOR)',
		
	'diffuseColor.rgb *= vInstanceColor;',
		
'#endif'

].join("\n")


//////////////////
// WEBPACK FOOTER
// ./~/three-instanced-mesh/monkey-patch/color_fragment.glsl.js
// module id = 390
// module chunks = 0