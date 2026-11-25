(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
    });
  }

  var toast = document.querySelector('.toast');
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(say.t);
    say.t = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  window.say = say;

  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      var ok = function () { say('No. akaun disalin: ' + v); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(ok, ok); else ok();
    });
  });

  // Penaung interest form
  var form = document.getElementById('minat');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var good = true;
      form.querySelectorAll('[data-req]').forEach(function (f) {
        var input = f.querySelector('input,select');
        var v = input.value.trim();
        var bad = !v || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (input.type === 'tel' && v.replace(/\D/g, '').length < 9);
        f.classList.toggle('invalid', bad);
        if (bad) good = false;
      });
      if (!good) { var first = form.querySelector('.invalid input,.invalid select'); if (first) first.focus(); return; }
      form.style.display = 'none';
      var done = document.getElementById('minat-done');
      done.querySelector('b').textContent = form.nama.value.trim();
      done.classList.add('show');
      done.focus();
    });
  }
})();
