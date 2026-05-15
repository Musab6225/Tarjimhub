import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const LANGUAGE_PAIRS = ["Arabic-English", "Arabic-French", "Arabic-Spanish", "Arabic-German", "Arabic-Turkish", "Arabic-Persian"];
const DIALECTS = ["Egyptian", "Levantine", "Gulf", "Moroccan", "Sudanese", "Iraqi", "Yemeni"];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", nameAr: "", email: "", password: "",
    role: "interpreter", primaryLanguagePair: "Arabic-English", dialectSpecialty: "",
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: t("Registration failed", "فشل إنشاء الحساب"), description: err?.data?.error || t("Please try again", "حاول مجدداً"), variant: "destructive" });
      },
    },
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ data: form });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1D9E75" }}>
            <span className="text-white font-bold text-lg">ت</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">TarjimHub</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-0 pt-8">
            <h2 className="text-2xl font-bold text-gray-900">{t("Create your account", "أنشئ حسابك")}</h2>
            <p className="text-gray-500 mt-1 text-sm">{t("Join the interpreter community", "انضم إلى مجتمع المترجمين")}</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Full Name", "الاسم الكامل")}</Label>
                  <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" className="mt-1.5" required data-testid="input-name" />
                </div>
                <div>
                  <Label>{t("Name in Arabic", "الاسم بالعربية")}</Label>
                  <Input value={form.nameAr} onChange={e => set("nameAr", e.target.value)} placeholder="جون سميث" className="mt-1.5" dir="rtl" data-testid="input-name-ar" />
                </div>
              </div>
              <div>
                <Label>{t("Email", "البريد الإلكتروني")}</Label>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" className="mt-1.5" required data-testid="input-email" />
              </div>
              <div>
                <Label>{t("Password", "كلمة المرور")}</Label>
                <Input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" className="mt-1.5" required minLength={6} data-testid="input-password" />
              </div>
              <div>
                <Label>{t("I am a...", "أنا...")}</Label>
                <Select value={form.role} onValueChange={v => set("role", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interpreter">{t("Interpreter", "مترجم")}</SelectItem>
                    <SelectItem value="client">{t("Client / Organization", "عميل / منظمة")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("Primary Language Pair", "زوج اللغة الرئيسي")}</Label>
                <Select value={form.primaryLanguagePair} onValueChange={v => set("primaryLanguagePair", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_PAIRS.map(lp => <SelectItem key={lp} value={lp}>{lp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {form.role === "interpreter" && (
                <div>
                  <Label>{t("Dialect Specialty", "التخصص اللهجي")}</Label>
                  <Select value={form.dialectSpecialty} onValueChange={v => set("dialectSpecialty", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={t("Select dialect...", "اختر لهجة...")} />
                    </SelectTrigger>
                    <SelectContent>
                      {DIALECTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full text-white font-semibold py-2.5 mt-2" style={{ background: "#1D9E75" }} disabled={registerMutation.isPending} data-testid="button-submit">
                {registerMutation.isPending ? t("Creating account...", "جارٍ إنشاء الحساب...") : t("Create Account", "إنشاء حساب")}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              {t("Already have an account?", "لديك حساب بالفعل؟")}{" "}
              <Link href="/login"><span className="font-semibold cursor-pointer" style={{ color: "#1D9E75" }}>{t("Sign in", "تسجيل الدخول")}</span></Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
