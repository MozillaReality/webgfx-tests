/**************************
 * Dusan Bosnjak @pailhead
 **************************/

// add fragment varying if feature enabled

module.exports = [

"#ifdef USE_COLOR",

	"varying vec3 vColor;",

"#endif",

"#if defined( INSTANCE_COLOR )",
		
	"varying vec3 vInstanceColor;",
		
"#endif"

].join("\n")


//////////////////
// WEBPACK FOOTER
// ./~/three-instanced-mesh/monkey-patch/color_pars_fragment.glsl.js
// module id = 391
// module chunks = 0