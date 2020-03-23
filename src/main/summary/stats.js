'use strict'

function PerfStats() {
  this.n = 0;
  this.min = Number.MAX_VALUE;
  this.max = -Number.MAX_VALUE;
  this.sum = 0;
  this.mean = 0;
  this.q = 0;
}

PerfStats.prototype = {
  variance: function() {
    return this.q / this.n;
  },
  standard_deviation: function() {
    return Math.sqrt(this.q / this.n);
  },
  update: function(value) {
    var num = parseFloat(value);
    if (isNaN(num)) {
      // Sorry, no NaNs
      return;
    }
    this.n++;
    this.min = Math.min(this.min, num);
    this.max = Math.max(this.max, num);
    this.sum += num;
    const prevMean = this.mean;
    this.mean = this.mean + (num - this.mean) / this.n;
    this.q = this.q + (num - prevMean) * (num - this.mean);
  },
  getAll: function() {
    return {
      //n: this.n,
      min: this.min,
      max: this.max,
      // sum: this.sum,
      mean: this.mean,
      variance: this.variance,
      standard_deviation: this.standard_deviation
    };
  }  
}

module.exports = PerfStats;