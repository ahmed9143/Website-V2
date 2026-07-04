/* =========================================================
   ملف الإعدادات العام - عدّل هنا فقط
   =========================================================
   1) SUPABASE_URL و SUPABASE_ANON_KEY: هتلاقيهم في مشروعك على
      supabase.com تحت: Project Settings > API
   2) WHATSAPP_NUMBER: رقمك بالكود الدولي بدون + وبدون صفر
      مثال مصر: 201032641038
   ========================================================= */

const SUPABASE_URL = "https://jauawivppggldbnemljv.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_eDn9PSJgWQJp-YF5OP8E4A_R6pG96Xe";

const WHATSAPP_NUMBER = "201032641038";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
