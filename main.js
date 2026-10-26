(function () {
  const page = document.body.dataset.page; // home | smart | accessories | computers | product
  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const money = n => n.toLocaleString("en-US") + " د.ع";
  const byId = id => PRODUCTS.find(
  p => String(p.id) === String(id)
);

  // ================= السلة =================
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("cart2") || "[]"); } catch (e) {}
  cart = cart.filter(i => byId(i.id));
  const saveCart = () => { try { localStorage.setItem("cart2", JSON.stringify(cart)); } catch (e) {} };
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

  function addToCart(id, color, qty = 1) {
    const item = cart.find(i => i.id === id && i.color === color);
    item ? item.qty += qty : cart.push({ id, color, qty });
    saveCart(); updateCartUI();
  }
  function changeQty(id, color, d) {
    const item = cart.find(i => i.id === id && i.color === color);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) cart = cart.filter(i => i !== item);
    saveCart(); updateCartUI();
  }
  function removeItem(id, color) {
    cart = cart.filter(i => !(i.id === id && i.color === color));
    saveCart(); updateCartUI();
  }

  // ================= التوصيل =================
  function deliveryFee(gov, sub) {
    if (!gov) return null;
    if (gov === STORE.homeGov) return sub > STORE.freeOver ? 0 : STORE.karbalaFee;
    return STORE.otherFee;
  }

  // ================= الترويسة + السلة + نموذج الطلب =================
  

