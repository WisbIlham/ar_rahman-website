// Tiny content store for the mockup. Real build: replace with API calls to the backend.
(function () {
  var KEY = 'arrahmah_cms_v1';
  var MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.CMS = {
    load: function () {
      try {
        var s = localStorage.getItem(KEY);
        if (s) { var d = JSON.parse(s); if (d && d.v === window.DEFAULT_CONTENT.v) return d; }
      } catch (e) {}
      return clone(window.DEFAULT_CONTENT);
    },
    save: function (d) {
      try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
    },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    uid: function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    money: function (n) { return Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    short: function (n) { n = Number(n || 0); return n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'j' : Math.round(n / 1000) + 'k'; },
    date: function (iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
      return m ? (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1] : (iso || '');
    },
    today: function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    paras: function (t) {
      return String(t || '').split(/\n\s*\n/).map(function (p) { return p.trim() ? '<p>' + window.CMS.esc(p.trim()).replace(/\n/g, '<br>') + '</p>' : ''; }).join('');
    },
    tel: function (p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); },
    published: function (d) {
      return d.news.filter(function (n) { return n.status === 'published'; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    }
  };
})();
