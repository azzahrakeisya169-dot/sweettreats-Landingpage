// ===== Data menu =====
var P = [
  // [emoji, nama, harga, warna latar, kategori, terlaris?, file foto]
  // Foto dicari di folder "foto/". Kalau file belum ada, otomatis tampil emoji.
  ["🍰", "Strawberry Shortcake", 45000, "#ffd6e7", "dessert", true, "foto/strawberry-shortcake.png"],
  ["🧁", "Rainbow Cupcake", 18000, "#b8f0d8", "dessert", true, "foto/rainbow-cupcake.png"],
  ["🍩", "Donat Glaze", 12000, "#ffe48a", "dessert", true, "foto/donat-glaze.png"],
  ["🍮", "Puding Karamel", 15000, "#d9ccff", "dessert", false, "foto/puding-karamel.png"],
  ["🍪", "Cookies Mix", 25000, "#ffcfa8", "dessert", false, "foto/cookies-mix.png"],
  ["🎂", "Kue Ulang Tahun", 120000, "#ffd6e7", "dessert", true, "foto/kue-ulang-tahun.png"],
  ["🍦", "Es Krim Pelangi", 14000, "#b8f0d8", "dessert", false, "foto/es-krim-pelangi.png"],
  ["🥧", "Pie Buah", 35000, "#ffe48a", "dessert", false, "foto/pie-buah.png"],
  ["☕", "Kopi Susu", 18000, "#ffcfa8", "drink", false, "foto/kopi-susu.png"],
  ["🧋", "Boba Milk Tea", 20000, "#d9ccff", "drink", true, "foto/boba-milk-tea.png"],
  ["🍓", "Strawberry Smoothie", 22000, "#ffd6e7", "drink", false, "foto/strawberry-smoothie.png"],
  ["🍵", "Matcha Latte", 22000, "#b8f0d8", "drink", true, "foto/matcha-latte.png"],
  ["🥤", "Es Teh Lemon", 10000, "#ffe48a", "drink", false, "foto/es-teh-lemon.png"],
  ["🍫", "Cokelat Hangat", 18000, "#ffcfa8", "drink", false, "foto/cokelat-hangat.png"]
];

// Isi keranjang: { nomorMenu: jumlah }
var cart = {};

// Perangkat punya mouse? (kursor foto hanya dipasang di komputer)
var adaMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// ===== Fungsi bantu =====
function $(id) {
  return document.getElementById(id);
}

function rp(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

// Mencegah teks pembeli merusak HTML
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

// ===== Menampilkan kartu menu (tab: dessert / minuman / terlaris, atau hasil pencarian) =====
var tab = "dessert";

function setTab(t) {
  tab = t;
  $("q").value = "";
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.classList.toggle("on", b.dataset.t === t);
  });
  renderGrid("");
}

function renderGrid(q) {
  var html = P.map(function (p, i) {
    var cocok = q ? p[1].toLowerCase().indexOf(q) > -1 : (tab === "best" ? p[5] : p[4] === tab);
    if (!cocok) return "";
    return (
      '<div class="card">' +
        (p[5] ? '<span class="star">⭐ Terlaris</span>' : "") +
        '<div class="em" style="background:' + p[3] + '">' + p[0] +
          '<img src="' + p[6] + '" alt="' + p[1] + '" onerror="this.remove()"></div>' +
        "<h3>" + p[1] + "</h3>" +
        '<div class="price">' + rp(p[2]) + "</div>" +
        '<button class="btn" onclick="add(' + i + ',1)">+ Keranjang</button>' +
      "</div>"
    );
  }).join("");

  $("grid").innerHTML = html || '<div class="empty">Menu tidak ditemukan 🍰</div>';
}

function search() {
  renderGrid($("q").value.trim().toLowerCase());
  goSection("menu");
}

// ===== Navigasi: pindah bagian & garis merah yang ikut bergeser =====
var URUTAN = ["beranda", "menu", "promo", "testi", "contact"];
var navAktif = "";
var kunci = false;   // dikunci saat halaman sedang digulir otomatis (klik navigasi)
var timerKunci;

function isHP() {
  return window.matchMedia("(max-width: 860px)").matches;
}

function setNav(id, paksa) {
  if (id === navAktif && !paksa) return;
  navAktif = id;

  var aktif = null;
  document.querySelectorAll(".links [data-s]").forEach(function (b) {
    var on = b.dataset.s === id;
    b.classList.toggle("on", on);
    if (on) aktif = b;
  });
  if (!aktif) return;

  // Garis merah meluncur ke bawah tautan yang aktif
  var garis = $("slider");
  garis.style.width = aktif.offsetWidth + "px";
  garis.style.transform = "translateX(" + aktif.offsetLeft + "px)";

  // Di HP daftar navigasi bisa digeser: bawa tautan aktif ke tengah
  var daftar = $("links");
  daftar.scrollTo({
    left: aktif.offsetLeft - (daftar.clientWidth - aktif.offsetWidth) / 2,
    behavior: "smooth"
  });
}

