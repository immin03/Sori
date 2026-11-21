// A correct answer may advance once. Manual navigation or leaving the page cancels it.
export function autoNext(env, move, delay = 950) {
  let timer = null;
  function cancel() {
    if (timer !== null) env.clearTimeout(timer);
    timer = null;
  }
  return {
    cancel,
    schedule() {
      cancel();
      timer = env.setTimeout(() => {
        timer = null;
        if (!env.document?.hidden) move();
      }, delay);
    }
  };
}
