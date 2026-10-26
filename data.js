
/* =====================================
   إعدادات متجر كلمات المصطفى
===================================== */

const STORE = {
  name: "كلمات المصطفى للاتصالات والتقنية",
  phone: "9647XXXXXXXXX",

  homeGov: "كربلاء",
  karbalaFee: 5000,
  otherFee: 5000,
  freeOver: 25000,

  governorates: [
    "كربلاء",
    "بغداد",
    "النجف",
    "بابل",
    "البصرة",
    "أربيل",
    "دهوك",
    "السليمانية",
    "كركوك",
    "نينوى",
    "الأنبار",
    "ديالى",
    "واسط",
    "القادسية",
    "المثنى",
    "ذي قار",
    "ميسان",
    "صلاح الدين"
  ]
};

/* =====================================
   أقسام المتجر
===================================== */

const CATEGORIES = {
  smart: {
    title: "الأجهزة الذكية",
    desc: "الموبايلات والأجهزة الذكية",
    icon: "📱",
    file: "smart-devices.html",
    filters: [
      { key: "موبايلات", label: "الموبايلات", icon: "📱" },
      { key: "تابلتات", label: "التابلتات", icon: "📟" },
      { key: "ساعات", label: "الساعات", icon: "⌚" },
      { key: "سماعات", label: "السماعات", icon: "🎧" }
    ]
  },

  accessories: {
    title: "الإكسسوارات",
    desc: "إكسسوارات وملحقات الأجهزة",
    icon: "🎧",
    file: "accessories.html",
    filters: [
      { key: "حافظات", label: "الحافظات", icon: "📱" },
      { key: "سماعات", label: "السماعات", icon: "🎧" },
      { key: "شواحن", label: "الشواحن", icon: "🔌" }
    ]
  },

  computers: {
    title: "الحاسبات",
    desc: "الحاسبات ومستلزماتها",
    icon: "💻",
    file: "computers.html",
    filters: [
      { key: "لابتوبات", label: "اللابتوبات", icon: "💻" },
      { key: "تجميعات", label: "التجميعات", icon: "🖥️" },
      { key: "شاشات", label: "الشاشات", icon: "🖥️" },
      { key: "تخزين", label: "التخزين", icon: "💾" }
    ]
  }
};

/* =====================================
   ألوان المنتجات
===================================== */

const makeColors = (...names) => names.map((name, i) => ({
  name,
  hex: ({
    "أسود": "#222222",
    "أبيض": "#f5f5f5",
    "فضي": "#c0c0c0",
    "ذهبي": "#d6b36a",
    "أزرق": "#2878d0",
    "تيتانيوم": "#8d8984",
    "شفاف": "#e5edf3"
  })[name] || ["#222222", "#f5f5f5", "#2878d0"][i % 3]
}));

/* =====================================
   المنتجات
   الأسعار والمواصفات أمثلة قابلة للتعديل
===================================== */

const PRODUCTS = [
  {
    id: 1,
    name: "هاتف iPhone",
    cat: "smart",
    sub: "موبايلات",
    brand: "apple",
    price: 850000,
    latest: true,
    badge: "مميز",
    rating: 4.8,
    desc: "هاتف ذكي بتصميم أنيق وأداء مميز.",
    emoji: "📱",
    images: [
      "https://images.unsplash.com/photo-1511709268805-153c9b7e1e3b?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("تيتانيوم", "أسود", "أبيض"),
    specs: {
      "النوع": "هاتف ذكي",
      "العلامة التجارية": "Apple",
      "الموديل": "يحدد عند تأكيد المنتج",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 2,
    name: "هاتف Samsung Galaxy",
    cat: "smart",
    sub: "موبايلات",
    brand: "samsung",
    price: 650000,
    latest: true,
    badge: "",
    rating: 4.6,
    desc: "هاتف ذكي للاستخدام اليومي والعمل والترفيه.",
    emoji: "📱",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أسود", "أبيض"),
    specs: {
      "النوع": "هاتف ذكي",
      "العلامة التجارية": "Samsung",
      "الموديل": "يحدد عند تأكيد المنتج",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 3,
    name: "ساعة ذكية",
    cat: "smart",
    sub: "ساعات",
    brand: "xiaomi",
    price: 120000,
    latest: true,
    badge: "مميز",
    rating: 4.5,
    desc: "ساعة ذكية بتصميم عصري للاستخدام اليومي.",
    emoji: "⌚",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أسود", "فضي"),
    specs: {
      "النوع": "ساعة ذكية",
      "العلامة التجارية": "Xiaomi",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 4,
    name: "سماعات لاسلكية",
    cat: "accessories",
    sub: "سماعات",
    brand: "xiaomi",
    price: 45000,
    latest: true,
    badge: "",
    rating: 4.4,
    desc: "سماعات للاستماع إلى الموسيقى والمكالمات.",
    emoji: "🎧",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أسود", "أبيض"),
    specs: {
      "النوع": "سماعات",
      "الاتصال": "يحدد حسب الموديل",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 5,
    name: "شاحن سريع",
    cat: "accessories",
    sub: "شواحن",
    brand: "other",
    price: 20000,
    latest: true,
    badge: "",
    rating: 4.2,
    desc: "شاحن للاستخدام اليومي. تحقق من توافقه مع جهازك.",
    emoji: "🔌",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أبيض"),
    specs: {
      "النوع": "شاحن",
      "القدرة": "تحدد حسب الموديل",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 6,
    name: "حافظة هاتف",
    cat: "accessories",
    sub: "حافظات",
    brand: "other",
    price: 10000,
    latest: true,
    badge: "",
    rating: 4.1,
    desc: "حافظة لحماية الهاتف. تحقق من توافقها مع موديل جهازك.",
    emoji: "📱",
    images: [
      "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أسود", "شفاف"),
    specs: {
      "النوع": "حافظة هاتف",
      "التوافق": "يحدد حسب موديل الهاتف"
    }
  },

  {
    id: 7,
    name: "حاسوب محمول",
    cat: "computers",
    sub: "لابتوبات",
    brand: "other",
    price: 1200000,
    latest: true,
    badge: "مميز",
    rating: 4.7,
    desc: "حاسوب محمول للدراسة والعمل والاستخدام اليومي.",
    emoji: "💻",
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("فضي", "أسود"),
    specs: {
      "النوع": "حاسوب محمول",
      "المعالج": "يحدد حسب الموديل",
      "الذاكرة": "تحدد حسب الموديل",
      "التخزين": "يحدد حسب الموديل",
      "الضمان": "يحدد عند الشراء"
    }
  },

  {
    id: 8,
    name: "شاشة حاسوب",
    cat: "computers",
    sub: "شاشات",
    brand: "other",
    price: 180000,
    latest: true,
    badge: "",
    rating: 4.3,
    desc: "شاشة للاستخدام المكتبي والدراسة.",
    emoji: "🖥️",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=85"
    ],
    colors: makeColors("أسود"),
    specs: {
      "النوع": "شاشة حاسوب",
      "الحجم": "يحدد حسب الموديل",
      "الدقة": "تحدد حسب الموديل",
      "الضمان": "يحدد عند الشراء"
    }
  }
];

/* =====================================
   صورة بديلة عند تعطل الصورة
===================================== */

function imgFail(img, emoji = "📦") {
  if (!img) return;

  img.onerror = null;

  img.src = "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <rect width="100%" height="100%" fill="#eef5fc"/>
        <text x="50%" y="53%" text-anchor="middle"
          font-size="90" font-family="Arial">${emoji}</text>
      </svg>
    `);
}