function renderHeader() {
  const navLinks = Object.entries(CATEGORIES).map(([key, c]) =>
    `<a href="${c.file}" class="${page === key ? "active" : ""}">
      ${c.icon} ${c.title}
    </a>`
  ).join("");

  const govOptions = STORE.governorates.map(g =>
    `<option value="${g}">${g}</option>`
  ).join("");

  $("site-header").innerHTML = `

    <!-- شريط المعلومات العلوي -->
    <div class="topbar">
      <div class="topbar-in">
        <div class="topbar-benefits">
          <span>🚚 توصيل سريع لجميع المحافظات</span>
          <i></i>
          <span>🛡️ منتجات أصلية 100%</span>
          <i></i>
          <span>🎧 دعم فني وخدمة ما بعد البيع</span>
        </div>

        <a class="topbar-contact"
           href="https://wa.me/${STORE.phone}"
           target="_blank"
           rel="noopener">
          <span>للاستفسار عبر الواتساب</span>
          <b>${STORE.phone ? STORE.phone : "تواصل معنا"}</b>
          <span class="wa-icon">◉</span>
        </a>
      </div>
    </div>

    <!-- منطقة الشعار والبحث -->
    <header class="header">
      <div class="container header-in">

        <a href="index.html" class="logo">
          <span class="logo-ico">📱</span>
          <span class="logo-text">
            <b>كلمات المصطفى</b>
            <small>للاتصالات والتقنية</small>
          </span>
        </a>

        <div class="header-slogan">
          <span>كل ما تحتاجه</span>
          <b>في مكان واحد</b>
        </div>

        <form class="search" id="searchForm" role="search">
          <input
            type="search"
            id="searchInput"
            placeholder="ابحث عن أي منتج..."
            aria-label="ابحث عن منتج"
          >
          <button type="submit" aria-label="بحث">⌕</button>
        </form>

        <button class="cart-btn" id="cartBtn" aria-label="السلة">
          <span class="cart-symbol">🛒</span>
          <span class="cart-label">السلة</span>
          <span class="cart-count" id="cartCount">0</span>
        </button>

      </div>
    </header>

    <!-- القائمة الرئيسية -->
    <nav class="nav">
      <div class="container nav-in">
        <a href="index.html"
           class="${page === "home" ? "active" : ""}">
          <span>⌂</span> الرئيسية
        </a>
        ${navLinks}
        
      </div>
    </nav>

    <!-- سلة التسوق -->
    <div class="overlay" id="overlay"></div>

    <aside class="cart-drawer" id="cartDrawer">
      <div class="cart-head">
        <h3>🛒 سلة التسوق</h3>
        <button id="closeCart">✕</button>
      </div>

      <div class="cart-items" id="cartItems"></div>

      <div class="cart-foot">
        <div class="total">
          <span>مجموع المنتجات</span>
          <b id="cartTotal">0 د.ع</b>
        </div>
        <button class="btn-primary full" id="checkoutBtn">
          ✅ إتمام الطلب
        </button>
      </div>
    </aside>

    <!-- نافذة إتمام الطلب -->
    <div class="modal" id="checkoutModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>📝 إتمام الطلب</h3>
          <button id="closeCheckout">✕</button>
        </div>

        <form id="orderForm" novalidate>
          <label>
            الاسم الكامل
            <input id="fName" type="text" placeholder="مثال: أحمد علي">
          </label>

          <label>
            رقم الهاتف
            <input id="fPhone" type="tel" inputmode="tel"
                   placeholder="07xxxxxxxxx">
          </label>

          <label>
            المحافظة
            <select id="fGov">
              <option value="">اختر المحافظة</option>
              ${govOptions}
            </select>
          </label>

          <label>
            أقرب نقطة دالة
            <input id="fLandmark" type="text"
                   placeholder="مثال: قرب مدرسة أو مطعم">
          </label>

          <label>
            ملاحظات (اختياري)
            <textarea id="fNote" rows="2"></textarea>
          </label>

          <div class="summary">
            <div class="sum-row">
              <span>مجموع المنتجات</span>
              <b id="sumSub">0</b>
            </div>
            <div class="sum-row">
              <span>أجور التوصيل</span>
              <b id="sumFee">اختر المحافظة</b>
            </div>
            <div class="hint" id="feeHint"></div>
            <div class="sum-row big">
              <span>المبلغ الإجمالي</span>
              <b id="sumTotal">0</b>
            </div>
          </div>

          <div class="form-err" id="formErr"></div>

          <button type="submit" class="btn-primary full">
            📲 إرسال الطلب عبر واتساب
          </button>
        </form>
      </div>
    </div>
  `;

  $("cartBtn").onclick = openCart;
  $("closeCart").onclick = closeCart;
  $("overlay").onclick = closeCart;
  $("checkoutBtn").onclick = openCheckout;
  $("closeCheckout").onclick = closeCheckout;

  $("checkoutModal").addEventListener("click", e => {
    if (e.target.id === "checkoutModal") closeCheckout();
  });

  $("fGov").addEventListener("change", updateSummary);
  $("orderForm").addEventListener("submit", submitOrder);

  // البحث يعمل مع الفلترة الحالية، ويدعم البحث من الصفحات الأخرى
  $("searchForm").addEventListener("submit", e => {
    e.preventDefault();

    const q = $("searchInput").value.trim();

    if (page === "home" && grid) {
      applyFilters();
    } else {
      location.href = "index.html?q=" + encodeURIComponent(q);
    }
  });
}


  const openCart = () => { $("cartDrawer").classList.add("open"); $("overlay").classList.add("show"); };
  const closeCart = () => { $("cartDrawer").classList.remove("open"); $("overlay").classList.remove("show"); };
  function openCheckout() {
    if (!cart.length) return;
    closeCart(); updateSummary();
    $("checkoutModal").classList.add("show");
  }
  const closeCheckout = () => $("checkoutModal").classList.remove("show");

  function updateCartUI() {
    $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
    $("cartItems").innerHTML = cart.length ? cart.map(i => {
      const p = byId(i.id);
      const d = `data-id="${p.id}" data-color="${i.color}"`;
      return `<div class="cart-item">
        <img class="ci-img" src="${p.images[0]}" alt="" onerror="imgFail(this,'${p.emoji}')">
        <div class="ci-info">
          <b>${p.name}</b>
          <small class="ci-color">اللون: ${i.color}</small>
          <small class="ci-price">${money(p.price * i.qty)}</small>
        </div>
        <div class="ci-actions">
          <div class="qty">
            <button data-act="inc" ${d}>+</button><span>${i.qty}</span><button data-act="dec" ${d}>−</button>
          </div>
          <button class="ci-del" data-act="del" ${d} title="حذف">🗑️ حذف</button>
        </div>
      </div>`;
    }).join("") : `<p class="empty">السلة فارغة 🛒</p>`;
    $("cartTotal").textContent = money(subtotal());
    $("checkoutBtn").disabled = !cart.length;
    updateSummary();
  }

  function updateSummary() {
    const sub = subtotal(), gov = $("fGov").value, fee = deliveryFee(gov, sub);
    $("sumSub").textContent = money(sub);
    $("sumFee").textContent = fee === null ? "اختر المحافظة" : fee === 0 ? "مجاني 🎉" : money(fee);
    $("sumTotal").textContent = money(sub + (fee || 0));
    $("feeHint").textContent = gov === STORE.homeGov && fee > 0
      ? `التوصيل مجاني داخل ${STORE.homeGov} للطلبات أكثر من ${money(STORE.freeOver)}` : "";
  }

  // ================= إرسال الطلب إلى واتساب =================
  function submitOrder(e) {
    e.preventDefault();
    const name = $("fName").value.trim();
    const phone = $("fPhone").value.replace(/\s+/g, "");
    const gov = $("fGov").value;
    const landmark = $("fLandmark").value.trim();
    const note = $("fNote").value.trim();
    const err = $("formErr");

    if (name.length < 3) return err.textContent = "الرجاء كتابة الاسم الكامل";
    if (!/^07\d{9}$/.test(phone)) return err.textContent = "رقم الهاتف غير صحيح (مثال: 07701234567)";
    if (!gov) return err.textContent = "الرجاء اختيار المحافظة";
    if (landmark.length < 3) return err.textContent = "الرجاء كتابة أقرب نقطة دالة";
    err.textContent = "";

    const sub = subtotal(), fee = deliveryFee(gov, sub), total = sub + fee;
    const line = "━━━━━━━━━━━━━━━";
    let t = `🛍️ *طلب جديد - ${STORE.name}*\n${line}\n`;
    t += `👤 *الاسم:* ${name}\n📞 *الهاتف:* ${phone}\n📍 *المحافظة:* ${gov}\n🧭 *أقرب نقطة دالة:* ${landmark}\n`;
    if (note) t += `📝 *ملاحظات:* ${note}\n`;
    t += `${line}\n🛒 *تفاصيل الطلب:*\n\n`;
    cart.forEach((i, k) => {
      const p = byId(i.id);
      t += `*${k + 1}.* ${p.name}\n   🎨 اللون: ${i.color}\n   🔢 الكمية: ${i.qty} × ${money(p.price)}\n   💵 ${money(p.price * i.qty)}\n\n`;
    });
    t += `${line}\n💰 مجموع المنتجات: ${money(sub)}\n🚚 أجور التوصيل: ${fee === 0 ? "مجاني 🎉" : money(fee)}\n`;
    t += `✅ *المبلغ الإجمالي: ${money(total)}*\n${line}\n🙏 شكراً لثقتكم بنا`;

    window.open(`https://wa.me/${STORE.phone}?text=${encodeURIComponent(t)}`, "_blank");
    cart = []; saveCart(); updateCartUI(); closeCheckout();
    $("orderForm").reset();
  }

  // ================= بطاقة المنتج =================
  const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  function productCard(p) {
    const link = `product.html?id=${p.id}`;
    const dots = p.colors.slice(0, 5).map(c => `<i style="background:${c.hex}" title="${c.name}"></i>`).join("");
    return `<article class="card">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <a href="${link}" class="card-img">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="imgFail(this,'${p.emoji}')">
      </a>
      <div class="card-body">
        <small class="card-cat">${CATEGORIES[p.cat].title}</small>
        <h4><a href="${link}">${p.name}</a></h4>
        <p class="card-desc">${p.desc}</p>
        <div class="dots">${dots}</div>
        <div class="rating"><span class="stars">${stars(p.rating)}</span> (${p.rating})</div>
        <div class="card-foot">
          <div class="price">${money(p.price)}</div>
          <button class="icon-add add-btn" data-id="${p.id}" title="أضف للسلة">🛒</button>
        </div>
        <a class="btn-outline" href="${link}">عرض التفاصيل</a>
      </div>
    </article>`;
  }

  // ================= القوائم والفلترة =================
  let activeFilter = "all";
  let activeBrand = "all";

  const BRANDS = [
  { id: "apple", name: "Apple", logo: "https://cdn.simpleicons.org/apple" },
  { id: "samsung", name: "Samsung", logo: "https://cdn.simpleicons.org/samsung" },
  { id: "redmi", name: "Redmi", logo: "https://cdn.simpleicons.org/xiaomi" },
  { id: "tecno", name: "Tecno", logo: "https://cdn.simpleicons.org/tecno" },
  { id: "xiaomi", name: "Xiaomi", logo: "https://cdn.simpleicons.org/xiaomi" },
  { id: "honor", name: "Honor", logo: "https://cdn.simpleicons.org/honor" },
  { id: "zte", name: "ZTE", logo: "https://cdn.simpleicons.org/zte" },
  { id: "redmagic", name: "RedMagic", logo: "https://cdn.simpleicons.org/redmagic" },
  { id: "huawei", name: "Huawei", logo: "https://cdn.simpleicons.org/huawei" },
  { id: "nubia", name: "Nubia", logo: "https://cdn.simpleicons.org/nubia" }
];
  const grid = $("productsGrid");

  function baseList() {
    if (page === "home") return PRODUCTS.filter(p => p.latest);
    return PRODUCTS.filter(p => p.cat === page);
  }
  
