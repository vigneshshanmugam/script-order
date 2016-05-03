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
					scriptObj.async.push({name: scripts[i].src, type: 'async', count: order, color: 'green' });
				} else if(scripts[i].defer) {
					scriptObj.defer.push({name: scripts[i].src, type: 'defer', count: order, color: 'lightgreen' });
				} else {
					scriptObj.blocking.push({name: scripts[i].src, type: 'sync', count: order, color: 'red' });
				}
			} else {
				// Todo - Indentify dynamically inserted scripts in better way
				if (scripts[i].innerHTML.indexOf('src') === -1) {
					scriptObj.inline.push({'name': scripts[i].textContent, type: 'inline', count: order, color: 'orange' });
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

    function interleaveAsyncWithOthers(asyncScripts, destination) {
        var i, j, k, tempArr = [];
        var timing = performance.timing;
        var domInteractive = timing.domInteractive - timing.navigationStart;
        for (i = 0; i < asyncScripts.length; i++) {
            for (j = 0; j < destination.length; j++) {
                if (destination[j].type === 'sync' && destination[j].startTime !== 9999
                    && destination[j].startTime < domInteractive) {
                    if ((asyncScripts[i].startTime < destination[j].startTime) && 
                        (asyncScripts[i].duration < destination[j].duration)) {
                        destination.splice(j, 0, asyncScripts[i]);
                        asyncScripts[i].added = true;
                        break;
                    } 
                }
            }
        }
        k = 0;
        while (k < asyncScripts.length) {
            if (!asyncScripts[k].added) {
                tempArr.push(asyncScripts[k]);
            }
            delete asyncScripts[k].added;
            k++;
        }

        return {
            asyncScripts: tempArr,
            interleaved : destination
        };
    }

	function interleaveAsyncWithDefer(asyncScripts, destination, key) {
		var asyncPtr = 0;
		var destPtr = 0;
		while (asyncPtr < asyncScripts.length && destPtr < destination.length) {
			if (asyncScripts[asyncPtr][key] <= destination[destPtr][key]) {
				destination.splice(destPtr, 0, asyncScripts[asyncPtr]);
				asyncPtr++;
			} else {
				destPtr++;
			}
		}

		while (asyncPtr < asyncScripts.length) {
			destination.push(asyncScripts[asyncPtr]);
			asyncPtr++;
		}

		return destination;
	}

	function addTimingInfoToScripts(entries, scripts) {
		for (var i = 0; i < entries.length; i++) {
			for(var j = 0; j < scripts.length; j++) {
				if (entries[i].name === scripts[j].name) {
                    // Duration is specific to startTime
					scripts[j].duration = entries[i].duration + entries[i].startTime; // same as responseEnd
					scripts[j].startTime = entries[i].startTime;
				}
			}
		}

		// Scripts that are blocked, CSP, mixed content - no PerformanceTimingObject
		var j = 0;
		while(j < scripts.length) {
			// Hack - Put them to the end
			if (!scripts[j].duration) {
				scripts[j].duration = 99999;
			}
			if (!scripts[j].startTime) {
				scripts[j].startTime = 99999;
			}
			j++;
		}
		return scripts;
	}

	function getScriptsInOrder() {
		var scripts = groupScripts();

		var inlineScripts = getScriptsByType(scripts, 'inline');
		var blockingScripts = getScriptsByType(scripts, 'blocking');
		var orderedScripts = [];
		// Async Scripts Order - can be easily measured using Resource Timing API
		var asyncScripts = getScriptsByType(scripts, 'async');
		var deferredScripts = getScriptsByType(scripts, 'defer');
		var entries = w.performance.getEntriesByType('resource');
        
        blockingScripts = addTimingInfoToScripts(entries, blockingScripts);
        // Inlinescripts + blockingscripts sorted by order 
        orderedScripts = inlineScripts.concat(blockingScripts).sort(function(a,b){return a.count - b.count});

        asyncScripts = addTimingInfoToScripts(entries, asyncScripts);
		deferredScripts = addTimingInfoToScripts(entries, deferredScripts);

		// Executed as soon as they are available
		asyncScripts.sort(function(a,b){return a.duration - b.duration});

        var temp = interleaveAsyncWithOthers(asyncScripts, orderedScripts);
        orderedScripts = temp.interleaved;
        asyncScripts = temp.asyncScripts;

		// Defer guarentees ordered execution
		deferredScripts.sort(function(a,b){return a.startTime - b.startTime});

        // We need to interleave async scripts between deferred scripts
        var interleavedScripts = interleaveAsyncWithDefer(asyncScripts, deferredScripts, 'duration');
        orderedScripts = orderedScripts.concat(interleavedScripts);

		return orderedScripts;
	}

	function removeDuplicatesAndEmptyScripts(scripts) {
		return scripts.filter(function(ele, index) {
			if (!ele.name) {
				return false;
			}
			if (scripts[index+1] && ele.name === scripts[index+1].name) {
				return false;
			}
			return true;
		});
	}

	function drawUI() {
		var orderedScripts = getScriptsInOrder();
		var scripts = removeDuplicatesAndEmptyScripts(orderedScripts);
		var container = d.createElement('div');
		container.style.cssText = 'background:#fff;border: 2px solid #000;position:absolute;top:0;left:0;right:0;z-index:99999;margin:0px 5px;';
		var ul = d.createElement('ul'), li;
		ul.style.cssText = 'list-style: none;white-space: nowrap;;line-height: 28px;margin: 0;padding: 10px;font-size: 15px;';
		scripts.forEach(function(script, index) {
			li = d.createElement('li');
			li.innerHTML =  (index+1) + '. <span>'+ script.type + '</span> - ' + script.name;
			li.style.cssText = 'overflow: hidden;text-overflow: ellipsis;';
			li.children[0].style.backgroundColor = script.color;
			ul.appendChild(li);
		});
		container.appendChild(ul);
		d.body.appendChild(container);
		console.table(scripts);
	}

    if(w.performance && w.performance.getEntriesByType) {
        drawUI();
    } else {
        console.log('Script Execution Order cannot be calculated - No Resource Timing API Support ')
    }

})(window, window.document);