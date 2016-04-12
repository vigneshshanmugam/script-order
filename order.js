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
					scriptObj.inline.push({'name': scripts[i].innerHTML, count: order });
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

	function getScriptOrder() {
		var scripts = groupScripts();
		var inlineScripts = getScriptsByType(scripts, 'inline');
		var blockingScripts = getScriptsByType(scripts, 'blocking');
		var entries = [];
		var orderedScripts = [];
		// Inlinescripts + blockingscripts sorted by order 
		orderedScripts = inlineScripts.concat(blockingScripts).sort(function(a,b){return a.count - b.count});

		// Async Scripts Order - can be easily measured using Resource Timing API
		var tempAsyncArr = [];
		var asyncScripts = getScriptsByType(scripts, 'async');
		if(w.performance && w.performance.getEntriesByType) {
			entries = w.performance.getEntriesByType('resource');

			for (var i = 0; i < entries.length; i++) {
				for(var j = 0; j < asyncScripts.length; j++) {
					if (entries[i].name === asyncScripts[j].name) {
						asyncScripts[j].duration = entries[i].duration;
						tempAsyncArr.push(asyncScripts[j])
					}	
				}
			}
			tempAsyncArr.sort(function(a,b){return a.duration - b.duration});
		} else {
			console.log('Async Script Execution Order will not be measured - No Resource Timing API Support ')
		}
		orderedScripts = orderedScripts.concat(tempAsyncArr);
		tempAsyncArr = null;

		// Defer Scripts

		console.table(orderedScripts);
	}

	getScriptOrder();

})(window, window.document);