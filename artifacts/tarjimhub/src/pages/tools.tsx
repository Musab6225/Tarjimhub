import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Phone, Video, Users, Plus, Copy, BellOff, Monitor, Map } from "lucide-react";

const DEFAULT_PHRASES = [
  { en: "Please speak slowly", ar: "تكلم ببطء من فضلك" },
  { en: "I need to clarify something", ar: "أحتاج أن أوضح شيئاً" },
  { en: "Could you repeat that?", ar: "ممكن تعيد ذلك؟" },
  { en: "I am the interpreter, not a party to this conversation", ar: "أنا المترجم، لست طرفاً في هذه المحادثة" },
  { en: "Please address the client directly", ar: "تكلم مع العميل مباشرةً" },
];

function Timer() {
  const { t } = useLang();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const format = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map(v => String(v).padStart(2, "0")).join(":");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">{t("Session Timer", "مؤقت الجلسة")}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="text-5xl font-mono font-bold text-center py-6 text-gray-900 tracking-wider" data-testid="timer-display">
          {format(elapsed)}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setRunning(r => !r)} style={running ? { background: "#EF4444" } : { background: "#1D9E75" }} className="text-white px-6" data-testid="button-timer-toggle">
            {running ? <><Pause className="w-4 h-4 mr-2" />{t("Pause", "إيقاف مؤقت")}</> : <><Play className="w-4 h-4 mr-2" />{t("Start", "ابدأ")}</>}
          </Button>
          <Button variant="outline" onClick={() => { setRunning(false); setElapsed(0); }} data-testid="button-timer-reset">
            <RotateCcw className="w-4 h-4 mr-2" />{t("Reset", "إعادة تعيين")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickNotes() {
  const { t } = useLang();
  const [notes, setNotes] = useState(() => localStorage.getItem("tarjimhub_notes") || "");

  const handleChange = (v: string) => {
    setNotes(v);
    localStorage.setItem("tarjimhub_notes", v);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700">{t("Quick Notes", "ملاحظات سريعة")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={notes}
          onChange={e => handleChange(e.target.value)}
          placeholder={t("Take notes during the session...", "دوّن ملاحظاتك خلال الجلسة...")}
          className="min-h-[140px] resize-none text-sm"
          data-testid="textarea-notes"
        />
        <p className="text-xs text-gray-400 mt-2">{t("Auto-saved to browser", "محفوظ تلقائياً في المتصفح")}</p>
      </CardContent>
    </Card>
  );
}

function QuickPhrases() {
  const { t } = useLang();
  const [phrases, setPhrases] = useState(DEFAULT_PHRASES);
  const [newEn, setNewEn] = useState("");
  const [newAr, setNewAr] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const addPhrase = () => {
    if (!newEn || !newAr) return;
    setPhrases(p => [...p, { en: newEn, ar: newAr }]);
    setNewEn(""); setNewAr(""); setShowAdd(false);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700">{t("Quick Phrases", "العبارات السريعة")}</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(s => !s)} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />{t("Add", "أضف")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 bg-gray-50 rounded-lg space-y-2 mb-3">
            <Input value={newEn} onChange={e => setNewEn(e.target.value)} placeholder="English phrase" className="text-sm" />
            <Input value={newAr} onChange={e => setNewAr(e.target.value)} placeholder="العبارة بالعربية" className="text-sm" dir="rtl" />
            <div className="flex gap-2">
              <Button size="sm" style={{ background: "#1D9E75" }} className="text-white text-xs" onClick={addPhrase}>{t("Add", "أضف")}</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAdd(false)}>{t("Cancel", "إلغاء")}</Button>
            </div>
          </motion.div>
        )}
        {phrases.map((p, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{p.en}</p>
                <p className="text-sm text-gray-600 mt-0.5 font-arabic" dir="rtl">{p.ar}</p>
              </div>
              <button onClick={() => copy(`${p.en} / ${p.ar}`)} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();

  if (!user) { setLocation("/login"); return null; }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("Interpreter Tools", "أدوات المترجم")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("Everything you need during a session", "كل ما تحتاجه خلال الجلسة")}</p>
        </div>

        <Tabs defaultValue="otp">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="otp"><Phone className="w-3.5 h-3.5 mr-1.5" />{t("OTP", "هاتفي")}</TabsTrigger>
            <TabsTrigger value="video"><Video className="w-3.5 h-3.5 mr-1.5" />{t("Video", "فيديو")}</TabsTrigger>
            <TabsTrigger value="inperson"><Users className="w-3.5 h-3.5 mr-1.5" />{t("In-Person", "حضوري")}</TabsTrigger>
          </TabsList>

          {/* OTP */}
          <TabsContent value="otp" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Timer />
              <QuickNotes />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">{t("OTP Extras", "إضافات الهاتف")}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <BellOff className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800 text-sm">{t("Mute Reminder", "تذكير كتم الصوت")}</p>
                      <p className="text-xs text-red-600">{t("Mute yourself when not interpreting", "اكتم صوتك عند عدم الترجمة")}</p>
                    </div>
                  </div>
                  <OTPCallLog />
                </CardContent>
              </Card>
              <QuickPhrases />
            </div>
          </TabsContent>

          {/* Video */}
          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Timer />
              <QuickNotes />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-700">{t("Video Checklist", "قائمة الفيديو")}</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[
                    t("Share screen if needed", "شارك الشاشة إذا لزم"),
                    t("Check virtual background", "تحقق من الخلفية الافتراضية"),
                    t("Test microphone and camera", "اختبر الميكروفون والكاميرا"),
                    t("Ensure stable internet", "تأكد من استقرار الإنترنت"),
                    t("Close unnecessary tabs", "أغلق التبويبات غير الضرورية"),
                  ].map((item, i) => (
                    <CheckItem key={i} label={item} />
                  ))}
                </CardContent>
              </Card>
              <QuickPhrases />
            </div>
          </TabsContent>

          {/* In-person */}
          <TabsContent value="inperson" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Timer />
              <QuickNotes />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Map className="w-4 h-4" />{t("Seating Arrangement", "ترتيب الجلوس")}</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-gray-50 rounded-xl p-4 text-center space-y-3">
                    <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">{t("Client", "العميل")}</div>
                    <div className="flex justify-center gap-8">
                      <div className="inline-block px-4 py-2 rounded-lg text-xs font-medium text-white" style={{ background: "#1D9E75" }}>{t("Interpreter", "المترجم")}</div>
                      <div className="inline-block px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">{t("Provider", "مقدم الخدمة")}</div>
                    </div>
                    <p className="text-xs text-gray-500">{t("Sit at 45° angle — not between parties", "اجلس بزاوية 45° — ليس بين الطرفين")}</p>
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-medium text-amber-800">{t("Speak loudly and clearly", "تحدث بصوت عالٍ وواضح")}</p>
                    <p className="text-xs text-amber-600 mt-0.5">{t("Ensure everyone can hear you well", "تأكد أن الجميع يسمعك جيداً")}</p>
                  </div>
                </CardContent>
              </Card>
              <QuickPhrases />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function CheckItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button onClick={() => setChecked(c => !c)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${checked ? "bg-green-50" : "hover:bg-gray-50"}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={`text-sm ${checked ? "line-through text-gray-400" : "text-gray-700"}`}>{label}</span>
    </button>
  );
}

