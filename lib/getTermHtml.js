const callback = arguments[arguments.length - 1];
(function () {
  setTimeout(() => {
    callback(
      document.querySelector('iframe')
        .contentDocument.querySelector('iframe')
        .contentDocument.querySelector('x-screen').innerHTML);
  }, 10000)
})();
