import { useRoute, useLocation } from "wouter";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Star, Award, MessageSquare, Edit, Languages, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/profile/:id");
  const { user: currentUser } = useAuth();
  const { t, lang } = useLang();

  const profileId = params?.id ? parseInt(params.id) : currentUser?.id;

  if (!profileId) { setLocation("/login"); return null; }

  const { data: profile, isLoading } = useGetUser(profileId, { query: { queryKey: getGetUserQueryKey(profileId) } });

  const isOwnProfile = currentUser?.id === profileId;
  const initials = profile?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return <Layout><div className="text-center py-20 text-gray-400">{t("User not found", "المستخدم غير موجود")}</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            {/* Cover */}
            <div className="h-32 rounded-t-2xl" style={{ background: "linear-gradient(135deg, #1D9E75 0%, #16856A 100%)" }} />
            <CardContent className="p-6 pt-0">
              <div className="flex items-end justify-between -mt-12 mb-4">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button size="sm" variant="outline" className="mb-1" data-testid="button-edit-profile">
                      <Edit className="w-3.5 h-3.5 mr-1.5" />{t("Edit Profile", "تعديل الملف")}
                    </Button>
                  </Link>
                )}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                {profile.nameAr && <p className="text-gray-600 font-arabic text-lg" dir="rtl">{profile.nameAr}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge style={{ background: "#1D9E7520", color: "#1D9E75", border: "none" }} className="capitalize">{profile.role}</Badge>
                  <Badge variant="secondary">{profile.primaryLanguagePair}</Badge>
                  {profile.dialectSpecialty && <Badge variant="secondary">{profile.dialectSpecialty}</Badge>}
                  {profile.isOnline && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      {t("Online", "متصل")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, label: t("Sessions", "الجلسات"), value: profile.sessionsCompleted },
              { icon: Star, label: t("Rating", "التقييم"), value: profile.rating ? profile.rating.toFixed(1) : "—" },
              { icon: Award, label: t("Specialty", "التخصص"), value: profile.dialectSpecialty || "—" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#1D9E75" }} />
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Bio */}
        {(profile.bio || profile.bioAr) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4" style={{ color: "#1D9E75" }} />
                  {t("About", "نبذة")}
                </h2>
                {profile.bio && <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>}
                {profile.bioAr && (
                  <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-100 font-arabic" dir="rtl">{profile.bioAr}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Certifications */}
        {profile.certifications && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" style={{ color: "#1D9E75" }} />
                  {t("Certifications & Experience", "الشهادات والخبرة")}
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.certifications}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Message button */}
        {!isOwnProfile && currentUser && (
          <Button style={{ background: "#1D9E75" }} className="text-white w-full" onClick={() => setLocation("/messages")}>
            <MessageSquare className="w-4 h-4 mr-2" />{t("Send Message", "إرسال رسالة")}
          </Button>
        )}
      </div>
    </Layout>
  );
}
