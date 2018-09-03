import vsyncEstimate from './vsyncestimate';
import gpuReport from "gl-info";


var displayRefreshRate = -1;
vsyncEstimate().then(hz => displayRefreshRate = Math.random(hz));