function getProductBrand(p) {
  if (p.brand) return String(p.brand).trim().toLowerCase();

  const name = String(p.name || "").toLowerCase();

  const brands = [
    ["apple", ["apple", "iphone", "ipad", "airpods", "آيفون", "ايفون", "آيباد"]],
    ["samsung", ["samsung", "galaxy", "سامسونج", "جالكسي"]],
    ["redmi", ["redmi", "ريدمي"]],
    ["tecno", ["tecno", "تكنو"]],
    ["xiaomi", ["xiaomi", "شاومي"]],
    ["honor", ["honor", "هونر"]],
    ["zte", ["zte", "زد تي إي"]],
    ["redmagic", ["redmagic", "red magic", "ريد ماجيك"]],
    ["huawei", ["huawei", "هواوي"]],
    ["nubia", ["nubia", "نوبيا"]]
  ];

  const match = brands.find(([brand, keywords]) =>
    keywords.some(word => name.includes(word))
  );

  return match ? match[0] : "";
}

function applyFilters() {
  if (!grid) return;

  const q = ($("searchInput")?.value || "").trim().toLowerCase();

  let list = q
    ? (page === "home" ? PRODUCTS : baseList()).filter(p =>
        String(p.name || "").toLowerCase().includes(q)
      )
    : baseList();

  if (page !== "home" && activeFilter !== "all") {
    list = list.filter(p => p.sub === activeFilter);
  }

  if (activeBrand !== "all") {
    list = list.filter(p =>
      getProductBrand(p) === activeBrand.toLowerCase()
    );
  }

  grid.innerHTML = list.length
    ? list.map(productCard).join("")
    : `<p class="empty">لا توجد منتجات لهذه الماركة ضمن النتائج الحالية.</p>`;
}

  
function renderCategoryPage() {
  const c = CATEGORIES[page];
  const title = $("pageTitle");
  const desc = $("pageDesc");
  const box = $("filters");

  if (!c || !title || !desc || !box || !grid) {
    console.error("تعذر تحميل القسم:", page, {
      category: c,
      pageTitle: title,
      pageDesc: desc,
      filters: box,
      productsGrid: grid
    });
    return;
  }

  title.textContent = c.icon + " " + c.title;
  desc.textContent = c.desc;

  const all = [
    { key: "all", label: "الكل", icon: "✨" },
    ...c.filters
  ];

  box.innerHTML = all.map(f => `
    <button
      class="filter-btn ${f.key === "all" ? "active" : ""}"
      data-key="${f.key}">
      <span class="f-ico">${f.icon}</span>
      <span>${f.label}</span>
    </button>
  `).join("");

  box.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    activeFilter = btn.dataset.key;

    box.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.toggle("active", b === btn);
    });

    applyFilters();
  });
}


  function renderHomeCards() {
    $("catCards").innerHTML = Object.values(CATEGORIES).map(c => `
      <a href="${c.file}" class="cat-card">
        <div class="cc-text"><h3>${c.title}</h3><p>${c.desc}</p></div>
        <div class="cc-ico">${c.icon}</div>
        <span class="cc-arrow">←</span>
      </a>`).join("");
  }

