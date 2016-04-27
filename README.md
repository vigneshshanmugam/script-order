# script-order

Report the order in which all script tags were executed on a page.

Just add the bookmarklet below to your bookmarks bar.

```
javascript:(function(d){var el=d.createElement('script');el.type='text/javascript';el.src='//vigneshh.in/script-order/order.js';d.getElementsByTagName('body')[0].appendChild(el);})(window.document);
```

Check your devtools console tab to see the order. 

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

- Works only if `Resource Timing API` is available (Since we need to interleve async/defer execution with timings).
- Does not work with third party scripts where `Timing-Allow-Origin Header` is not present.

### Issues

- Have not tested preload behaviour yet
- Speculative/Lookahead Parser behaviour 
