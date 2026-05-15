import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t, toggleLang, lang } = useLang();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: t("Login failed", "فشل تسجيل الدخول"), description: t("Invalid email or password", "البريد الإلكتروني أو كلمة المرور غير صحيحة"), variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#1D9E75" }}>
            <span className="text-white font-bold text-lg">ت</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">TarjimHub</span>
        </div>
        <p className="text-gray-500 text-sm">{t("Professional platform for Arabic interpreters", "منصة احترافية للمترجمين العرب")}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-0 pt-8">
            <h2 className="text-2xl font-bold text-gray-900">{t("Welcome back", "مرحباً بعودتك")}</h2>
            <p className="text-gray-500 mt-1 text-sm">{t("Sign in to your account", "سجّل الدخول إلى حسابك")}</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">{t("Email", "البريد الإلكتروني")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("your@email.com", "your@email.com")}
                  className="mt-1.5"
                  required
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("Password", "كلمة المرور")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5"
                  required
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-semibold py-2.5"
                style={{ background: "#1D9E75" }}
                disabled={loginMutation.isPending}
                data-testid="button-submit"
              >
                {loginMutation.isPending ? t("Signing in...", "جارٍ تسجيل الدخول...") : t("Sign In", "تسجيل الدخول")}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                {t("Don't have an account?", "ليس لديك حساب؟")}{" "}
                <Link href="/register">
                  <span className="font-semibold cursor-pointer" style={{ color: "#1D9E75" }}>
                    {t("Sign up", "سجّل الآن")}
                  </span>
                </Link>
              </p>
              <button onClick={toggleLang} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {lang === "en" ? "عربي" : "English"}
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">{t("Demo accounts:", "حسابات تجريبية:")}</p>
              <p className="text-xs text-gray-400">sara@tarjimhub.com / password</p>
              <p className="text-xs text-gray-400">omar@tarjimhub.com / password</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
