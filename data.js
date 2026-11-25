// Default content. The CMS saves edits in the browser (localStorage) on top of this.
// In the real build this comes from the database.
window.DEFAULT_CONTENT = {
  v: 1,
  site: {
    hero_title: 'Membina Generasi Muslim Baharu Masa Hadapan di Utara Thailand',
    tagline_en: 'Building future Muslim generations in Northern Thailand',
    hero_text: "Kami menjaga, mendidik dan membimbing anak-anak mualaf dari komuniti 'Orang Bukit' di Phayao dan Chiang Rai, seawal usia 7 tahun.",
    hero_image: 'assets/hero.jpg',
    about_title: 'Meneruskan amanah dakwah yang bermula lebih 30 tahun dahulu',
    about_text: 'Usaha ini dimulakan oleh Almarhum Ustaz Abdul Wahab Ahmad bersama para pendakwah tempatan di wilayah Phayao dan Chiang Rai. Pertubuhan Ar Rahmah Malaysia ditubuhkan untuk meneruskan perjuangan itu, dengan pendidikan yang tersusun untuk anak-anak mualaf supaya saudara baharu tidak kembali mundur.',
    visi: 'Melahirkan generasi Muslim mualaf yang berilmu, berakhlak mulia dan mampu membina komuniti Islam yang kukuh serta berdikari dalam tempoh 20 tahun.',
    chair_quote: 'Kami percaya bahawa setiap anak mualaf yang dibimbing hari ini mampu menjadi pemimpin, pendidik dan pembina ummah pada masa hadapan.',
    chair_name: 'Amir Hamzah bin Abdul Hashim',
    chair_role: 'Pengerusi',
    ros: 'PMM-022-07-140322013',
    founded: '14 Mac 2013',
    address: 'No. 7, Tingkat 2, Jalan Permatang Gedong, Taman Sejati Indah, 08000 Sungai Petani, Kedah',
    office: 'Sungai Petani, Kedah',
    email: 'arrahmahmalaysia@gmail.com',
    phone1_name: 'Md Isa Daud', phone1: '+6012 475 8876',
    phone2_name: 'Zakaria (Mamu Z)', phone2: '+6012 410 1696',
    bank_name: 'Maybank', bank_holder: 'Pertubuhan Ar Rahmah Malaysia', bank_acc: '5520 3110 4857',
    facebook: 'https://www.facebook.com/', tiktok: 'https://www.tiktok.com/'
  },
  stats: { students: '150', centres: '4', uni: '40', years: '30+', asof: 'Mei 2026' },
  centres: [
    { id: 'c1', name: 'Phayao Islamic Centre', region: 'Phayao', students: 60, note: '' },
    { id: 'c2', name: 'Pangsa Islamic Centre', region: 'Chiang Rai', students: 60, note: '' },
    { id: 'c3', name: 'Wiang Mok Islamic Centre', region: 'Chiang Rai', students: 30, note: '' },
    { id: 'c4', name: 'Islamic Centre Saiburi', region: 'Pattani', students: 40, note: 'Menengah & universiti' }
  ],
  spending: [
    { year: 2021, amount: 601748.50, type: 'actual' },
    { year: 2022, amount: 346039.60, type: 'actual' },
    { year: 2023, amount: 405876.00, type: 'actual' },
    { year: 2024, amount: 370100.00, type: 'actual' },
    { year: 2025, amount: 461722.45, type: 'actual' },
    { year: 2026, amount: 550000, type: 'projection' },
    { year: 2027, amount: 600000, type: 'projection' },
    { year: 2028, amount: 700000, type: 'projection' },
    { year: 2029, amount: 850000, type: 'projection' },
    { year: 2030, amount: 1000000, type: 'projection' }
  ],
  news: [
    { id: 'n1', title: 'Program Qurban Chiang Rai 2025', category: 'Kebajikan', date: '2025-06-08', status: 'published', author: 'Md Isa Daud',
      image: 'assets/qurban.jpg',
      summary: 'Program korban tahunan yang dijalankan sejak 2013 bersama sukarelawan dari Malaysia.',
      body: 'Contoh isi berita. Admin menulis isi penuh berita di sini dari CMS.\n\nSetiap perenggan dipisahkan dengan baris kosong.' },
    { id: 'n2', title: 'Agihan beras kepada keluarga mualaf', category: 'Kebajikan', date: '2025-03-15', status: 'published', author: 'Saiful Nizar Abd Rahim',
      image: 'assets/beras.jpg',
      summary: 'Barang keperluan asas diagihkan kepada keluarga pelajar di kampung pedalaman.',
      body: 'Contoh isi berita. Admin menulis isi penuh berita di sini dari CMS.' },
    { id: 'n3', title: 'Persembahan pelajar di majlis komuniti', category: 'Pendidikan', date: '2025-01-20', status: 'published', author: 'Saiful Nizar Abd Rahim',
      image: 'assets/majlis.jpg',
      summary: 'Pelajar Islamic Centre tampil di hadapan masyarakat setempat.',
      body: 'Contoh isi berita. Admin menulis isi penuh berita di sini dari CMS.' },
    { id: 'n4', title: 'Program khatan tahunan di Sabah', category: 'Malaysia', date: '2025-12-01', status: 'draft', author: 'Saiful Nizar Abd Rahim',
      image: 'assets/pelajar.jpg',
      summary: 'Aktiviti dakwah dan kebajikan Ar Rahmah di Malaysia.',
      body: 'Draf. Belum diterbitkan.' }
  ],
  reports: [
    { id: 'r1', title: 'Laporan aktiviti & kewangan · Suku 3, 2026', file: 'laporan-s3-2026.pdf', size: '2.1 MB', url: '#', public: true },
    { id: 'r2', title: 'Laporan aktiviti & kewangan · Suku 2, 2026', file: 'laporan-s2-2026.pdf', size: '1.8 MB', url: '#', public: true },
    { id: 'r3', title: 'Profil pertubuhan (booklet)', file: 'booklet-ar-rahmah.pdf', size: '5.9 MB', url: '#', public: true }
  ],
  tiers: [
    { id: 't1', name: 'Penaung Utama', amount: 100000, note: 'setahun dan ke atas' },
    { id: 't2', name: 'Penaung Platinum', amount: 50000, note: 'setahun dan ke atas' },
    { id: 't3', name: 'Penaung Emas', amount: 30000, note: 'setahun dan ke atas' }
  ],
  leads: [
    { id: 'l1', name: 'Contoh: Syarikat ABC Sdn Bhd', org: 'Syarikat ABC Sdn Bhd', tel: '012 345 6789', email: 'abc@contoh.my', tier: 'Penaung Emas', msg: 'Mohon taklimat.', date: '2026-11-20', status: 'Baharu' },
    { id: 'l2', name: 'Contoh: Yayasan XYZ', org: 'Yayasan XYZ', tel: '019 876 5432', email: 'xyz@contoh.my', tier: 'Belum pasti, mahu taklimat dahulu', msg: '', date: '2026-11-22', status: 'Baharu' }
  ],
  admins: [
    { id: 'a1', name: 'Md Isa Daud', email: 'setiausaha@arrahmah.my', password: 'demo1234', role: 'Super Admin' },
    { id: 'a2', name: 'Zakaria M Hj Mydin', email: 'bendahari@arrahmah.my', password: 'demo1234', role: 'Editor' },
    { id: 'a3', name: 'Saiful Nizar Abd Rahim', email: 'media@arrahmah.my', password: 'demo1234', role: 'Penulis' }
  ],
  log: []
};