function renderHomeCategorySections() {
  const container = $("homeCategorySections");
  if (!container) return;

  const categoryOrder = ["smart", "accessories", "computers"];

  const html = categoryOrder.map(key => {
    const category = CATEGORIES[key];
    if (!category) return "";

    let products = PRODUCTS.filter(p => p.cat === key);

    if (activeBrand !== "all") {
      products = products.filter(p =>
        String(p.brand || "").trim().toLowerCase() ===
        String(activeBrand || "").trim().toLowerCase()
      );
    }

    products = products.slice(0, 3);

    return `
      <section class="home-section home-category-section">
        <div class="section-head">
          <div>
            <span class="section-kicker">تسوق حسب القسم</span>
            <h2>${category.icon} ${category.title}</h2>
            <p>${category.desc}</p>
          </div>

          <a class="home-more-btn" href="${category.file}">
            <span>عرض المزيد</span>
            <span class="home-more-arrow">←</span>
          </a>
        </div>

        <div class="products-grid">
          ${
            products.length
              ? products.map(productCard).join("")
              : '<p class="empty">لا توجد منتجات لهذه الماركة في هذا القسم.</p>'
          }
        </div>
      </section>
    `;
  }).join("");

  container.innerHTML = html;
}

  
function setupBrandFilter() {
  const track = $("brandsTrack");
  const showAll = $("showAllBrands");

  if (track) {
  track.innerHTML = BRANDS.map(brand => `
    <button
      type="button"
      class="brand-item"
      data-brand="${brand.id}"
      aria-label="${brand.name}"
    >
      <span class="brand-logo">
  <img
    src="${brand.logo}"
    alt="${brand.name}"
    loading="lazy"
    onerror="
      this.style.display='none';
      this.parentElement.classList.add('logo-fallback');
      this.parentElement.dataset.initial='${brand.name.charAt(0)}';
    "
  >
</span>
      <span class="brand-name">${brand.name}</span>
    </button>
  `).join("");
}

  if (!track || track.dataset.ready === "1") return;
  track.dataset.ready = "1";

  function selectBrand(brand) {
    activeBrand = String(brand || "all").trim().toLowerCase();

    track.querySelectorAll(".brand-item").forEach(btn => {
      const buttonBrand = String(btn.dataset.brand || "")
        .trim()
        .toLowerCase();

      btn.classList.toggle("active", buttonBrand === activeBrand);
    });

    if (page === "home") {
      renderHomeCategorySections();
    }

    applyFilters();

    const productsGrid = $("productsGrid");

    if (productsGrid) {
      productsGrid.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  track.addEventListener("click", e => {
    const btn = e.target.closest(".brand-item");
    if (!btn) return;

    selectBrand(btn.dataset.brand);
  });

  showAll?.addEventListener("click", () => {
    if ($("searchInput")) {
      $("searchInput").value = "";
    }

    selectBrand("all");
  });
}


  // ================= صفحة المنتج =================

function renderProductPage() {
  const id = params.get("id");
  const p = byId(id);
  const box = $("productView");

  if (!box) {
    console.error("لم يتم العثور على العنصر productView");
    return;
  }

  if (!p) {
    box.innerHTML = `
      <p class="empty">
        المنتج غير موجود.
        <a href="index.html">العودة للرئيسية</a>
      </p>`;
    console.error("لم يتم العثور على المنتج ذي الرقم:", id);
    return;
  }

  const c = CATEGORIES[p.cat];

  if (!c) {
    box.innerHTML = `<p class="empty">قسم المنتج غير موجود.</p>`;
    return;
  }

  document.title = `${p.name} | ${STORE.name}`;

  const images = Array.isArray(p.images) ? p.images : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const specs = p.specs || {};
  const firstImage = images[0] || "";

  let color = colors[0]?.name || "الافتراضي";
  let qty = 1;

  box.innerHTML = `
    <div class="crumbs">
      <a href="index.html">الرئيسية</a> ‹
      <a href="${c.file}">${c.title}</a> ‹
      <span>${p.name}</span>
    </div>

    <div class="pd">
      <div class="pd-gallery">
        <div class="pd-main">
          <img id="mainImg"
               src="${firstImage}"
               alt="${p.name}"
               onerror="imgFail(this,'${p.emoji || "📦"}')">
        </div>

        <div class="pd-thumbs">
          ${images.map((src, i) => `
            <button type="button"
                    class="thumb ${i === 0 ? "active" : ""}">
              <img src="${src}" alt="${p.name}"
                   onerror="imgFail(this,'${p.emoji || "📦"}')">
            </button>
          `).join("")}
        </div>
      </div>

      <div class="pd-info">
        <span class="pd-cat">${c.title}</span>
        <h1>${p.name}</h1>

        <div class="rating">
          <span class="stars">${stars(p.rating || 0)}</span>
          (${p.rating || 0})
        </div>

        <div class="pd-price">${money(Number(p.price) || 0)}</div>
        <p class="pd-desc">${p.desc || "لا يتوفر وصف إضافي حالياً."}</p>

        ${colors.length ? `
          <div class="pd-row">
            <b>اللون: <span id="colorName">${color}</span></b>
            <div class="swatches">
              ${colors.map((x, i) => `
                <button type="button"
                        class="swatch ${i === 0 ? "active" : ""}"
                        data-name="${x.name}"
                        title="${x.name}"
                        style="--c:${x.hex || "#cccccc"}">
                </button>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="pd-row">
          <b>الكمية</b>
          <div class="qty-box">
            <button type="button" id="qPlus">+</button>
            <span id="qVal">1</span>
            <button type="button" id="qMinus">−</button>
          </div>
        </div>

        <div class="pd-total">
          الإجمالي: <b id="pdTotal">${money(Number(p.price) || 0)}</b>
        </div>

        <div class="pd-actions">
          <button type="button" class="btn-primary" id="addBtn">
            🛒 أضف إلى السلة
          </button>
          <button type="button" class="btn-outline-big" id="buyBtn">
            ⚡ اطلب الآن
          </button>
        </div>

        <div class="pd-perks">
          <span>🛡️ منتج أصلي</span>
          <span>🚚 توصيل لجميع المحافظات</span>
        </div>
      </div>
    </div>

    <section class="specs">
      <h3>📋 مواصفات المنتج</h3>
      <table>
        ${Object.entries(specs).map(([k, v]) => `
          <tr><th>${k}</th><td>${v}</td></tr>
        `).join("") || `
          <tr><td colspan="2">لا توجد مواصفات مضافة لهذا المنتج.</td></tr>
        `}
      </table>
    </section>
  `;

  box.querySelectorAll(".thumb").forEach(btn => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      $("mainImg").src = img.src;

      box.querySelectorAll(".thumb").forEach(item => {
        item.classList.toggle("active", item === btn);
      });
    });
  });

  box.querySelectorAll(".swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      color = btn.dataset.name;
      $("colorName").textContent = color;

      box.querySelectorAll(".swatch").forEach(item => {
        item.classList.toggle("active", item === btn);
      });
    });
  });

  const setQty = n => {
    qty = Math.min(20, Math.max(1, n));
    $("qVal").textContent = qty;
    $("pdTotal").textContent = money((Number(p.price) || 0) * qty);
  };

  $("qPlus").onclick = () => setQty(qty + 1);
  $("qMinus").onclick = () => setQty(qty - 1);

  $("addBtn").onclick = () => {
    addToCart(p.id, color, qty);
    openCart();
  };

  $("buyBtn").onclick = () => {
    addToCart(p.id, color, qty);
    openCheckout();
  };

  const relatedGrid = $("relatedGrid");

  if (relatedGrid) {
    const related = PRODUCTS
      .filter(item =>
        item.cat === p.cat &&
        String(item.id) !== String(p.id)
      )
      .slice(0, 4);

    relatedGrid.innerHTML = related.length
      ? related.map(productCard).join("")
      : `<p class="empty">لا توجد منتجات مشابهة حالياً.</p>`;
  }
}

  
/* =====================================
   تشغيل بانر العروض المتحرك
   ===================================== */

