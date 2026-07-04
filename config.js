/* =========================================================
   ملف الإعدادات العام - عدّل هنا فقط
   =========================================================
   1) SUPABASE_URL و SUPABASE_ANON_KEY: هتلاقيهم في مشروعك على
      supabase.com تحت: Project Settings > API
   2) WHATSAPP_NUMBER: رقمك بالكود الدولي بدون + وبدون صفر
      مثال مصر: 201032641038
   ========================================================= */

const SUPABASE_URL = "https://jllqgwdaistvbemoyxau.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_hK-twI2WLlWEl9cKmJRFhg__HNIpZq7";

const WHATSAPP_NUMBER = "201032641038";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
