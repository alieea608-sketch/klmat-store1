
/* =====================================
   الاتصال بقاعدة بيانات متجر كلمات المصطفى
===================================== */

(function () {
  const config = window.SUPABASE_CONFIG;

  if (!config?.url || !config?.publishableKey) {
    console.error("إعدادات Supabase غير مكتملة.");
    return;
  }

  if (!window.supabase?.createClient) {
    console.error("مكتبة Supabase لم يتم تحميلها.");
    return;
  }

  const client = window.supabase.createClient(
    config.url,
    config.publishableKey
  );

  window.StoreAPI = {
    client,

    // قراءة المنتجات والبنرات والريلز من قاعدة البيانات
    async loadContent() {
      const { data, error } = await client
        .from("store_content")
        .select("products, banners, reels")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("خطأ في قراءة محتوى المتجر:", error);
        throw error;
      }

      return {
        products: Array.isArray(data?.products)
          ? data.products
          : [],
        banners: Array.isArray(data?.banners)
          ? data.banners
          : [],
        reels: Array.isArray(data?.reels)
          ? data.reels
          : []
      };
    },

    // حفظ المحتوى بعد تسجيل دخول المدير
    async saveContent(content) {
      const allowed = {};

      for (const key of ["products", "banners", "reels"]) {
        if (Object.prototype.hasOwnProperty.call(content, key)) {
          if (!Array.isArray(content[key])) {
            throw new Error("صيغة البيانات غير صحيحة: " + key);
          }

          allowed[key] = content[key];
        }
      }

      if (!Object.keys(allowed).length) {
        throw new Error("لا توجد بيانات لحفظها.");
      }

      const { data, error } = await client
        .from("store_content")
        .update(allowed)
        .eq("id", 1)
        .select("id");

      if (error) {
        console.error("تعذر حفظ محتوى المتجر:", error);
        throw error;
      }

      if (!data?.length) {
        throw new Error(
          "لم يتم حفظ التغييرات. تحقق من تسجيل دخول المدير وصلاحيات قاعدة البيانات."
        );
      }

      return true;
    },


// تحديث قسم محدد دون استبدال المنتجات أو القسم الآخر
async updateSection(section, items) {
  if (!["banners", "reels"].includes(section)) {
    throw new Error("القسم غير مسموح بتعديله.");
  }

  if (!Array.isArray(items)) {
    throw new Error("بيانات القسم غير صحيحة.");
  }

  const { data, error } = await client
    .from("store_content")
    .update({
      [section]: items,
      updated_at: new Date().toISOString()
    })
    .eq("id", 1)
    .select("id");

  if (error) {
    console.error("تعذر تحديث القسم:", error);
    throw error;
  }

  if (!data?.length) {
    throw new Error(
      "لم يتم الحفظ. تحقق من تسجيل دخول المدير وصلاحيات قاعدة البيانات."
    );
  }

  return true;
},
    // رفع الصور والفيديوهات إلى Storage
    async uploadFile(bucket, file) {
      const allowedBuckets = [
        "product-images",
        "store-banners",
        "store-reels"
      ];

      if (!allowedBuckets.includes(bucket)) {
        throw new Error("مجلد التخزين غير مسموح.");
      }

      if (!(file instanceof File)) {
        throw new Error("لم يتم اختيار ملف صالح.");
      }

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (bucket === "store-reels" && !isVideo) {
        throw new Error("اختر ملف فيديو.");
      }

      if (
        ["product-images", "store-banners"].includes(bucket) &&
        !isImage
      ) {
        throw new Error("اختر ملف صورة.");
      }

      const maxSize = isVideo
        ? 50 * 1024 * 1024
        : 5 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          isVideo
            ? "حجم الفيديو يجب ألا يتجاوز 50 ميغابايت."
            : "حجم الصورة يجب ألا يتجاوز 5 ميغابايت."
        );
      }

      const safeName = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      const path =
        Date.now() + "_" +
        Math.random().toString(36).slice(2, 10) +
        "_" + safeName;

      const { error } = await client.storage
        .from(bucket)
        .upload(path, file, {
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error("تعذر رفع الملف:", error);
        throw error;
      }

      const { data } = client.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        path,
        url: data.publicUrl
      };
    }
  };
})();