function setupPromoSlider() {
  const slider = document.getElementById("promoSlider");

  if (!slider || slider.dataset.ready === "1") return;

  const savedBanners = Array.isArray(window.STORE_BANNERS)
  ? window.STORE_BANNERS.filter(banner => {
      if (!banner || (!banner.image && !banner.title)) {
        return false;
      }

      const category = banner.category || banner.cat || "all";

      return category === "all" || category === "home";
    })
  : [];

  // إذا توجد بنرات محفوظة، اعرضها بدلاً من البنرات التجريبية
  if (savedBanners.length) {
    const firstSlide = slider.querySelector(".promo-slide");

    if (!firstSlide) return;

    const slidesHTML = savedBanners.map((banner, index) => {
      const title = escapeReelText(banner.title || "اكتشف عروضنا");
      const description = escapeReelText(
        banner.description || banner.desc || "اكتشف أحدث منتجاتنا"
      );
      const image = escapeReelText(banner.image || "");
      const link = escapeReelText(
        banner.link && banner.link.trim()
          ? banner.link.trim()
          : "#categories"
      );

      return `
        <article class="promo-slide ${index === 0 ? "active" : ""}"
                 aria-hidden="${index !== 0}">

<a href="${link}" class="promo-image-link" aria-label="${title}">
  <img
    class="promo-full-image"
    src="${image}"
    alt="${title}"
  >
</a>
        </article>
      `;
    }).join("");

    const dotsHTML = savedBanners.map((banner, index) => `
      <button type="button"
              class="promo-dot ${index === 0 ? "active" : ""}"
              aria-label="العرض ${index + 1}"
              aria-current="${index === 0 ? "true" : "false"}">
      </button>
    `).join("");

    slider.querySelectorAll(".promo-slide").forEach(el => el.remove());
    slider.querySelectorAll(".promo-dot").forEach(el => el.remove());

    slider.insertAdjacentHTML(
      "afterbegin",
      slidesHTML
    );

    const dotsBox = slider.querySelector(".promo-dots");

    if (dotsBox) {
      dotsBox.innerHTML = dotsHTML;
    }
  }

  slider.dataset.ready = "1";

  const slides = [...slider.querySelectorAll(".promo-slide")];
  const dots = [...slider.querySelectorAll(".promo-dot")];
  const prev = slider.querySelector(".promo-prev");
  const next = slider.querySelector(".promo-next");
  const progress = document.getElementById("promoProgress");

  if (!slides.length) return;

  const delay = 5500;
  let current = 0;
  let timer = null;
  let paused = false;

  function resetProgress() {
    if (!progress) return;

    progress.style.transition = "none";
    progress.style.width = "0%";

    void progress.offsetWidth;

    if (!paused) {
      progress.style.transition = `width ${delay}ms linear`;
      progress.style.width = "100%";
    }
  }

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });

    resetProgress();
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
  }

  function startAuto() {
    stopAuto();

    if (paused || document.hidden || slides.length < 2) return;

    resetProgress();

    timer = setInterval(() => {
      showSlide(current + 1);
    }, delay);
  }

  function goTo(index) {
    showSlide(index);
    startAuto();
  }

  prev?.addEventListener("click", () => goTo(current - 1));
  next?.addEventListener("click", () => goTo(current + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  slider.addEventListener("mouseenter", () => {
    paused = true;
    stopAuto();
  });

  slider.addEventListener("mouseleave", () => {
    paused = false;
    startAuto();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
    }
  });

  showSlide(0);
  startAuto();
}

