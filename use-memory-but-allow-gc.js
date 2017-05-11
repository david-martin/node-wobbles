var v8 = require('v8');
var keepAllocating = true;
var x;
var timeout = 500;
var gc = (require('gc-stats'))();
var fhComponentMetrics = require('fh-component-metrics');
var metricsConf = {enabled: true, host: process.env.INFLUXDB_HOST, port: process.env.INFLUXDB_PORT};
var metrics = fhComponentMetrics(metricsConf);


/*
{
    pause: 433034,
    pauseMS: 0,
    gctype: 1,
    before: {
        totalHeapSize: 18635008,
        totalHeapExecutableSize: 4194304,
        usedHeapSize: 12222496,
        heapSizeLimit: 1535115264
    }, after: {
        totalHeapSize: 18635008,
        totalHeapExecutableSize: 4194304,
        usedHeapSize: 8116600,
        heapSizeLimit: 1535115264
    }, diff: {
        totalHeapSize: 0,
        totalHeapExecutableSize: 0,
         usedHeapSize: -4105896,
        heapSizeLimit: 0
    }
}
*/
var gcs = [0, 0, 0];
gc.on('stats', function (stats) {
  gcs[stats.gctype + 1] ++;
  console.log(new Date().toString(), 'GC happened TYPE', stats.gctype, 'COUNT', gcs[stats.gctype + 1], 'BEFORE', stats.before.usedHeapSize, 'AFTER', stats.after.usedHeapSize);
	metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'gctype'}, stats.gctype);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'before.totalHeapSize'}, stats.before.totalHeapSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'before.totalHeapExecutableSize'}, stats.before.totalHeapExecutableSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'before.usedHeapSize'}, stats.before.usedHeapSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'before.heapSizeLimit'}, stats.before.heapSizeLimit);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'after.totalHeapSize'}, stats.after.totalHeapSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'after.totalHeapExecutableSize'}, stats.after.totalHeapExecutableSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'after.usedHeapSize'}, stats.after.usedHeapSize);
	// metrics.gauge('NODEJS_MEMORY_TEST_gc', {'type': 'after.heapSizeLimit'}, stats.after.heapSizeLimit);
});

function alloc() {
	x = [];
	if (keepAllocating) {
		for(var i=0, l=1000000; i<l; i++) {
			x.push({test:'value'});
		}
	}

	/*{ total_heap_size: 10504544,
  total_heap_size_executable: 5242880,
  total_physical_size: 7011248,
  total_available_size: 1490995272,
  used_heap_size: 5763808,
  heap_size_limit: 1535115264 }*/
	const stats = v8.getHeapStatistics();
	const percentUsed = stats.total_heap_size / stats.heap_size_limit;
	console.log(new Date().toString(), (percentUsed * 100).toPrecision(2) + '%', stats.total_heap_size, '/', stats.heap_size_limit);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'percentUsed'}, percentUsed);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'total_heap_size'}, stats.total_heap_size);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'total_heap_size_executable'}, stats.total_heap_size_executable);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'total_physical_size'}, stats.total_physical_size);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'total_available_size'}, stats.total_available_size);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'used_heap_size'}, stats.used_heap_size);
	metrics.gauge('NODEJS_MEMORY_TEST_getHeapStatistics', {'type': 'heap_size_limit'}, stats.heap_size_limit);

/*
> require('v8').getHeapSpaceStatistics()
[ { space_name: 'new_space',
    space_size: 4127744,
    space_used_size: 1037472,
    space_available_size: 1026400,
    physical_space_size: 2134792 },
  { space_name: 'old_space',
    space_size: 2948480,
    space_used_size: 2880808,
    space_available_size: 0,
    physical_space_size: 2930728 },
  { space_name: 'code_space',
    space_size: 1300640,
    space_used_size: 1033344,
    space_available_size: 0,
    physical_space_size: 1082496 },
  { space_name: 'map_space',
    space_size: 1095744,
    space_used_size: 232320,
    space_available_size: 0,
    physical_space_size: 265600 },
  { space_name: 'large_object_space',
    space_size: 0,
    space_used_size: 0,
    space_available_size: 1491119872,
    physical_space_size: 0 } ]
*/

  const heapSpaceStatistics = v8.getHeapSpaceStatistics();
	for (var i = 0, l = heapSpaceStatistics.length; i < l; i++) {
		var heapSpace = heapSpaceStatistics[i];
		metrics.gauge('NODEJS_MEMORY_TEST_getHeapSpaceStatistics_' + heapSpace.space_name, {type: 'space_size'}, heapSpace.space_size);
		metrics.gauge('NODEJS_MEMORY_TEST_getHeapSpaceStatistics_' + heapSpace.space_name, {type: 'space_used_size'}, heapSpace.space_used_size);
		metrics.gauge('NODEJS_MEMORY_TEST_getHeapSpaceStatistics_' + heapSpace.space_name, {type: 'space_available_size'}, heapSpace.space_available_size);
		metrics.gauge('NODEJS_MEMORY_TEST_getHeapSpaceStatistics_' + heapSpace.space_name, {type: 'physical_space_size'}, heapSpace.physical_space_size);
	}
	
	// if more than 20% is used, stop allocating
	// if (percentUsed > 0.2) {
	// 	keepAllocating = false;
	// 	timeout = 1000;
	// }
  setTimeout(alloc, timeout);
}

alloc()
