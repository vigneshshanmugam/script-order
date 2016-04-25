(function(w,d){

	function groupScripts() {
		var scripts = getAllScripts();
		var order = 0;
		var scriptObj = {};
		scriptObj.async = [];
		scriptObj.defer = [];
		scriptObj.blocking = [];
		scriptObj.inline = [];

		for (var i = 0; i < scripts.length; i++) {
			order = i + 1;

			// Remove the bookmarklet script
			if(scripts[i].src.indexOf('/order.js') !== -1) {
				continue;
			}

			if (scripts[i].src) {
				// scripts with async & defer set to true is considered to be async
				if(scripts[i].async) {
					scriptObj.async.push({'name': scripts[i].src, count: order });
				} else if(scripts[i].defer) {
					scriptObj.defer.push({'name': scripts[i].src, count: order });
				} else {
					scriptObj.blocking.push({'name': scripts[i].src, count: order });
				}
			} else {
				// Todo - Indentify dynamically inserted scripts in better way
				if (scripts[i].innerHTML.indexOf('src') <= -1) {
					scriptObj.inline.push({'name': 'Inline Script - ' + scripts[i].innerHTML, count: order });
				}
			}
		}
		return scriptObj;
	}

	function getAllScripts() {
		return d.getElementsByTagName('script');
	}

	function getScriptsByType(scripts, type) {
		return scripts[type];
	}

	function interleave(source, destination) {
		var lengthOfArr = source.length + destination.length;
		var srcPtr = 0;
		var destPtr = 0;
		var counter = 0;

		while (counter <= lengthOfArr && destPtr < destination.length) {
			if (source[srcPtr].duration <= destination[destPtr].duration) {
				destination.splice(destPtr, 0, source[srcPtr]);
				srcPtr++;
			} else {
				destPtr++;
			}
			counter++;
		}

		while (srcPtr < source.length) {
			destination.push(source[srcPtr]);
			srcPtr++;
		}

		return destination;
	}

	function addDurationToScripts(entries, scripts) {
		for (var i = 0; i < entries.length; i++) {
			for(var j = 0; j < scripts.length; j++) {
				if (entries[i].name === scripts[j].name) {
					scripts[j].duration = entries[i].duration;
				}
			}
		}
		return scripts;
	}

	function getScriptsInOrder() {
		var scripts = groupScripts();

		var inlineScripts = getScriptsByType(scripts, 'inline');
		var blockingScripts = getScriptsByType(scripts, 'blocking');
		var entries = [];
		var orderedScripts = [];
		// Inlinescripts + blockingscripts sorted by order 
		orderedScripts = inlineScripts.concat(blockingScripts).sort(function(a,b){return a.count - b.count});

		// Async Scripts Order - can be easily measured using Resource Timing API
		var asyncScripts = getScriptsByType(scripts, 'async');

		// Defer Scripts - Ordered execution
		var deferredScripts = getScriptsByType(scripts, 'defer');

		if(w.performance && w.performance.getEntriesByType) {
			entries = w.performance.getEntriesByType('resource');

			asyncScripts = addDurationToScripts(entries, asyncScripts);
			deferredScripts = addDurationToScripts(entries, deferredScripts);

			// We need this for interleaving
			asyncScripts.sort(function(a,b){return a.duration - b.duration});
		} else {
			console.log('Async & Defer Script Execution Order will not be measured - No Resource Timing API Support ')
		}
		
		// // We need to interleave async scripts between deferred scripts
		var interleavedScripts = interleave(asyncScripts, deferredScripts);
		orderedScripts = orderedScripts.concat(interleavedScripts);

		console.table(orderedScripts, 'name');
		return orderedScripts;
	}

	function drawUI() {
		var orderedScripts = getScriptsInOrder();
		var container = d.createElement('div');
		container.style.cssText = 'background:#fff;border: 2px solid #000;position:absolute;top:0;left:0;right:0;z-index:99999;margin:0px 5px;';
		var ul = d.createElement('ul'), li;
		ul.style.cssText = 'list-style: none;white-space: nowrap;;line-height: 28px;margin: 0;padding:10px';
		orderedScripts.forEach(function(script, index) {
			li = d.createElement('li');
			li.innerHTML =  (index+1) + ' - ' + script.name;
			li.style.cssText = 'overflow: hidden;text-overflow: ellipsis;';
			ul.appendChild(li);
		});
		container.appendChild(ul);
		d.body.appendChild(container);
	}

	drawUI();

})(window, window.document);