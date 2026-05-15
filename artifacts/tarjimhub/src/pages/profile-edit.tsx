import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUpdateUser } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const LANGUAGE_PAIRS = ["Arabic-English", "Arabic-French", "Arabic-Spanish", "Arabic-German", "Arabic-Turkish"];
const DIALECTS = ["Egyptian", "Levantine", "Gulf", "Moroccan", "Sudanese", "Iraqi", "Yemeni"];

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!user) { setLocation("/login"); return null; }

  const [form, setForm] = useState({
    name: user.name || "",
    nameAr: user.nameAr || "",
    bio: user.bio || "",
    bioAr: user.bioAr || "",
    primaryLanguagePair: user.primaryLanguagePair || "Arabic-English",
    dialectSpecialty: user.dialectSpecialty || "",
    certifications: user.certifications || "",
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: (data: any) => {
        updateUser(data);
        toast({ title: t("Profile updated!", "تم تحديث الملف الشخصي!") });
        setLocation(`/profile/${user.id}`);
      },
      onError: () => toast({ title: t("Update failed", "فشل التحديث"), variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: user.id, data: form });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("Edit Profile", "تعديل الملف الشخصي")}</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Personal Information", "المعلومات الشخصية")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("Full Name", "الاسم الكامل")}</Label>
                    <Input value={form.name} onChange={e => setF("name", e.target.value)} className="mt-1.5" required data-testid="input-name" />
                  </div>
                  <div>
                    <Label>{t("Name in Arabic", "الاسم بالعربية")}</Label>
                    <Input value={form.nameAr} onChange={e => setF("nameAr", e.target.value)} dir="rtl" className="mt-1.5" data-testid="input-name-ar" />
                  </div>
                </div>
                <div>
                  <Label>{t("Bio (English)", "السيرة الذاتية (إنجليزي)")}</Label>
                  <Textarea value={form.bio} onChange={e => setF("bio", e.target.value)} className="mt-1.5 min-h-[100px]" data-testid="textarea-bio" />
                </div>
                <div>
                  <Label>{t("Bio (Arabic)", "السيرة الذاتية (عربي)")}</Label>
                  <Textarea value={form.bioAr} onChange={e => setF("bioAr", e.target.value)} dir="rtl" className="mt-1.5 min-h-[100px] font-arabic" data-testid="textarea-bio-ar" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Professional Details", "التفاصيل المهنية")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("Primary Language Pair", "زوج اللغة الرئيسي")}</Label>
                    <Select value={form.primaryLanguagePair} onValueChange={v => setF("primaryLanguagePair", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGUAGE_PAIRS.map(lp => <SelectItem key={lp} value={lp}>{lp}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Dialect Specialty", "التخصص اللهجي")}</Label>
                    <Select value={form.dialectSpecialty} onValueChange={v => setF("dialectSpecialty", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("Select...", "اختر...")} /></SelectTrigger>
                      <SelectContent>{DIALECTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t("Certifications & Experience", "الشهادات والخبرة")}</Label>
                  <Textarea value={form.certifications} onChange={e => setF("certifications", e.target.value)} className="mt-1.5 min-h-[80px]" data-testid="textarea-certifications" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" style={{ background: "#1D9E75" }} className="text-white flex-1" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending ? t("Saving...", "جارٍ الحفظ...") : t("Save Changes", "حفظ التغييرات")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation(`/profile/${user.id}`)}>
                {t("Cancel", "إلغاء")}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
