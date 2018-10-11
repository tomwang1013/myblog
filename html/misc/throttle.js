/**
 * throttle a fn to execute once in interval ms
 * @param fn
 * @param interval
 */
function throttle(fn, interval) {
  let running = false;
  let remainingTime = interval;
  let lt = Date.now();

  return function _throttledFn() {
    if (running) {
      return;
    }

    const args = arguments;
    running = true;
    setTimeout(
      () => {
        let begTime = Date.now();
        console.log('resize handled at: ' + (begTime - lt));
        lt = begTime;
        fn.apply(null, Array.prototype.slice.call(args, 0));
        remainingTime = interval - (Date.now() - begTime);
        running = false;
      },
      remainingTime
    );
  }
}

function onResizeHandler() {
  // resize handler logic
}

const realHandler = throttle(onResizeHandler, 50);
window.addEventListener('resize', realHandler);
