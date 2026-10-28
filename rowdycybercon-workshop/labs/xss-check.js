(function () {
  var f = document.currentScript.dataset.flag, shown = false;
  function win() {
    if (shown) return;
    shown = true;
    var show = function () {
      var d = document.createElement('div');
      d.id = 'xss-win';
      d.textContent = 'XSS achieved! Flag: ' + atob(f);
      document.body.appendChild(d);
    };
    document.body ? show() : document.addEventListener('DOMContentLoaded', show);
  }
  ['alert', 'confirm', 'prompt', 'print'].forEach(function (n) {
    var o = window[n];
    window[n] = function () { win(); return o.apply(window, arguments); };
  });
})();
