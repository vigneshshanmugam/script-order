# script-order

Report the order in which all the script tags were executed on a page.

Work in progress.

# Types

+ Inline
+ External (async=false, defer=false)
+ External Async (has async attribute set)
+ External Defer (has defer attribute set)
+ Dynamic (loaded via JS, can be async/defer)
+ Module (Not covered)

# Gotchas
- Works only if `Resource Timing API` is available (Since we need to interleve async/defer execution with timings).
- Does not work with third party scripts where `Timing-Allow-Origin Header` is not present.

# Issues

- Have not tested preload behaviour yet
- Speculative/Preload Parser behaviour 