/* =========================================
   بانرات الأقسام - 5 عروض لكل قسم
   ========================================= */

function setupCategoryPromo() {
  const slider = document.getElementById("categoryPromo");

  if (!slider || slider.dataset.ready === "1") return;

  const category = slider.dataset.category;

  const promoData = {
    smart: [
      {
        kicker: "SMARTPHONES COLLECTION",
        title: "اكتشف عالم الهواتف الذكية",
        desc: "تعرّف على الهواتف التي تجمع بين الأداء والتصميم العصري.",
        button: "تسوّق الهواتف",
        emoji: "📱"
      },
      {
        kicker: "YOUR NEXT PHONE",
        title: "هاتفك القادم بانتظارك",
        desc: "قارن بين الأجهزة واختر الهاتف الذي يناسب احتياجاتك.",
        button: "اكتشف الأجهزة",
        emoji: "📲"
      },
      {
        kicker: "SMART WATCHES",
        title: "تقنية ذكية في معصمك",
        desc: "اكتشف الساعات الذكية لمتابعة يومك بأسلوب عصري.",
        button: "اكتشف المنتجات",
        emoji: "⌚"
      },
      {
        kicker: "TABLETS COLLECTION",
        title: "إنجازات أكبر بشاشة أكبر",
        desc: "تعرّف على الأجهزة اللوحية للدراسة والعمل والترفيه.",
        button: "تسوّق الآن",
        emoji: "📟"
      },
      {
        kicker: "CHOOSE YOUR TECHNOLOGY",
        title: "التقنية المناسبة لك",
        desc: "استكشف مجموعة الأجهزة الذكية في متجر كلمات المصطفى.",
        button: "عرض المنتجات",
        emoji: "✨"
      }
    ],

    accessories: [
      {
        kicker: "ACCESSORIES FOR YOU",
        title: "إكسسوارات تكمل تجربتك",
        desc: "اكتشف ملحقاتك اليومية في مكان واحد.",
        button: "تسوّق الإكسسوارات",
        emoji: "🎧"
      },
      {
        kicker: "WIRELESS AUDIO",
        title: "عِش تفاصيل الصوت",
        desc: "تعرّف على خيارات السماعات للاستماع والمكالمات.",
        button: "اكتشف السماعات",
        emoji: "🎵"
      },
      {
        kicker: "CHARGING ESSENTIALS",
        title: "طاقة ترافق يومك",
        desc: "تعرّف على الشواحن وملحقات الطاقة المتوفرة.",
        button: "اكتشف الشواحن",
        emoji: "🔌"
      },
      {
        kicker: "PROTECT YOUR PHONE",
        title: "حماية وأناقة لهاتفك",
        desc: "اكتشف الحافظات التي تناسب جهازك وذوقك.",
        button: "عرض الإكسسوارات",
        emoji: "📱"
      },
      {
        kicker: "DAILY TECH ESSENTIALS",
        title: "تفاصيل صغيرة تصنع الفرق",
        desc: "اختر الإكسسوارات المناسبة لاستخدامك اليومي.",
        button: "تسوّق الآن",
        emoji: "⚡"
      }
    ],

    computers: [
      {
        kicker: "LAPTOP COLLECTION",
        title: "أنجز المزيد مع حاسوبك",
        desc: "استكشف الحاسبات المناسبة للدراسة والعمل والاستخدام اليومي.",
        button: "تسوّق اللابتوبات",
        emoji: "💻"
      },
      {
        kicker: "DESIGNED FOR WORK",
        title: "مساحة أكبر لإبداعك",
        desc: "تعرّف على شاشات الكمبيوتر وتجهيزات العمل.",
        button: "اكتشف الشاشات",
        emoji: "🖥️"
      },
      {
        kicker: "PC BUILDING",
        title: "ابنِ تجربة الكمبيوتر الخاصة بك",
        desc: "استكشف مكونات وتجميعات الكمبيوتر حسب احتياجاتك.",
        button: "اكتشف التجميعات",
        emoji: "🧩"
      },
      {
        kicker: "STORAGE SOLUTIONS",
        title: "مساحة لملفاتك ومشاريعك",
        desc: "تعرّف على خيارات التخزين لأجهزتك وملفاتك.",
        button: "اكتشف التخزين",
        emoji: "💾"
      },
      {
        kicker: "UPGRADE YOUR WORLD",
        title: "ارتقِ بتجربتك التقنية",
        desc: "استكشف منتجات الحاسبات والتقنية في متجرنا.",
        button: "عرض المنتجات",
        emoji: "🚀"
      }
    ]
  };

  
  const savedBanners = Array.isArray(window.STORE_BANNERS)
  ? window.STORE_BANNERS.filter(banner => {
      if (!banner || (!banner.image && !banner.title)) {
        return false;
      }

      const bannerCategory = banner.category || banner.cat || "all";

      return bannerCategory === "all" ||
             bannerCategory === category;
    })
  : [];

const savedSlides = savedBanners
  .filter(banner => banner.image || banner.title)
  .map(banner => ({
    kicker: "عروض كلمات المصطفى",
    title: banner.title || "اكتشف عروضنا",
    desc: banner.description || banner.desc || "اكتشف أحدث منتجاتنا",
    button: "اكتشف العرض",
    emoji: "✨",
    image: typeof banner.image === "string" ? banner.image : "",
    link: typeof banner.link === "string" && banner.link.trim()
      ? banner.link.trim()
      : "#productsGrid"
  }));

const slidesData = savedSlides.length
  ? savedSlides
  : (promoData[category] || []);

if (!slidesData.length) return;

  slider.dataset.ready = "1";

  const slidesContainer = slider.querySelector(".category-promo-slides");
  const dotsContainer = slider.querySelector(".category-promo-dots");
  const counter = slider.querySelector(".category-promo-count");
  const prevButton = slider.querySelector(".category-promo-arrow.prev");
  const nextButton = slider.querySelector(".category-promo-arrow.next");

  if (!slidesContainer || !dotsContainer) return;

  /*
    زر البانر ينقل الزبون إلى شبكة المنتجات
    الموجودة في الصفحة نفسها.
  */
  slidesContainer.innerHTML = slidesData.map((item, index) => `
    <article class="category-promo-slide theme-${index + 1}
                    ${index === 0 ? "active" : ""}"
             aria-hidden="${index !== 0}">
      <div class="category-promo-copy">
        <span class="category-promo-kicker">${item.kicker}</span>
        <h2>${item.title}</h2>
        <p>${item.desc}</p>
      <a
  class="category-promo-btn"
  href="${escapeReelText(item.link || '#productsGrid')}"
>
  ${item.button}
  <span aria-hidden="true">←</span>
</a>
      </div>

      <div class="category-promo-art" aria-hidden="true">
  ${
    item.image
      ? `<img
          src="${escapeReelText(item.image)}"
          alt=""
          loading="lazy"
          style="width:100%;height:100%;object-fit:contain;"
        >`
      : `<span class="category-promo-emoji">${item.emoji}</span>`
  }
</div>
    </article>
  `).join("");

  dotsContainer.innerHTML = slidesData.map((item, index) => `
    <button
      type="button"
      class="category-promo-dot ${index === 0 ? "active" : ""}"
      data-index="${index}"
      aria-label="الانتقال إلى العرض ${index + 1}"
      aria-current="${index === 0 ? "true" : "false"}">
    </button>
  `).join("");

  const slides = [...slidesContainer.querySelectorAll(".category-promo-slide")];
  const dots = [...dotsContainer.querySelectorAll(".category-promo-dot")];

  let current = 0;
  let timer = null;
  let paused = false;
  const delay = 5500;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });

    if (counter) {
      counter.textContent =
        String(current + 1).padStart(2, "0") + " / " +
        String(slides.length).padStart(2, "0");
    }
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function startAuto() {
    stopAuto();

    if (paused || document.hidden || slides.length < 2) return;

    timer = setInterval(() => {
      showSlide(current + 1);
    }, delay);
  }

  function goTo(index) {
    showSlide(index);
    startAuto();
  }

  prevButton?.addEventListener("click", () => {
    goTo(current - 1);
  });

  nextButton?.addEventListener("click", () => {
    goTo(current + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index));
  });

  slider.addEventListener("mouseenter", () => {
    paused = true;
    stopAuto();
  });

  slider.addEventListener("mouseleave", () => {
    paused = false;
    startAuto();
  });

  slider.addEventListener("focusin", () => {
    paused = true;
    stopAuto();
  });

  slider.addEventListener("focusout", event => {
    if (!slider.contains(event.relatedTarget)) {
      paused = false;
      startAuto();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      startAuto();
    }
  });

  showSlide(0);
  startAuto();
}

  

  // ================= كلمات ريلز =================

  
