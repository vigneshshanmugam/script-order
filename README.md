# script-order

Report the order in which all script tags were executed on a page.

Just add the bookmarklet below to your bookmarks bar.

```
javascript:(function(d){var el=d.createElement('script');el.type='text/javascript';el.src='//vigneshh.in/script-order/order.js';d.getElementsByTagName('body')[0].appendChild(el);})(window.document);
```

**Delete the cache before executing the bookmarlet**

A UI will be shown on the page like this.

![Script Breakdown]
(https://github.com/vigneshshanmugam/script-order/blob/master/breakdown.png)

 You can also check devtools console tab to see the order. 

### Types

+ Inline
+ External Sync (async=false, defer=false)
+ External Async (has async attribute set)
+ External Defer (has defer attribute set)
+ Dynamic (loaded via JS, can be async/defer)
+ Module (Not covered)

### Behaviour of each script types
* `inline` - Blocking, Ordered
* `External Sync` - Synchronous, Ordered and parser blocking
* `External Async` - Asynchronous, Unordered and non-blocking 
* `External Defer` - Non-blocking, but will be executed before DOMContentLoaded event
* `Dynamic` - Not identified by speculative/lookahead parser.

### Gotchas

- Works only if `Resource Timing API` is available (since we need to interleve async/defer scripts execution with timing information).
- Scripts that are blocked(Ad blockers), CSP and Mixed contents are pushed to the end(because PerformanceTimingEntry Object will be empty for them).
- Not tested Server Push as well.

### Issues

Check [here](https://github.com/vigneshshanmugam/script-order/issues)
