var x = [];

function alloc() {
	for(var i=0, l=1000000; i<l; i++) {
	  x.push({test:'value'});
	}
	console.log(process.memoryUsage().heapUsed);
	setTimeout(alloc, 50);
	
}

alloc()