let reelsLoadedFromSupabase = false;

function getReels() {
  // إذا تم تحميل البيانات من Supabase، اعتمد عليها مباشرة
  // حتى لو كانت القائمة فارغة، ولا تعرض الريلز القديمة.
  if (reelsLoadedFromSupabase) {
    return Array.isArray(window.STORE_REELS)
      ? window.STORE_REELS.filter(reel => reel && reel.url)
      : [];
  }

  // بديل مؤقت فقط إذا لم يتم تحميل بيانات Supabase
  try {
    const data = JSON.parse(
      localStorage.getItem("klmat_reels_v1") || "[]"
    );

    return Array.isArray(data)
      ? data.filter(reel => reel && reel.url)
      : [];
  } catch (error) {
    console.error("تعذر قراءة الريلز:", error);
    return [];
  }
}

  function escapeReelText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderReelsHome() {
    const section = $("homeReelsSection");
    const track = $("homeReelsTrack");

    if (!section || !track) {
      console.warn("قسم الريلز غير موجود في index.html");
      return;
    }

    section.hidden = false;
    section.style.display = "block";

    const reels = getReels();

    if (!reels.length) {
      track.innerHTML = `
        <div class="reels-empty">
          <div style="font-size:36px">🎬</div>
          <h3>كلمات ريلز</h3>
          <p>ستظهر مقاطع المنتجات هنا قريباً.</p>
        </div>
      `;
      return;
    }

    track.innerHTML = reels.slice(0, 8).map((reel, index) => `
      <a class="reel-tile" href="reels.html?reel=${index}">
        <video
          src="${escapeReelText(reel.url)}"
          muted
          playsinline
          preload="metadata">
        </video>
        <span>${escapeReelText(reel.title || "شاهد المقطع")}</span>
        <b class="reel-play-icon">▶</b>
      </a>
    `).join("");
  }

  

