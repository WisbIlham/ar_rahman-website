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
    say.t = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }
  window.say = say;

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var v = b.getAttribute('data-copy');
    var ok = function () { say('No. akaun disalin: ' + v); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(ok, ok); else ok();
  });

  /* ---------- render public pages from CMS content ---------- */
  if (!window.CMS || document.body.hasAttribute('data-admin')) return;
  var C = window.CMS, d = C.load(), s = d.site, esc = C.esc;
  function $(id) { return document.getElementById(id); }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, d); }

  document.querySelectorAll('[data-t]').forEach(function (el) { var v = get(el.dataset.t); if (v != null) el.textContent = v; });
  document.querySelectorAll('[data-src]').forEach(function (el) { var v = get(el.dataset.src); if (v) el.src = v; });
  document.querySelectorAll('[data-bg]').forEach(function (el) { var v = get(el.dataset.bg); if (v) el.style.backgroundImage = 'url("' + v + '")'; });
  document.querySelectorAll('[data-tel]').forEach(function (el) { var v = get(el.dataset.tel); el.textContent = v; el.href = C.tel(v); });
  document.querySelectorAll('[data-mail]').forEach(function (el) { el.textContent = s.email; el.href = 'mailto:' + s.email; });
  document.querySelectorAll('[data-acc]').forEach(function (el) { el.setAttribute('data-copy', s.bank_acc.replace(/\s/g, '')); });
  document.querySelectorAll('[data-fb]').forEach(function (el) { el.href = s.facebook; });
  document.querySelectorAll('[data-tt]').forEach(function (el) { el.href = s.tiktok; });
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.href = 'https://wa.me/' + s.phone1.replace(/\D/g, '') + '?text=' + encodeURIComponent('Assalamualaikum, saya telah menyumbang kepada Ar Rahmah Malaysia.');
  });

  if ($('centres-body')) {
    $('centres-body').innerHTML = d.centres.map(function (c) {
      return '<tr><td><b>' + esc(c.name) + '</b>' + (c.note ? '<br><span class="fine">' + esc(c.note) + '</span>' : '') +
        '</td><td class="hide-sm">' + esc(c.region) + '</td><td class="n">' + esc(c.students) + '</td></tr>';
    }).join('');
  }

  if ($('chart')) {
    var sp = d.spending.slice().sort(function (a, b) { return a.year - b.year; });
    var max = Math.max.apply(null, sp.map(function (x) { return +x.amount; }).concat([1]));
    var cols = 'repeat(' + sp.length + ',1fr)';
    $('chart').style.gridTemplateColumns = cols; $('years').style.gridTemplateColumns = cols;
    $('chart').innerHTML = sp.map(function (x) {
      return '<div class="bar' + (x.type === 'projection' ? ' proj' : '') + '" style="height:' + (x.amount / max * 100).toFixed(1) + '%" title="' + x.year + ': RM' + C.money(x.amount) + '"><span>' + C.short(x.amount) + '</span></div>';
    }).join('');
    $('years').innerHTML = sp.map(function (x) { return '<span>' + esc(x.year) + '</span>'; }).join('');
  }

  if ($('reports')) {
    var reps = d.reports.filter(function (r) { return r.public; });
    $('reports').innerHTML = reps.map(function (r) {
      return '<li><span>' + esc(r.title) + '</span><span><a href="' + esc(r.url || '#') + '"' + (r.url && r.url !== '#' ? ' download="' + esc(r.file) + '"' : '') + '>PDF</a></span></li>';
    }).join('') || '<li><span>Tiada laporan lagi.</span><span></span></li>';
  }

  function card(n) {
    return '<article><a href="berita.html?id=' + encodeURIComponent(n.id) + '"><img src="' + esc(n.image || 'assets/pelajar.jpg') + '" alt="" loading="lazy"></a>' +
      '<time>' + esc(C.date(n.date)) + ' · ' + esc(n.category) + '</time>' +
      '<h3><a href="berita.html?id=' + encodeURIComponent(n.id) + '">' + esc(n.title) + '</a></h3><p>' + esc(n.summary) + '</p></article>';
  }
  if ($('news')) {
    var pub = C.published(d), lim = +($('news').dataset.limit || 0);
    $('news').innerHTML = (lim ? pub.slice(0, lim) : pub).map(card).join('') || '<p class="fine">Tiada berita lagi.</p>';
  }

  if ($('article')) {
    var id = new URLSearchParams(location.search).get('id');
    var n = id && d.news.filter(function (x) { return x.id === id && x.status === 'published'; })[0];
    if (n) {
      document.title = n.title + ' · Ar Rahmah Malaysia';
      $('article').innerHTML = '<p class="eyebrow">' + esc(n.category) + '</p><h1>' + esc(n.title) + '</h1>' +
        '<p class="fine">' + esc(C.date(n.date)) + ' · ' + esc(n.author || '') + '</p>' +
        (n.image ? '<img class="art-img" src="' + esc(n.image) + '" alt="">' : '') +
        '<div class="art-body">' + C.paras(n.body) + '</div>' +
        '<p><a class="btn btn-line" href="berita.html">Semua berita</a></p>';
      if ($('news-list-wrap')) $('news-list-wrap').hidden = true;
    } else if (id) {
      $('article').innerHTML = '<h1>Berita tidak dijumpai</h1><p>Berita ini mungkin telah dipadam atau belum diterbitkan.</p>';
    }
  }

  if ($('tiers')) {
    $('tiers').innerHTML = d.tiers.map(function (t, i) {
      return '<div class="tier' + (i === 0 ? ' top' : '') + '"><h3>' + esc(t.name) + '</h3><div class="amt">RM' + Number(t.amount).toLocaleString('en-MY') + '</div>' +
        '<p class="per">' + esc(t.note) + '</p><a class="btn ' + (i === 0 ? 'btn-gold' : 'btn-navy') + '" href="#daftar" data-tier="' + esc(t.name) + '">Pilih kategori ini</a></div>';
    }).join('');
  }
  var kat = $('kat');
  if (kat) {
    kat.innerHTML = '<option value="">Pilih kategori</option>' + d.tiers.map(function (t) { return '<option>' + esc(t.name) + '</option>'; }).join('') + '<option>Belum pasti, mahu taklimat dahulu</option>';
    document.addEventListener('click', function (e) { var a = e.target.closest('[data-tier]'); if (a) kat.value = a.getAttribute('data-tier'); });
  }

  // Penaung interest form -> saved as an enquiry the admin sees
  var form = $('minat');
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
      var data = C.load();
      data.leads.unshift({ id: C.uid(), name: form.nama.value.trim(), org: form.org.value.trim(), tel: form.tel.value.trim(), email: form.email.value.trim(), tier: form.kat.value, msg: form.msg.value.trim(), date: C.today(), status: 'Baharu' });
      C.save(data);
      form.style.display = 'none';
      var done = $('minat-done');
      done.querySelector('b').textContent = form.nama.value.trim();
      done.classList.add('show');
      done.focus();
    });
  }
})();
