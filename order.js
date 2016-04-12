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

		var orderedScripts = [];
		// Inlinescripts + blockingscripts sorted by order 
		orderedScripts = inlineScripts.concat(blockingScripts).sort(function(a,b){return a.count > b.count});

		console.table(orderedScripts);
	}

	getScriptOrder();

})(window, window.document);