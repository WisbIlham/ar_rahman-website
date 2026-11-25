// Static CMS for the Ar Rahmah mockup. All data lives in localStorage via CMS.load()/CMS.save().
(function () {
  var C = window.CMS, esc = C.esc, d = C.load(), me = null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var main = $('#main'), SKEY = 'arrahmah_admin_session';

  var MENU = [
    { k: 'dash', t: 'Papan pemuka', r: 'SEP' },
    { k: 'news', t: 'Berita & aktiviti', r: 'SEP' },
    { k: 'page', t: 'Halaman utama', r: 'SE' },
    { k: 'stats', t: 'Statistik & kewangan', r: 'SE' },
    { k: 'centres', t: 'Islamic Centre', r: 'SE' },
    { k: 'reports', t: 'Laporan', r: 'SE' },
    { k: 'tiers', t: 'Kategori penaung', r: 'SE' },
    { k: 'leads', t: 'Pertanyaan penaung', r: 'SE' },
    { k: 'settings', t: 'Tetapan & data', r: 'S' },
    { k: 'admins', t: 'Admin & peranan', r: 'S' }
  ];
  var ROLES = ['Super Admin', 'Editor', 'Penulis'];
  function rc() { return me.role === 'Super Admin' ? 'S' : me.role === 'Editor' ? 'E' : 'P'; }
  function can(k) { var m = MENU.filter(function (x) { return x.k === k; })[0]; return !!m && m.r.indexOf(rc()) >= 0; }

  /* ---------- storage + activity log ---------- */
  function persist(what) {
    if (what) {
      d.log.unshift({ when: new Date().toISOString(), who: me ? me.name : 'Sistem', what: what });
      d.log = d.log.slice(0, 40);
    }
    if (!C.save(d)) { say('Gagal simpan: storan pelayar penuh. Guna gambar lebih kecil.'); return false; }
    return true;
  }
  function reload() { d = C.load(); }

  /* ---------- small html helpers ---------- */
  function field(label, name, val, o) {
    o = o || {};
    var id = 'f_' + name;
    var input = o.area
      ? '<textarea id="' + id + '" name="' + name + '" rows="' + (o.rows || 4) + '">' + esc(val) + '</textarea>'
      : o.options
        ? '<select id="' + id + '" name="' + name + '"' + (o.disabled ? ' disabled' : '') + '>' + o.options.map(function (op) { return '<option' + (op === val ? ' selected' : '') + '>' + esc(op) + '</option>'; }).join('') + '</select>'
        : '<input id="' + id + '" name="' + name + '" type="' + (o.type || 'text') + '" value="' + esc(val) + '"' + (o.type === 'number' ? ' step="any" inputmode="decimal"' : '') + '>';
    return '<div' + (o.req ? ' data-req' : '') + (o.cls ? ' class="' + o.cls + '"' : '') + '><label for="' + id + '">' + label + '</label>' + input +
      (o.help ? '<p class="help">' + o.help + '</p>' : '') + (o.req ? '<p class="err">' + (o.err || 'Ruangan ini wajib diisi.') + '</p>' : '') + '</div>';
  }
  function validate(form) {
    var ok = true;
    $$('[data-req]', form).forEach(function (f) {
      var i = $('input,select,textarea', f), v = i.value.trim();
      var bad = !v || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    if (!ok) { var x = $('.invalid input,.invalid select,.invalid textarea', form); if (x) x.focus(); }
    return ok;
  }
  function formObj(form) { var o = {}; new FormData(form).forEach(function (v, k) { if (typeof v === 'string') o[k] = v.trim(); }); return o; }
  function pill(s) {
    var cls = { published: 'ok', Diterbit: 'ok', Dihubungi: 'ok', 'Jadi Penaung': 'ok', draft: 'draft', Baharu: 'new' }[s] || '';
    var txt = { published: 'Diterbit', draft: 'Draf' }[s] || s;
    return '<span class="pill ' + cls + '">' + esc(txt) + '</span>';
  }
  function ago(iso) {
    var m = Math.round((Date.now() - new Date(iso)) / 60000);
    return m < 1 ? 'baru tadi' : m < 60 ? m + ' min lalu' : m < 1440 ? Math.round(m / 60) + ' jam lalu' : C.date(iso.slice(0, 10));
  }
  function download(name, text, type) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function readImage(file, max, cb) {
    if (!/^image\//.test(file.type)) { say('Sila pilih fail gambar.'); return; }
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.78));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  // two-step delete without browser dialogs
  function armed(btn) {
    if (btn.dataset.armed) return true;
    btn.dataset.armed = '1'; var t = btn.textContent; btn.textContent = 'Pasti padam?';
    setTimeout(function () { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = t; } }, 3000);
    return false;
  }

  /* ---------- editable rows (centres, tiers, spending) ---------- */
  var ROWCOLS = {};
  function rowHtml(cols, r) {
    return '<tr data-id="' + esc(r.id || '') + '">' + cols.map(function (c) {
      var v = r[c.k] == null ? '' : r[c.k];
      var inp = c.opts
        ? '<select data-k="' + c.k + '" aria-label="' + c.label + '">' + c.opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
        : '<input data-k="' + c.k + '" aria-label="' + c.label + '" type="' + (c.type || 'text') + '"' + (c.type === 'number' ? ' step="any" inputmode="decimal"' : '') + ' value="' + esc(v) + '">';
      return '<td>' + inp + '</td>';
    }).join('') + '<td><button type="button" class="link del del-row">Buang</button></td></tr>';
  }
  function rowsEditor(id, cols, rows) {
    ROWCOLS[id] = cols;
    return '<div class="tbl-wrap"><table class="tbl edit" id="' + id + '"><thead><tr>' + cols.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') +
      '<th></th></tr></thead><tbody>' + rows.map(function (r) { return rowHtml(cols, r); }).join('') + '</tbody></table></div>' +
      '<div class="panel-b" style="padding-top:0"><button type="button" class="btn btn-line add-row" data-for="' + id + '">Tambah baris</button></div>';
  }
  function readRows(id) {
    var cols = ROWCOLS[id];
    return $$('#' + id + ' tbody tr').map(function (tr) {
      var o = { id: tr.dataset.id || C.uid() };
      cols.forEach(function (c) { var v = $('[data-k="' + c.k + '"]', tr).value.trim(); o[c.k] = c.type === 'number' ? (v === '' ? 0 : Number(v)) : v; });
      return o;
    });
  }
  main.addEventListener('click', function (e) {
    var add = e.target.closest('.add-row');
    if (add) { var id = add.dataset.for; $('#' + id + ' tbody').insertAdjacentHTML('beforeend', rowHtml(ROWCOLS[id], {})); var ins = $$('#' + id + ' tbody tr:last-child input'); if (ins[0]) ins[0].focus(); }
    var del = e.target.closest('.del-row');
    if (del) del.closest('tr').remove();
  });

  /* ---------- views ---------- */
  var V = {};

  V.dash = function () {
    var pub = d.news.filter(function (n) { return n.status === 'published'; }).length;
    var drafts = d.news.filter(function (n) { return n.status === 'draft'; }).length;
    var newLeads = d.leads.filter(function (l) { return l.status === 'Baharu'; }).length;
    var todo = [];
    if (drafts && rc() !== 'P') todo.push([drafts + ' berita dalam draf menunggu semakan', '#news']);
    if (newLeads && can('leads')) todo.push([newLeads + ' pertanyaan Penaung Dakwah belum dihubungi', '#leads']);
    if (can('reports')) todo.push(['Laporan suku tahun: pastikan laporan terkini dimuat naik', '#reports']);
    if (rc() === 'P') todo.push(['Tulis berita baharu dan hantar untuk semakan', '#news/new']);
    return '<h1>Assalamualaikum, ' + esc(me.name.split(' ')[0] + ' ' + (me.name.split(' ')[1] || '')) + '</h1><p class="sub">Anda log masuk sebagai <b>' + esc(me.role) + '</b>.</p>' +
      '<div class="kpis"><a href="#news"><b>' + pub + '</b><span>berita diterbit</span></a><a href="#news"><b>' + drafts + '</b><span>draf</span></a>' +
      '<a href="' + (can('leads') ? '#leads' : '#dash') + '"><b>' + newLeads + '</b><span>pertanyaan baharu</span></a><a href="' + (can('admins') ? '#admins' : '#dash') + '"><b>' + d.admins.length + '</b><span>admin</span></a></div>' +
      '<div class="panel"><div class="panel-h"><h2>Perlu tindakan</h2></div><table class="tbl"><tbody>' +
      todo.map(function (t) { return '<tr><td>' + esc(t[0]) + '</td><td style="text-align:right"><a href="' + t[1] + '">Buka</a></td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div class="panel"><div class="panel-h"><h2>Aktiviti terkini</h2></div><ul class="log">' +
      (d.log.slice(0, 10).map(function (l) { return '<li><span><b>' + esc(l.who) + '</b> ' + esc(l.what) + '</span><time>' + ago(l.when) + '</time></li>'; }).join('') || '<li><span class="fine">Belum ada aktiviti. Setiap perubahan admin akan direkod di sini.</span></li>') +
      '</ul></div>';
  };

  var newsFilter = 'all';
  V.news = function (arg) {
    if (arg) return newsEditor(arg);
    var list = d.news.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .filter(function (n) { return newsFilter === 'all' || n.status === newsFilter; });
    return '<h1>Berita & aktiviti</h1><p class="sub">Berita yang diterbit muncul di laman utama (3 terkini) dan di halaman Berita.</p>' +
      '<div class="panel"><div class="panel-h"><div class="filters" role="group" aria-label="Tapis">' +
      [['all', 'Semua'], ['published', 'Diterbit'], ['draft', 'Draf']].map(function (f) { return '<button type="button" data-filter="' + f[0] + '" aria-pressed="' + (newsFilter === f[0]) + '">' + f[1] + '</button>'; }).join('') +
      '</div><a class="btn btn-gold" href="#news/new">Tambah berita</a></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tajuk</th><th class="hide-sm">Tarikh</th><th>Status</th><th></th></tr></thead><tbody>' +
      (list.map(function (n) {
        var mine = n.author === me.name, edit = rc() !== 'P' || (mine && n.status === 'draft');
        return '<tr><td><b>' + esc(n.title) + '</b><br><small>' + esc(n.category) + ' · ' + esc(n.author || '') + '</small></td><td class="hide-sm">' + esc(C.date(n.date)) + '</td><td>' + pill(n.status) + '</td><td><div class="acts">' +
          (n.status === 'published' ? '<a href="berita.html?id=' + encodeURIComponent(n.id) + '" target="_blank" rel="noopener">Lihat</a>' : '') +
          (edit ? '<a href="#news/' + encodeURIComponent(n.id) + '">Sunting</a>' : '') +
          (rc() !== 'P' ? '<button type="button" class="link del" data-del-news="' + esc(n.id) + '">Padam</button>' : '') + '</div></td></tr>';
      }).join('') || '<tr><td colspan="4" class="fine">Tiada berita.</td></tr>') +
      '</tbody></table></div></div>';
  };
  function newsEditor(id) {
    var isNew = id === 'new';
    var n = isNew ? { id: '', title: '', category: 'Pendidikan', date: C.today(), summary: '', body: '', image: '', status: 'draft', author: me.name }
      : d.news.filter(function (x) { return x.id === id; })[0];
    if (!n) return '<h1>Berita tidak dijumpai</h1><p><a href="#news">Kembali</a></p>';
    var writer = rc() === 'P';
    return '<p><a href="#news">← Semua berita</a></p><h1>' + (isNew ? 'Tambah berita' : 'Sunting berita') + '</h1><p class="sub">' + (isNew ? '' : 'Ditulis oleh ' + esc(n.author || '-')) + '</p>' +
      (writer ? '<p class="lock">Sebagai Penulis, berita anda disimpan sebagai draf. Editor akan semak dan terbitkan.</p>' : '') +
      '<form class="panel form" id="newsForm" novalidate data-id="' + esc(n.id) + '"><div class="panel-b form">' +
      field('Tajuk', 'title', n.title, { req: true, err: 'Sila isi tajuk.' }) +
      '<div class="grid2">' + field('Kategori', 'category', n.category, { options: ['Pendidikan', 'Dakwah', 'Kebajikan', 'Malaysia', 'Pengumuman'] }) + field('Tarikh', 'date', n.date, { type: 'date', req: true }) + '</div>' +
      field('Ringkasan', 'summary', n.summary, { area: true, rows: 2, help: 'Satu atau dua ayat. Dipapar pada kad berita.' }) +
      field('Isi berita', 'body', n.body, { area: true, rows: 10, help: 'Pisahkan perenggan dengan satu baris kosong.' }) +
      '<div><label for="f_img">Gambar utama</label><div class="img-field"><img id="imgPrev" src="' + esc(n.image || '') + '" alt="" ' + (n.image ? '' : 'hidden') + '>' +
      '<div><input id="f_img" type="file" accept="image/*"><p class="help">Gambar dikecilkan secara automatik (maks 1200px).</p>' +
      '<button type="button" class="link del" id="imgRemove" ' + (n.image ? '' : 'hidden') + '>Buang gambar</button></div></div><input type="hidden" name="image" id="imgData" value="' + esc(n.image || '') + '"></div>' +
      field('Status', 'status', writer ? 'Draf' : (n.status === 'published' ? 'Diterbit' : 'Draf'), { options: ['Draf', 'Diterbit'], disabled: writer }) +
      '<div class="bar-actions"><button class="btn btn-navy" type="submit">Simpan</button><a class="btn btn-line" href="#news">Batal</a></div>' +
      '</div></form>';
  }

  V.page = function () {
    var s = d.site;
    return '<h1>Halaman utama</h1><p class="sub">Teks utama laman awam.</p><form class="form" id="pageForm" novalidate>' +
      '<div class="panel"><div class="panel-h"><h2>Bahagian atas (hero)</h2></div><div class="panel-b form">' +
      field('Tajuk utama', 'hero_title', s.hero_title, { req: true }) + field('Tagline (English)', 'tagline_en', s.tagline_en) + field('Teks pengenalan', 'hero_text', s.hero_text, { area: true, rows: 3 }) +
      '<div><label for="f_hero">Gambar utama</label><div class="img-field"><img id="heroPrev" src="' + esc(s.hero_image) + '" alt=""><div><input id="f_hero" type="file" accept="image/*"><p class="help">Gambar lebar (landskap) paling sesuai.</p></div></div><input type="hidden" name="hero_image" id="heroData" value="' + esc(s.hero_image) + '"></div>' +
      '</div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Tentang kami</h2></div><div class="panel-b form">' +
      field('Tajuk', 'about_title', s.about_title) + field('Teks', 'about_text', s.about_text, { area: true, rows: 5 }) + field('Visi', 'visi', s.visi, { area: true, rows: 3 }) +
      field('Kata-kata Pengerusi', 'chair_quote', s.chair_quote, { area: true, rows: 3 }) +
      '<div class="grid2">' + field('Nama Pengerusi', 'chair_name', s.chair_name) + field('Jawatan', 'chair_role', s.chair_role) + '</div>' +
      '</div></div><div class="bar-actions"><button class="btn btn-navy" type="submit">Simpan perubahan</button><a href="index.html" target="_blank" rel="noopener">Pratonton laman</a></div></form>';
  };

  V.stats = function () {
    var st = d.stats;
    return '<h1>Statistik & kewangan</h1><p class="sub">Angka di bahagian atas laman utama dan carta perbelanjaan.</p><form id="statsForm" novalidate>' +
      '<div class="panel"><div class="panel-h"><h2>Statistik semasa</h2></div><div class="panel-b form"><div class="grid2">' +
      field('Pelajar aktif', 'students', st.students) + field('Bilangan Islamic Centre', 'centres', st.centres) +
      field('Pelajar menengah & universiti', 'uni', st.uni) + field('Tahun usaha dakwah', 'years', st.years) +
      field('Sehingga (bulan, tahun)', 'asof', st.asof) + '</div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Perbelanjaan tahunan</h2><span class="fine">Unjuran dipapar sebagai bar bergaris putus.</span></div>' +
      rowsEditor('spendRows', [{ k: 'year', label: 'Tahun', type: 'number' }, { k: 'amount', label: 'Jumlah (RM)', type: 'number' }, { k: 'type', label: 'Jenis', opts: [['actual', 'Sebenar'], ['projection', 'Unjuran']] }],
        d.spending.slice().sort(function (a, b) { return a.year - b.year; })) +
      '</div><button class="btn btn-navy" type="submit">Simpan</button></form>';
  };

  V.centres = function () {
    return '<h1>Islamic Centre</h1><p class="sub">Senarai pusat dalam jadual di laman utama.</p><form id="centresForm"><div class="panel">' +
      rowsEditor('centreRows', [{ k: 'name', label: 'Nama pusat' }, { k: 'region', label: 'Wilayah' }, { k: 'students', label: 'Pelajar', type: 'number' }, { k: 'note', label: 'Catatan' }], d.centres) +
      '</div><button class="btn btn-navy" type="submit">Simpan</button></form>';
  };

  V.tiers = function () {
    return '<h1>Kategori penaung</h1><p class="sub">Kategori di halaman Penaung Dakwah dan dalam borang minat. Yang pertama ditonjolkan.</p><form id="tiersForm"><div class="panel">' +
      rowsEditor('tierRows', [{ k: 'name', label: 'Nama kategori' }, { k: 'amount', label: 'Komitmen (RM)', type: 'number' }, { k: 'note', label: 'Catatan' }], d.tiers) +
      '</div><button class="btn btn-navy" type="submit">Simpan</button></form>';
  };

  V.reports = function () {
    return '<h1>Laporan</h1><p class="sub">Laporan "Awam" dipapar di bahagian Ketelusan laman utama.</p>' +
      '<div class="panel"><div class="panel-h"><h2>Muat naik laporan</h2></div><form class="panel-b form" id="repForm" novalidate>' +
      field('Tajuk laporan', 'title', '', { req: true, err: 'Sila isi tajuk.' }) +
      '<div data-req><label for="f_pdf">Fail PDF</label><input id="f_pdf" type="file" accept="application/pdf"><p class="err">Sila pilih fail PDF.</p><p class="help">Demo: fail bawah 1 MB disimpan dan boleh dimuat turun. Fail lebih besar hanya direkod namanya.</p></div>' +
      '<div class="bar-actions"><button class="btn btn-gold" type="submit">Muat naik</button></div></form></div>' +
      '<div class="panel"><div class="panel-h"><h2>Semua laporan</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tajuk</th><th class="hide-sm">Fail</th><th>Awam</th><th></th></tr></thead><tbody>' +
      (d.reports.map(function (r) {
        return '<tr><td>' + esc(r.title) + '</td><td class="hide-sm"><small>' + esc(r.file) + ' · ' + esc(r.size) + '</small></td>' +
          '<td><input type="checkbox" style="width:22px;min-height:22px" data-pub="' + esc(r.id) + '"' + (r.public ? ' checked' : '') + ' aria-label="Papar kepada awam"></td>' +
          '<td><div class="acts"><button type="button" class="link del" data-del-rep="' + esc(r.id) + '">Padam</button></div></td></tr>';
      }).join('') || '<tr><td colspan="4" class="fine">Tiada laporan.</td></tr>') + '</tbody></table></div></div>';
  };

  var leadOpen = {};
  V.leads = function () {
    var st = ['Baharu', 'Dihubungi', 'Jadi Penaung', 'Tidak berminat'];
    return '<h1>Pertanyaan penaung</h1><p class="sub">Dari borang "Nyatakan minat" di halaman Penaung Dakwah.</p>' +
      '<div class="panel"><div class="panel-h"><h2>' + d.leads.length + ' pertanyaan</h2><button type="button" class="btn btn-line" id="csv">Muat turun CSV</button></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nama</th><th class="hide-sm">Kategori</th><th>Status</th><th></th></tr></thead><tbody>' +
      (d.leads.map(function (l) {
        return '<tr><td><b>' + esc(l.name) + '</b><br><small>' + esc(l.tel) + ' · ' + esc(l.email) + ' · ' + esc(C.date(l.date)) + '</small>' +
          (leadOpen[l.id] ? '<div class="msg">' + (l.org ? 'Organisasi: ' + esc(l.org) + '\n' : '') + 'Kategori: ' + esc(l.tier) + '\n' + (l.msg ? 'Mesej: ' + esc(l.msg) : 'Tiada mesej.') + '</div>' : '') +
          '</td><td class="hide-sm">' + esc(l.tier) + '</td><td><select data-lead="' + esc(l.id) + '" aria-label="Status" style="min-width:140px">' +
          st.map(function (s) { return '<option' + (s === l.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
          '</select></td><td><div class="acts"><button type="button" class="link" data-open="' + esc(l.id) + '">' + (leadOpen[l.id] ? 'Tutup' : 'Butiran') + '</button>' +
          '<a href="https://wa.me/' + esc(String(l.tel).replace(/\D/g, '').replace(/^0/, '60')) + '" target="_blank" rel="noopener">WhatsApp</a>' +
          '<button type="button" class="link del" data-del-lead="' + esc(l.id) + '">Padam</button></div></td></tr>';
      }).join('') || '<tr><td colspan="4" class="fine">Belum ada pertanyaan.</td></tr>') + '</tbody></table></div></div>';
  };

  V.settings = function () {
    var s = d.site;
    return '<h1>Tetapan & data</h1><p class="sub">Maklumat pertubuhan, hubungan dan akaun bank. Dipapar di footer, bahagian Sumbang dan Penaung.</p>' +
      '<form class="form" id="setForm" novalidate><div class="panel"><div class="panel-h"><h2>Pertubuhan</h2></div><div class="panel-b form"><div class="grid2">' +
      field('No. pendaftaran ROS', 'ros', s.ros) + field('Tarikh penubuhan', 'founded', s.founded) + '</div>' +
      field('Alamat', 'address', s.address, { area: true, rows: 2 }) + field('Pejabat (ringkas)', 'office', s.office) + '</div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Hubungi</h2></div><div class="panel-b form"><div class="grid2">' +
      field('Nama hubungan 1', 'phone1_name', s.phone1_name) + field('Telefon 1 (juga WhatsApp)', 'phone1', s.phone1, { type: 'tel' }) +
      field('Nama hubungan 2', 'phone2_name', s.phone2_name) + field('Telefon 2', 'phone2', s.phone2, { type: 'tel' }) + '</div>' +
      field('Emel', 'email', s.email, { type: 'email', req: true, err: 'Sila isi emel yang sah.' }) +
      '<div class="grid2">' + field('Pautan Facebook', 'facebook', s.facebook, { type: 'url' }) + field('Pautan TikTok', 'tiktok', s.tiktok, { type: 'url' }) + '</div></div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Akaun bank</h2></div><div class="panel-b form"><div class="grid2">' +
      field('Bank', 'bank_name', s.bank_name) + field('No. akaun', 'bank_acc', s.bank_acc, { req: true }) + '</div>' + field('Nama pemegang akaun', 'bank_holder', s.bank_holder) + '</div></div>' +
      '<button class="btn btn-navy" type="submit">Simpan tetapan</button></form>' +
      '<div class="panel" style="margin-top:24px"><div class="panel-h"><h2>Sandaran data</h2></div><div class="panel-b"><p class="help" style="margin:0 0 14px">Data CMS ini disimpan dalam pelayar. Muat turun sandaran untuk pindah ke komputer lain.</p>' +
      '<div class="bar-actions" style="margin:0"><button type="button" class="btn btn-line" id="exportJson">Muat turun sandaran (JSON)</button>' +
      '<label class="btn btn-line" style="margin:0">Pulihkan dari fail<input type="file" accept="application/json,.json" id="importJson" hidden></label>' +
      '<button type="button" class="btn btn-line" style="color:var(--err)" id="resetAll">Set semula data demo</button></div></div></div>';
  };

  V.admins = function () {
    return '<h1>Admin & peranan</h1><p class="sub">Setiap admin log masuk dengan akaun sendiri. Semua perubahan direkod di Papan pemuka.</p>' +
      '<div class="panel"><div class="panel-h"><h2>Senarai admin</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nama</th><th class="hide-sm">Emel</th><th>Peranan</th><th></th></tr></thead><tbody>' +
      d.admins.map(function (a) {
        var self = a.id === me.id;
        return '<tr><td><b>' + esc(a.name) + '</b>' + (self ? ' <small>(anda)</small>' : '') + '</td><td class="hide-sm">' + esc(a.email) + '</td>' +
          '<td><select data-role="' + esc(a.id) + '" aria-label="Peranan" style="min-width:140px"' + (self ? ' disabled' : '') + '>' + ROLES.map(function (r) { return '<option' + (r === a.role ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></td>' +
          '<td><div class="acts">' + (self ? '' : '<button type="button" class="link del" data-del-admin="' + esc(a.id) + '">Buang</button>') + '</div></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="panel-b" style="border-top:1px solid var(--line);font-size:.88rem;color:var(--muted)"><b>Super Admin</b>: semua, termasuk tetapan dan urus admin. <b>Editor</b>: semua kandungan, laporan dan pertanyaan. <b>Penulis</b>: tulis berita sebagai draf sahaja.</div></div>' +
      '<div class="panel"><div class="panel-h"><h2>Tambah admin</h2></div><form class="panel-b form" id="adminForm" novalidate><div class="grid2">' +
      field('Nama', 'name', '', { req: true, err: 'Sila isi nama.' }) + field('Emel', 'email', '', { type: 'email', req: true, err: 'Sila isi emel yang sah.' }) +
      field('Peranan', 'role', 'Editor', { options: ROLES }) + field('Kata laluan sementara', 'password', '', { req: true, err: 'Sila isi kata laluan (min 6 aksara).', help: 'Sistem sebenar: admin terima emel jemputan untuk tetapkan sendiri.' }) +
      '</div><div class="bar-actions"><button class="btn btn-gold" type="submit">Tambah admin</button></div></form></div>';
  };

  /* ---------- after-render wiring ---------- */
  var WIRE = {};
  WIRE.news = function (arg) {
    $$('[data-filter]').forEach(function (b) { b.onclick = function () { newsFilter = b.dataset.filter; render(); }; });
    $$('[data-del-news]').forEach(function (b) {
      b.onclick = function () {
        if (!armed(b)) return;
        var n = d.news.filter(function (x) { return x.id === b.dataset.delNews; })[0];
        d.news = d.news.filter(function (x) { return x !== n; });
        persist('memadam berita "' + n.title + '"'); say('Berita dipadam'); render();
      };
    });
    var f = $('#newsForm'); if (!f) return;
    $('#f_img').onchange = function () {
      var file = this.files[0]; if (!file) return;
      readImage(file, 1200, function (url) { $('#imgData').value = url; $('#imgPrev').src = url; $('#imgPrev').hidden = false; $('#imgRemove').hidden = false; });
    };
    $('#imgRemove').onclick = function () { $('#imgData').value = ''; $('#imgPrev').hidden = true; this.hidden = true; $('#f_img').value = ''; };
    f.onsubmit = function (e) {
      e.preventDefault(); if (!validate(f)) return;
      var o = formObj(f), id = f.dataset.id;
      o.status = rc() === 'P' ? 'draft' : (o.status === 'Diterbit' ? 'published' : 'draft');
      if (!id) { o.id = C.uid(); o.author = me.name; d.news.unshift(o); }
      else { var n = d.news.filter(function (x) { return x.id === id; })[0]; Object.assign(n, o); }
      if (persist((id ? 'menyunting' : 'menambah') + ' berita "' + o.title + '"' + (o.status === 'published' ? ' (diterbit)' : ' (draf)'))) {
        say(o.status === 'published' ? 'Berita diterbitkan' : 'Draf disimpan'); location.hash = '#news';
      } else reload();
    };
  };
  WIRE.page = function () {
    $('#f_hero').onchange = function () {
      var file = this.files[0]; if (!file) return;
      readImage(file, 1600, function (url) { $('#heroData').value = url; $('#heroPrev').src = url; });
    };
    $('#pageForm').onsubmit = function (e) {
      e.preventDefault(); if (!validate(this)) return;
      Object.assign(d.site, formObj(this));
      if (persist('mengemas kini halaman utama')) say('Halaman utama disimpan'); else reload();
    };
  };
  WIRE.stats = function () {
    $('#statsForm').onsubmit = function (e) {
      e.preventDefault();
      var o = formObj(this); ['students', 'centres', 'uni', 'years', 'asof'].forEach(function (k) { d.stats[k] = o[k]; });
      d.spending = readRows('spendRows').filter(function (r) { return r.year; }).map(function (r) { return { year: r.year, amount: r.amount, type: r.type || 'actual' }; });
      persist('mengemas kini statistik & perbelanjaan'); say('Statistik disimpan'); render();
    };
  };
  WIRE.centres = function () {
    $('#centresForm').onsubmit = function (e) {
      e.preventDefault(); d.centres = readRows('centreRows').filter(function (r) { return r.name; });
      persist('mengemas kini senarai Islamic Centre'); say('Islamic Centre disimpan'); render();
    };
  };
  WIRE.tiers = function () {
    $('#tiersForm').onsubmit = function (e) {
      e.preventDefault(); d.tiers = readRows('tierRows').filter(function (r) { return r.name; });
      persist('mengemas kini kategori penaung'); say('Kategori disimpan'); render();
    };
  };
  WIRE.reports = function () {
    var f = $('#repForm');
    f.onsubmit = function (e) {
      e.preventDefault(); if (!validate(f)) return;
      var file = $('#f_pdf').files[0], title = f.elements.title.value.trim();
      var rec = { id: C.uid(), title: title, file: file.name, size: (file.size / 1048576).toFixed(1) + ' MB', url: '#', public: true };
      function done() { d.reports.unshift(rec); if (persist('memuat naik laporan "' + title + '"')) { say('Laporan dimuat naik'); render(); } else reload(); }
      if (file.size <= 1048576) { var r = new FileReader(); r.onload = function () { rec.url = r.result; done(); }; r.readAsDataURL(file); } else done();
    };
    $$('[data-pub]').forEach(function (c) {
      c.onchange = function () { var r = d.reports.filter(function (x) { return x.id === c.dataset.pub; })[0]; r.public = c.checked; persist((c.checked ? 'memaparkan' : 'menyembunyikan') + ' laporan "' + r.title + '"'); say('Disimpan'); };
    });
    $$('[data-del-rep]').forEach(function (b) {
      b.onclick = function () { if (!armed(b)) return; var r = d.reports.filter(function (x) { return x.id === b.dataset.delRep; })[0]; d.reports = d.reports.filter(function (x) { return x !== r; }); persist('memadam laporan "' + r.title + '"'); say('Laporan dipadam'); render(); };
    });
  };
  WIRE.leads = function () {
    $$('[data-lead]').forEach(function (s) {
      s.onchange = function () { var l = d.leads.filter(function (x) { return x.id === s.dataset.lead; })[0]; l.status = s.value; persist('menanda pertanyaan "' + l.name + '" sebagai ' + s.value); say('Status dikemas kini'); buildMenu(); };
    });
    $$('[data-open]').forEach(function (b) { b.onclick = function () { leadOpen[b.dataset.open] = !leadOpen[b.dataset.open]; render(); }; });
    $$('[data-del-lead]').forEach(function (b) {
      b.onclick = function () { if (!armed(b)) return; d.leads = d.leads.filter(function (x) { return x.id !== b.dataset.delLead; }); persist('memadam satu pertanyaan'); say('Pertanyaan dipadam'); render(); };
    });
    $('#csv').onclick = function () {
      var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      var rows = [['Tarikh', 'Nama', 'Organisasi', 'Telefon', 'Emel', 'Kategori', 'Status', 'Mesej']].concat(d.leads.map(function (l) { return [l.date, l.name, l.org, l.tel, l.email, l.tier, l.status, l.msg]; }));
      download('pertanyaan-penaung-' + C.today() + '.csv', '﻿' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n'), 'text/csv');
    };
  };
  WIRE.settings = function () {
    $('#setForm').onsubmit = function (e) {
      e.preventDefault(); if (!validate(this)) return;
      Object.assign(d.site, formObj(this)); persist('mengemas kini tetapan & maklumat hubungan'); say('Tetapan disimpan');
    };
    $('#exportJson').onclick = function () { download('ar-rahmah-cms-' + C.today() + '.json', JSON.stringify(d, null, 2), 'application/json'); };
    $('#importJson').onchange = function () {
      var file = this.files[0]; if (!file) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var x = JSON.parse(r.result);
          if (!x || x.v !== window.DEFAULT_CONTENT.v || !x.site || !Array.isArray(x.news) || !Array.isArray(x.admins)) throw 0;
          d = x; if (!d.admins.some(function (a) { return a.id === me.id; })) d.admins.push(me);
          persist('memulihkan data dari fail sandaran'); say('Data dipulihkan'); render();
        } catch (e) { say('Fail sandaran tidak sah.'); }
      };
      r.readAsText(file);
    };
    $('#resetAll').onclick = function () {
      if (!armed(this)) return;
      C.reset(); d = C.load(); persist('set semula data demo'); say('Data demo dipulihkan'); render();
    };
  };
  WIRE.admins = function () {
    $$('[data-role]').forEach(function (s) {
      s.onchange = function () {
        var a = d.admins.filter(function (x) { return x.id === s.dataset.role; })[0];
        a.role = s.value; persist('menukar peranan ' + a.name + ' kepada ' + s.value); say('Peranan dikemas kini');
      };
    });
    $$('[data-del-admin]').forEach(function (b) {
      b.onclick = function () {
        if (!armed(b)) return;
        var a = d.admins.filter(function (x) { return x.id === b.dataset.delAdmin; })[0];
        d.admins = d.admins.filter(function (x) { return x !== a; }); persist('membuang admin ' + a.name); say('Admin dibuang'); render();
      };
    });
    var f = $('#adminForm');
    f.onsubmit = function (e) {
      e.preventDefault(); if (!validate(f)) return;
      var o = formObj(f);
      if (o.password.length < 6) { f.password.closest('[data-req]').classList.add('invalid'); f.password.focus(); return; }
      if (d.admins.some(function (a) { return a.email.toLowerCase() === o.email.toLowerCase(); })) { say('Emel ini sudah didaftarkan.'); return; }
      d.admins.push({ id: C.uid(), name: o.name, email: o.email, password: o.password, role: o.role });
      persist('menambah admin ' + o.name + ' (' + o.role + ')'); say('Admin ditambah. Mereka boleh log masuk sekarang.'); render();
    };
  };

  /* ---------- shell ---------- */
  function buildMenu() {
    var cur = (location.hash.slice(1) || 'dash').split('/')[0];
    var nl = d.leads.filter(function (l) { return l.status === 'Baharu'; }).length;
    var nd = d.news.filter(function (n) { return n.status === 'draft'; }).length;
    $('#side').innerHTML = '<a class="logo" href="#dash"><img src="assets/logo-gold.png" alt="">Ar Rahmah CMS</a>' +
      MENU.filter(function (m) { return can(m.k); }).map(function (m) {
        var b = m.k === 'leads' && nl ? nl : m.k === 'news' && nd && rc() !== 'P' ? nd : 0;
        return '<a class="m" href="#' + m.k + '"' + (m.k === cur ? ' aria-current="page"' : '') + '>' + m.t + (b ? ' <span class="badge">' + b + '</span>' : '') + '</a>';
      }).join('');
    var c = $('#side [aria-current]'); if (c && window.innerWidth < 860) c.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  function render() {
    if (!me) return;
    var parts = (location.hash.slice(1) || 'dash').split('/'), k = parts[0], arg = parts[1] ? decodeURIComponent(parts[1]) : '';
    if (!can(k)) { k = 'dash'; arg = ''; }
    if (k === 'news' && arg && rc() === 'P' && arg !== 'new') {
      var n = d.news.filter(function (x) { return x.id === arg; })[0];
      if (n && !(n.author === me.name && n.status === 'draft')) { arg = ''; say('Penulis hanya boleh sunting draf sendiri.'); }
    }
    buildMenu();
    $('#who').innerHTML = '<b>' + esc(me.name) + '</b> · ' + esc(me.role);
    main.innerHTML = V[k](arg);
    if (WIRE[k]) WIRE[k](arg);
  }
  window.addEventListener('hashchange', function () { render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); });

  function setSession(id) { try { id ? sessionStorage.setItem(SKEY, id) : sessionStorage.removeItem(SKEY); } catch (e) {} }
  function getSession() { try { return sessionStorage.getItem(SKEY); } catch (e) { return null; } }
  function enter(a) { me = a; setSession(a.id); $('#login').style.display = 'none'; $('#app').classList.add('on'); render(); }
  function showLogin() {
    me = null; $('#app').classList.remove('on'); $('#login').style.display = '';
    $('#demoUsers').innerHTML = d.admins.slice(0, 5).map(function (a) {
      return '<tr><td>' + esc(a.name) + '<br><small style="color:var(--muted)">' + esc(a.role) + ' · ' + esc(a.email) + '</small></td><td><button type="button" class="link" data-fill="' + esc(a.id) + '">Guna</button></td></tr>';
    }).join('');
  }
  $('#demoUsers').addEventListener('click', function (e) {
    var b = e.target.closest('[data-fill]'); if (!b) return;
    var a = d.admins.filter(function (x) { return x.id === b.dataset.fill; })[0];
    $('#u').value = a.email; $('#p').value = a.password; $('#p').focus();
  });
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); reload();
    var em = $('#u').value.trim().toLowerCase(), pw = $('#p').value;
    var a = d.admins.filter(function (x) { return x.email.toLowerCase() === em && x.password === pw; })[0];
    $('#loginErr').classList.toggle('show', !a);
    if (a) { enter(a); d.log.unshift({ when: new Date().toISOString(), who: a.name, what: 'log masuk' }); C.save(d); }
  });
  $('#logout').addEventListener('click', function () { setSession(null); location.hash = ''; showLogin(); });

  var sid = getSession(), sa = sid && d.admins.filter(function (x) { return x.id === sid; })[0];
  if (sa) enter(sa); else showLogin();
})();
