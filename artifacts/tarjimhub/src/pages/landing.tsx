import { useLocation, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, MessageSquare, Rss, Shield, Globe, Languages } from "lucide-react";
import { useEffect } from "react";

const features = [
  { icon: BookOpen, en: "AI Glossary", ar: "معجم ذكي", descEn: "Look up any term across 5 Arabic dialects instantly", descAr: "ابحث عن أي مصطلح في 5 لهجات عربية على الفور" },
  { icon: Briefcase, en: "Job Board", ar: "لوحة وظائف", descEn: "Find interpretation jobs or post opportunities", descAr: "ابحث عن وظائف ترجمة أو انشر فرصاً" },
  { icon: Rss, en: "Community Feed", ar: "منشورات المجتمع", descEn: "Connect with interpreters across the Arab world", descAr: "تواصل مع مترجمين من أنحاء العالم العربي" },
  { icon: MessageSquare, en: "Direct Messaging", ar: "الرسائل المباشرة", descEn: "Private conversations with clients and colleagues", descAr: "محادثات خاصة مع العملاء والزملاء" },
  { icon: Shield, en: "Professional Tools", ar: "أدوات احترافية", descEn: "Timer, notes, quick phrases for every session", descAr: "مؤقت وملاحظات وعبارات سريعة لكل جلسة" },
  { icon: Globe, en: "Bilingual", ar: "ثنائي اللغة", descEn: "Full English & Arabic support with RTL", descAr: "دعم كامل للإنجليزية والعربية مع RTL" },
];

export default function LandingPage() {
  const { t, toggleLang, lang, isRTL } = useLang();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1D9E75" }}>
              <span className="text-white font-bold text-sm">ت</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">{lang === "ar" ? "ترجيم هاب" : "TarjimHub"}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
              <Languages className="w-4 h-4" />
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <Link href="/login"><Button variant="outline" size="sm">{t("Sign In", "تسجيل الدخول")}</Button></Link>
            <Link href="/register"><Button size="sm" style={{ background: "#1D9E75" }} className="text-white">{t("Sign Up Free", "سجّل مجاناً")}</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ color: "#1D9E75", borderColor: "#1D9E7540", background: "#1D9E7508" }}>
            <Globe className="w-4 h-4" />
            {t("Professional Platform for Arabic Interpreters", "منصة احترافية للمترجمين العرب")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t("Your professional home", "منزلك المهني")}<br />
            <span style={{ color: "#1D9E75" }}>{t("as an Arabic interpreter", "كمترجم عربي")}</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            {t(
              "AI-powered glossary, job board, community, and professional tools — everything you need in one bilingual platform.",
              "معجم بالذكاء الاصطناعي ولوحة وظائف ومجتمع وأدوات احترافية — كل ما تحتاجه في منصة ثنائية اللغة."
            )}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg" style={{ background: "#1D9E75" }} className="text-white px-8 py-3 text-base font-semibold">
                {t("Get Started Free", "ابدأ مجاناً")}
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-base">
                {t("Sign In", "تسجيل الدخول")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t("Everything you need", "كل ما تحتاجه")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.en} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                  <div className="p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#1D9E7515" }}>
                      <Icon className="w-5 h-5" style={{ color: "#1D9E75" }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t(f.en, f.ar)}</h3>
                    <p className="text-sm text-gray-500">{t(f.descEn, f.descAr)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: "linear-gradient(135deg, #1D9E75 0%, #16856A 100%)" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-bold text-white mb-4">{t("Ready to join?", "هل أنت مستعد للانضمام؟")}</h2>
          <p className="text-emerald-100 mb-8">{t("Join thousands of Arabic interpreters on TarjimHub", "انضم إلى آلاف المترجمين العرب على ترجيم هاب")}</p>
          <Link href="/register">
            <Button size="lg" className="bg-white font-semibold px-8 py-3" style={{ color: "#1D9E75" }}>
              {t("Create Free Account", "إنشاء حساب مجاني")}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-gray-400 text-sm">{lang === "ar" ? "© 2025 ترجيم هاب. جميع الحقوق محفوظة." : "© 2025 TarjimHub. All rights reserved."}</p>
      </footer>
    </div>
  );
}