function OTPCallLog() {
  const { t } = useLang();
  const [logs, setLogs] = useState<Array<{ time: string; duration: string; lang: string; notes: string }>>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ lang: "Arabic-English", notes: "" });

  const addLog = () => {
    setLogs(l => [...l, { time: new Date().toLocaleTimeString(), duration: "—", lang: form.lang, notes: form.notes }]);
    setAdding(false);
    setForm({ lang: "Arabic-English", notes: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-600">{t("Call Log", "سجل المكالمات")}</p>
        <button onClick={() => setAdding(a => !a)} className="text-xs" style={{ color: "#1D9E75" }}>{t("+ Add", "+ أضف")}</button>
      </div>
      {adding && (
        <div className="p-2 bg-gray-50 rounded-lg space-y-2 mb-2">
          <Input value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))} placeholder="Language pair" className="text-xs h-7" />
          <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" className="text-xs h-7" />
          <Button size="sm" style={{ background: "#1D9E75" }} className="text-white text-xs h-7" onClick={addLog}>{t("Log", "سجّل")}</Button>
        </div>
      )}
      {logs.map((log, i) => (
        <div key={i} className="text-xs text-gray-600 py-1.5 border-b border-gray-100 last:border-0">
          <span className="font-medium">{log.time}</span> · {log.lang} {log.notes && `· ${log.notes}`}
        </div>
      ))}
      {logs.length === 0 && <p className="text-xs text-gray-400">{t("No calls logged", "لا توجد مكالمات مسجلة")}</p>}
    </div>
  );
}
