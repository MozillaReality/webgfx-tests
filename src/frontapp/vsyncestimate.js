export default function estimateVSyncRate() {
  return new Promise (resolve => {
    var numFramesToRun = 60;
    var t0 = performance.now();
    var deltas = [];
    function tick() {
      var t1 = performance.now();
      deltas.push(t1-t0);
      t0 = t1;
      if (--numFramesToRun > 0) {
        requestAnimationFrame(tick);
      } else {
        deltas.sort();
        deltas = deltas.slice((deltas.length/3)|0, ((2*deltas.length+2)/3)|0);
        var sum = 0;
        for(var i in deltas) sum += deltas[i];
        resolve(1000.0 / (sum/deltas.length));
      }
    }
    requestAnimationFrame(tick);
  });
}