function bukaKunci() {
  clearTimeout(timerKunci);
  timerKunci = setTimeout(function () {
    kunci = false;
    cekBagian();
  }, 200);
}

// Cek bagian mana yang sedang tampil, lalu geser garis merahnya
function cekBagian() {
  if (kunci) { bukaKunci(); return; }

  var acuan = document.querySelector("header").getBoundingClientRect().bottom + 80;
  var aktif = URUTAN[0];
  URUTAN.forEach(function (id) {
    var el = $(id);
    if (el && el.getBoundingClientRect().top <= acuan) aktif = id;
  });

  // Mentok di paling bawah: anggap bagian terakhir (kontak) yang aktif
  var h = $("home");
  var mentok = isHP()
    ? window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    : h.scrollTop + h.clientHeight >= h.scrollHeight - 4;
  if (mentok) aktif = "contact";

  setNav(aktif);
  document.body.classList.toggle("in-menu", aktif === "menu");
}

// Klik navigasi: garis langsung pindah, halaman menggulir halus ke bagiannya
function goSection(id) {
  kunci = true;
  bukaKunci();
  setNav(id);
  $(id).scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== Pop-up (data pengiriman & terima kasih) =====
function openModal(id) {
  closeModal();
  $(id).classList.add("open");
}

function closeModal() {
  document.querySelectorAll(".modal").forEach(function (m) {
    m.classList.remove("open");
  });
}

// ===== Keranjang =====
function add(i, d) {
  cart[i] = (cart[i] || 0) + d;
  if (d > 0) {
    hop();
  }
  if (cart[i] <= 0) delete cart[i];
  draw();
}

function total() {
  return Object.keys(cart).reduce(function (sum, i) {
    return sum + P[i][2] * cart[i];
  }, 0);
}

function draw() {
  var k = Object.keys(cart);

  // Jumlah barang di ikon keranjang
  $("cnt").textContent = k.reduce(function (sum, i) {
    return sum + cart[i];
  }, 0);

  // Ucapan si kucing
  $("cmsg").textContent = k.length
    ? "Yey! ada " + $("cnt").textContent + " item "
    : "Meong~ keranjangnya masih kosong";

  // Daftar di panel keranjang (halaman menu)
  $("items").innerHTML = k.length
    ? k.map(function (i) {
        return (
          '<div class="row">' +
            "<span>" + P[i][0] + " " + P[i][1] + "</span>" +
            '<button class="q" onclick="add(' + i + ',-1)">−</button>' +
            "<b>" + cart[i] + "</b>" +
            '<button class="q" onclick="add(' + i + ',1)">+</button>' +
          "</div>"
        );
      }).join("")
    : '<div class="empty">Keranjang masih kosong 🧺</div>';

  // Ringkasan di halaman data pengiriman
  $("sumItems").innerHTML =
    k.map(function (i) {
      return (
        '<div class="row"><span>' + P[i][0] + " " + P[i][1] + "</span>" +
        "<b>×" + cart[i] + "</b></div>"
      );
    }).join("") || '<div class="empty">Belum ada pesanan</div>';

  $("tot").textContent = $("tot2").textContent = rp(total());

  // Bar keranjang melayang (khusus HP)
  var n = Number($("cnt").textContent);
  $("cbCnt").textContent = n;
  $("cbTot").textContent = rp(total());
  $("cartbar").classList.toggle("has", n > 0);
}

// Ke halaman form hanya jika keranjang sudah ada isinya
function goCart() {
  // Keranjang kosong: bawa ke menu supaya mulai memilih
  if (!Object.keys(cart).length) {
    goSection(isHP() ? "keranjang" : "menu");
    hop();
    return;
  }
  openModal("checkout");
}

// ===== Form pengiriman =====
// Kolom surat hanya muncul kalau pilih "Ya, pakai surat"
document.querySelectorAll("input[name=kirim]").forEach(function (r) {
  r.addEventListener("change", function () {
    var ya = document.querySelector("input[name=kirim]:checked").value === "ya";
    $("surat").style.display = ya ? "grid" : "none";
  });
});

$("f").addEventListener("submit", function (e) {
  e.preventDefault();

  var ya = document.querySelector("input[name=kirim]:checked").value === "ya";

  $("tMsg").innerHTML =
    "Terima kasih, " + esc($("nama").value) +
    "! Pesananmu dikirim ke " + esc($("alamat").value) + " 🚚";

  // Surat hanya ditampilkan kalau dipilih dan isinya tidak kosong
  $("tLetter").innerHTML =
    ya && $("isi").value.trim()
      ? '<div class="note">💌 Untuk ' + esc($("penerima").value || "penerima") +
        ":\n\n" + esc($("isi").value) + "</div>"
      : "";

  cart = {};
  $("f").reset();
  draw();
  $("surat").style.display = "none";
  openModal("thanks");
});

// ===== Kursor foto =====
// Taruh fotomu di folder "foto" dengan nama di bawah ini. Kalau namanya beda, ganti di sini
// (contoh: "foto/kucingku.png"). Kalau filenya tidak ada, kursor tetap biasa.
var FOTO_KURSOR = "foto/kursor.png";

var cur = $("cur");
var pic = $("pic");
var sudahGerak = false;
var fotoBawaanAda = false;

// Pasang foto sebagai kursor
function pasangKursor(src) {
  cur.style.backgroundImage = "url('" + src + "')";
  cur.style.display = "block";
  cur.style.opacity = sudahGerak ? 1 : 0;  // baru tampil setelah mouse digerakkan
  document.body.classList.add("pc");
}

// Kembali ke kursor biasa
function lepasKursor() {
  cur.style.display = "none";
  document.body.classList.remove("pc");
}

document.addEventListener("mousemove", function (e) {
  cur.style.left = e.clientX + "px";
  cur.style.top = e.clientY + "px";
  if (!sudahGerak) {
    sudahGerak = true;
    cur.style.opacity = 1;
  }
});

// Otomatis: saat halaman dibuka, foto bawaan langsung jadi kursor
if (adaMouse) {
  var tes = new Image();
  tes.onload = function () {
    fotoBawaanAda = true;
    pasangKursor(FOTO_KURSOR);
  };
  tes.src = FOTO_KURSOR;  // kalau file tidak ada, tidak terjadi apa-apa
}

// Tombol 📷: ganti dengan foto lain (sementara, hilang saat halaman di-refresh)
pic.addEventListener("change", function () {
  var f = pic.files[0];
  if (!f) return;

  var r = new FileReader();
  r.onload = function () {
    pasangKursor(r.result);
    $("resetCur").classList.remove("hide");
  };
  r.readAsDataURL(f);
});

// Tombol ✖: kembali ke foto bawaan (atau kursor biasa kalau foto bawaan tidak ada)
function resetCur() {
  pic.value = "";
  $("resetCur").classList.add("hide");
  if (fotoBawaanAda) pasangKursor(FOTO_KURSOR);
  else lepasKursor();
}

// ===== Kucing di keranjang =====
var kucing = $("kucing");

// Melompat setiap kali ada dessert/minuman masuk
function hop() {
  kucing.classList.remove("hop");
  void kucing.offsetWidth; // paksa animasi mulai ulang
  kucing.classList.add("hop");
}

// Saat dipencet: melompat kecil dan tersenyum selama ditekan
["mousedown", "touchstart"].forEach(function (ev) {
  kucing.addEventListener(ev, function () {
    kucing.classList.add("happy");
    hop();
  });
});
["mouseup", "mouseleave", "touchend"].forEach(function (ev) {
  kucing.addEventListener(ev, function () { kucing.classList.remove("happy"); });
});

// ===== Animasi muncul saat di-scroll =====
function initReveal() {
  var els = document.querySelectorAll(".reveal");

  // Browser lama: langsung tampilkan semuanya
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("show"); });
    return;
  }

  var io = new IntersectionObserver(function (list) {
    list.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("show");
        io.unobserve(en.target);
      }
    });
  }, { root: isHP() ? null : $("home"), threshold: 0.2 });

  els.forEach(function (e) { io.observe(e); });
}

// ===== Tombol "info lainnya" di beranda =====
function infoCara() {
  alert(
    "Cara pesan:\n" +
    "1. Pilih dessert di menu\n" +
    "2. Isi nama & alamat\n" +
    "3. Kirim, mau pakai surat atau tidak!"
  );
}

// ===== Jalankan saat halaman dibuka =====
renderGrid("");
draw();
initReveal();

// ===== Garis navigasi mengikuti scroll =====
$("home").addEventListener("scroll", cekBagian, { passive: true });  // komputer
window.addEventListener("scroll", cekBagian, { passive: true });     // HP
window.addEventListener("resize", function () { setNav(navAktif, true); cekBagian(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
cekBagian();

// Tahun di footer otomatis
$("thn").textContent = new Date().getFullYear();

// ===== FAQ: hanya satu jawaban yang terbuka =====
document.querySelectorAll(".faq-item").forEach(function (d) {
  d.addEventListener("toggle", function () {
    if (!d.open) return;
    document.querySelectorAll(".faq-item[open]").forEach(function (o) {
      if (o !== d) o.open = false;
    });
  });
});

// Jumlah menu di bagian "Tentang Toko Kami" mengikuti daftar menu
$("statMenu").textContent = P.length;