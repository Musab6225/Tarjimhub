import { useLocation } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, MessageSquare, Rss, Settings, Users, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const quickLinks = [
  { href: "/glossary", icon: BookOpen, en: "AI Glossary", ar: "المعجم الذكي", desc: "Look up terms across 5 dialects", descAr: "ابحث عن المصطلحات في 5 لهجات" },
  { href: "/tools", icon: Settings, en: "Interpreter Tools", ar: "أدوات المترجم", desc: "Timer, notes, quick phrases", descAr: "مؤقت، ملاحظات، عبارات سريعة" },
  { href: "/jobs", icon: Briefcase, en: "Job Board", ar: "لوحة الوظائف", desc: "Find or post interpreting jobs", descAr: "ابحث أو انشر وظائف" },
  { href: "/feed", icon: Rss, en: "Community Feed", ar: "منشورات المجتمع", desc: "Connect with other interpreters", descAr: "تواصل مع المترجمين" },
  { href: "/messages", icon: MessageSquare, en: "Messages", ar: "الرسائل", desc: "Direct messages", descAr: "الرسائل المباشرة" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();

  if (!user) { setLocation("/login"); return null; }

  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });

  const statCards = [
    { icon: CheckCircle, label: t("Sessions Completed", "الجلسات المكتملة"), value: stats?.sessionsCompleted ?? 0, color: "#1D9E75" },
    { icon: Briefcase, label: t("Jobs Applied", "الوظائف المُتقدَّم إليها"), value: stats?.jobsApplied ?? 0, color: "#3B82F6" },
    { icon: Users, label: t("Connections", "التواصلات"), value: stats?.connections ?? 0, color: "#8B5CF6" },
    { icon: Clock, label: t("Saved Jobs", "الوظائف المحفوظة"), value: stats?.savedJobs ?? 0, color: "#F59E0B" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1D9E75 0%, #16856A 100%)" }}>
            <p className="text-emerald-100 text-sm font-medium mb-1">{t("Welcome back", "مرحباً بعودتك")}</p>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.nameAr && <p className="text-emerald-100 text-lg mt-0.5 font-arabic">{user.nameAr}</p>}
            <div className="flex items-center gap-4 mt-3 text-emerald-100 text-sm">
              <span>{user.primaryLanguagePair}</span>
              {user.dialectSpecialty && <span>• {user.dialectSpecialty}</span>}
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs capitalize">{user.role}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: s.color }} />
                      </div>
                    </div>
                    {isLoading ? <Skeleton className="h-8 w-16 mb-1" /> : (
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick access */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("Quick Access", "وصول سريع")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.href} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Link href={link.href}>
                    <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-gray-100">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1D9E7515" }}>
                            <Icon className="w-5 h-5" style={{ color: "#1D9E75" }} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{t(link.en, link.ar)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{t(link.desc, link.descAr)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("Recent Activity", "النشاط الأخير")}</h2>
            <Card>
              <CardContent className="p-0 divide-y divide-gray-100">
                {stats.recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#1D9E75" }} />
                    <p className="text-sm text-gray-700 flex-1">{item.description}</p>
                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
