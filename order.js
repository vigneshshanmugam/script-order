(function(w,d){

	function groupScripts() {
		var scripts = getAllScripts();
		var scriptObj = {};
		scriptObj.async = [];
		scriptObj.defer = [];
		scriptObj.blocking = [];
		scriptObj.inline = [];

		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src) {
				if(scripts[i].async) {
					scriptObj.async.push(scripts[i].src);
				} else if(scripts[i].defer) {
					scriptObj.defer.push(scripts[i].src);
				} else {
					scriptObj.blocking.push(scripts[i].src);
				}
			} else {
				scriptObj.inline.push(scripts[i].innerHTML);
			}
		}
	}

	function getAllScripts() {
		return d.getElementsByTagName('script');
	}

	groupScripts();

})(window, window.document);