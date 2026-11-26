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
      var isSouth = /pattani|selatan/i.test(c.region || '');
      return '<tr>' +
        '<td><b>' + esc(c.name) + '</b>' + (c.note ? '<span class="sub">' + esc(c.note) + '</span>' : '') + '</td>' +
        '<td class="hide-sm"><span class="pill' + (isSouth ? ' south' : '') + '">' + esc(c.region) + '</span></td>' +
        '<td class="n">' + esc(c.students) + '</td>' +
      '</tr>';
    }).join('');
  }

  if ($('chart')) {
    var sp = d.spending.slice().sort(function (a, b) { return a.year - b.year; });
    var max = Math.max.apply(null, sp.map(function (x) { return +x.amount; }).concat([1]));
    var cols = 'repeat(' + sp.length + ',1fr)';
    $('chart').style.gridTemplateColumns = cols;
    $('years').style.gridTemplateColumns = cols;

    var roYear = $('ro-year'), roAmt = $('ro-amt'), roType = $('ro-type');
    function fmtRM(n) {
      return 'RM' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    $('chart').innerHTML = sp.map(function (x) {
      var isProj = x.type === 'projection';
      var lbl = isProj ? 'Unjuran' : 'Perbelanjaan sebenar';
      var pct = Math.max(4, (x.amount / max * 92)).toFixed(1);
      return '<div class="bar-col' + (x.year === 2025 ? ' active' : '') + '" role="listitem" tabindex="0" data-y="' + x.year + '" data-a="' + x.amount + '" data-l="' + lbl + '">' +
        '<span class="bar-val">' + C.short(x.amount) +
          '<span class="bar-tip"><b>' + fmtRM(x.amount) + '</b><small>' + x.year + ' · ' + lbl + '</small></span>' +
        '</span>' +
        '<div class="bar-rect' + (isProj ? ' proj' : '') + '" style="height:' + pct + '%"></div>' +
      '</div>';
    }).join('');

    $('years').innerHTML = sp.map(function (x) {
      var isProj = x.type === 'projection';
      return '<span' + (isProj ? ' class="proj-yr"' : '') + '>' + esc(x.year) + (isProj ? '*' : '') + '</span>';
    }).join('');

    var barCols = Array.prototype.slice.call($('chart').querySelectorAll('.bar-col'));
    var prevBtn = $('chart-prev'), nextBtn = $('chart-next'), scroller = $('chart-scroll');
    var activeIdx = 0;

    function pickBar(col, shouldScroll) {
      activeIdx = barCols.indexOf(col);
      barCols.forEach(function (c) { c.classList.remove('active'); });
      col.classList.add('active');
      if (roYear) roYear.textContent = col.dataset.y;
      if (roAmt) roAmt.textContent = fmtRM(col.dataset.a);
      if (roType) roType.textContent = '· ' + col.dataset.l;
      if (prevBtn) prevBtn.disabled = activeIdx <= 0;
      if (nextBtn) nextBtn.disabled = activeIdx >= barCols.length - 1;
      if (shouldScroll && scroller && scroller.scrollWidth > scroller.clientWidth) {
        var target = col.offsetLeft - (scroller.clientWidth / 2) + (col.offsetWidth / 2);
        scroller.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }
    }

    barCols.forEach(function (col) {
      col.addEventListener('mouseenter', function () { pickBar(col, false); });
      col.addEventListener('focus', function () { pickBar(col, true); });
      col.addEventListener('click', function () { pickBar(col, true); });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (activeIdx > 0) pickBar(barCols[activeIdx - 1], true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (activeIdx < barCols.length - 1) pickBar(barCols[activeIdx + 1], true);
      });
    }

    var defCol = $('chart').querySelector('.bar-col.active') || barCols[barCols.length - 1];
    if (defCol) pickBar(defCol, false);
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