function renderReelPage() {
  const viewer = $("reelsViewer");
  if (!viewer) return;

  const reels = getReels();

  if (!reels.length) {
    viewer.innerHTML = `
      <div class="reels-empty">
        <h3>🎬 لا توجد مقاطع حالياً</h3>
        <p>ستظهر هنا مقاطع المنتجات عند نشرها.</p>
      </div>`;
    return;
  }

  const requested = parseInt(params.get("reel") || "0", 10);
  let current =
    Number.isInteger(requested) &&
    requested >= 0 &&
    requested < reels.length
      ? requested
      : 0;

  function show(index) {
    current = (index + reels.length) % reels.length;
    const reel = reels[current];

    viewer.innerHTML = `
      <video
        id="activeReelVideo"
        src="${escapeReelText(reel.url)}"
        controls
        autoplay
        playsinline
        preload="metadata">
      </video>

      <div class="reel-caption">
        <h3>${escapeReelText(reel.title || "منتج من متجرنا")}</h3>
        ${
          reel.productId
            ? `<a class="reels-product-link"
                 href="product.html?id=${encodeURIComponent(reel.productId)}">
                 🛍️ عرض المنتج
               </a>`
            : ""
        }
      </div>`;

    const video = $("activeReelVideo");

    if (video) {
      video.load();
      video.play().catch(() => {});
    }

    // تحديث رقم الريل في الرابط
    const url = new URL(location.href);
    url.searchParams.set("reel", current);
    history.replaceState(null, "", url);
  }

  // منع تكرار مستمعات الأزرار عند إعادة العرض
  const prev = $("reelPrev");
  const next = $("reelNext");

  if (prev) {
    prev.onclick = () => show(current - 1);
  }

  if (next) {
    next.onclick = () => show(current + 1);
  }

  // السحب العمودي للتنقل بين الريلز
  let startY = 0;
  let startX = 0;

  viewer.ontouchstart = event => {
    const touch = event.changedTouches[0];
    startY = touch.clientY;
    startX = touch.clientX;
  };

  viewer.ontouchend = event => {
    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - startY;
    const deltaX = touch.clientX - startX;

    // تجاهل السحب الأفقي أو الحركة القصيرة
    if (
      Math.abs(deltaY) < 55 ||
      Math.abs(deltaY) < Math.abs(deltaX) * 1.2
    ) {
      return;
    }

    if (deltaY < 0) {
      show(current + 1); // سحب للأعلى: التالي
    } else {
      show(current - 1); // سحب للأسفل: السابق
    }
  };

  show(current);
}



  
  // ================= تشغيل المتجر =================

  async function boot() {
    // حفظ بيانات المنتجات التجريبية كخطة بديلة
    const localProducts = [...PRODUCTS];

    // تحميل بيانات المتجر من Supabase
    if (window.StoreAPI) {
      try {
        const content = await window.StoreAPI.loadContent();

        // استخدام المنتجات الموجودة في قاعدة البيانات
        // إذا كانت فارغة، نبقي المنتجات التجريبية
        if (content.products.length > 0) {
          PRODUCTS.splice(
            0,
            PRODUCTS.length,
            ...content.products
          );
        }

        // حفظ البنرات والريلز القادمة من قاعدة البيانات
        window.STORE_BANNERS = content.banners;
        console.log("البنرات المحمّلة:", content.banners);
console.log("عدد البنرات:", content.banners?.length);
        window.STORE_REELS = Array.isArray(content.reels)
  ? content.reels
  : [];

reelsLoadedFromSupabase = true;

console.log("الريلز المحمّلة من Supabase:", window.STORE_REELS);
console.log(
  "عدد الريلز المحمّلة:",
  window.STORE_REELS.length
);

console.log(
  "عناوين الريلز:",
  window.STORE_REELS.map(reel => reel.title)
);

        console.log("تم تحميل محتوى المتجر من Supabase.");
      } catch (error) {
        // استمرار عمل المتجر بالبيانات المحلية عند فشل الاتصال
        PRODUCTS.splice(0, PRODUCTS.length, ...localProducts);

        console.warn(
          "تعذر تحميل بيانات Supabase؛ سيتم استخدام المنتجات المحلية.",
          error
        );
      }
    } else {
      console.warn(
        "StoreAPI غير متاح؛ سيتم استخدام المنتجات المحلية."
      );
    }

    // عرض واجهة المتجر
    renderHeader();
    setupPromoSlider();
    setupCategoryPromo();

    $("site-footer").innerHTML = `
      <footer class="footer">
        <p>
          © ${new Date().getFullYear()}
          ${STORE.name} - جميع الحقوق محفوظة
        </p>
      </footer>
    `;

    if (page === "home") {
      renderHomeCards();
      renderHomeCategorySections();
      setupBrandFilter();
      renderReelsHome();

      console.log("صفحة الرئيسية:", page);
      console.log(
        "قسم الريلز:",
        !!$("homeReelsSection")
      );

    } else if (page === "reels") {
      renderReelPage();

    } else if (page === "product") {
      renderProductPage();

    } else {
      renderCategoryPage();
    }

    // إعداد البحث
    const si = $("searchInput");

    if (si) {
      if (params.get("q")) {
        si.value = params.get("q");
      }

      si.addEventListener("input", applyFilters);

      si.addEventListener("keydown", e => {
        if (e.key === "Enter" && !grid) {
          location.href =
            "index.html?q=" +
            encodeURIComponent(si.value);
        }
      });
    }

    applyFilters();
    updateCartUI();

    // أزرار المنتجات والسلة
    document.addEventListener("click", e => {
      const add = e.target.closest(".add-btn");

      if (add) {
        const p = byId(+add.dataset.id);

        if (p && p.colors && p.colors.length > 0) {
          addToCart(p.id, p.colors[0].name, 1);
          openCart();
        }
      }

      const act = e.target.closest(
        ".cart-item [data-act]"
      );

      if (act) {
        const id = +act.dataset.id;
        const col = act.dataset.color;

        if (act.dataset.act === "inc") {
          changeQty(id, col, 1);
        } else if (act.dataset.act === "dec") {
          changeQty(id, col, -1);
        } else {
          removeItem(id, col);
        }
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeCart();
        closeCheckout();
      }
    });
  }

  // بدء التشغيل بعد محاولة تحميل بيانات قاعدة البيانات
  boot().catch(error => {
    console.error("حدث خطأ أثناء تشغيل المتجر:", error);
  });

})();




