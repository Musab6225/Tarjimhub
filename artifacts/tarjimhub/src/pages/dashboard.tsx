import { useLocation } from "wouter";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  BookOpen, Briefcase, MessageSquare, Rss, Settings, Users, 
  Clock, CheckCircle, Calendar, ArrowRight 
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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
  const [isAvailable, setIsAvailable] = useState(true);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: stats, isLoading } = useGetDashboardStats({ 
    query: { queryKey: getGetDashboardStatsQueryKey() } 
  });

  const statCards = [
    { icon: CheckCircle, label: t("Sessions Completed", "الجلسات المكتملة"), value: stats?.sessionsCompleted ?? 0, color: "#1D9E75" },
    { icon: Briefcase, label: t("Jobs Applied", "الوظائف المُتقدَّم إليها"), value: stats?.jobsApplied ?? 0, color: "#3B82F6" },
    { icon: Users, label: t("Connections", "التواصلات"), value: stats?.connections ?? 0, color: "#8B5CF6" },
    { icon: Clock, label: t("Saved Jobs", "الوظائف المحفوظة"), value: stats?.savedJobs ?? 0, color: "#F59E0B" },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-20 md:pb-8"> {/* Extra padding for mobile bottom nav */}

        {/* Welcome Header + Availability */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-3xl p-6 text-white relative overflow-hidden" 
               style={{ background: "linear-gradient(135deg, #1D9E75 0%, #16856A 100%)" }}>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-sm font-medium">{t("Welcome back", "مرحباً بعودتك")}</p>
                <h1 className="text-3xl font-bold mt-1">{user.name}</h1>
                {user.nameAr && <p className="text-emerald-100 text-xl font-arabic mt-1">{user.nameAr}</p>}
              </div>

              {/* Availability Toggle */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                  <span className="text-xs font-medium">{t("Available", "متاح")}</span>
                  <Switch 
                    checked={isAvailable} 
                    onCheckedChange={setIsAvailable}
                    className="data-[state=checked]:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-emerald-100 text-sm">
              <span>{user.primaryLanguagePair}</span>
              {user.dialectSpecialty && <span>• {user.dialectSpecialty}</span>}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" 
                           style={{ background: `${s.color}15` }}>
                        <Icon className="w-6 h-6" style={{ color: s.color }} />
                      </div>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16 mt-4" />
                    ) : (
                      <p className="text-3xl font-bold mt-4 text-gray-900">{s.value}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t("Upcoming Sessions", "الجلسات القادمة")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Replace with real data later */}
            <div className="text-center py-10 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("No upcoming sessions", "لا توجد جلسات قادمة")}</p>
              <p className="text-sm mt-1">New sessions will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t("Recommended Jobs", "وظائف موصى بها")}</h2>
            <Link href="/jobs" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              {t("View all", "عرض الكل")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* You can map real recommended jobs here later */}
            <Card className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Medical Conference - Zoom</p>
                    <p className="text-sm text-gray-500">English ↔ Egyptian Arabic • $85/hr</p>
                  </div>
                  <div className="text-emerald-600 text-xs font-medium">High Match</div>
                </div>
                <Button className="w-full mt-4" size="sm">Apply Now</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("Quick Access", "وصول سريع")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.href} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link href={link.href}>
                    <Card className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border-gray-100 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-50">
                            <Icon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{t(link.en, link.ar)}</p>
                            <p className="text-sm text-gray-500 mt-1 leading-tight">{t(link.desc, link.descAr)}</p>
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
      </div>
    </Layout>
  );
}