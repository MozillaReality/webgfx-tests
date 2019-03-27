/**************************
 * Dusan Bosnjak @pailhead
 **************************/

module.exports = function ( THREE ){

	if( /InstancedMesh/.test( THREE.REVISION ) ) return THREE;

	require('./monkey-patch/index.js')( THREE );

	THREE.REVISION += "_InstancedMesh";

	return THREE;

}


//////////////////
// WEBPACK FOOTER
// ./~/three-instanced-mesh/monkey-patch.js
// module id = 388
// module chunks = 0