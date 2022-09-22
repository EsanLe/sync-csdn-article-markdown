const callback = arguments[arguments.length - 1];
(function () {
  setTimeout(() => {
    function removeListenersFromElement(element, listenerType){
      const listeners = getEventListeners(element)[listenerType];
      let l = listeners.length;
      for(let i = l-1; i >=0; i--) {
          removeEventListener(listenerType, listeners[i].listener);
      }
    }
    removeListenersFromElement(window, "beforeunload");
  }, 1000)
})();
