import { useState } from "react";
import { useLocation } from "wouter";
import { useGetSavedGlossary, getGetSavedGlossaryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Tag, Globe } from "lucide-react";

const CATEGORIES = ["All", "Medical", "Legal", "Social Services", "Mental Health", "General"];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Medical:          { bg: "#EFF6FF", text: "#2563EB" },
  Legal:            { bg: "#FEF9C3", text: "#B45309" },
  "Social Services":{ bg: "#F0FDF4", text: "#16A34A" },
  "Mental Health":  { bg: "#FDF4FF", text: "#9333EA" },
  General:          { bg: "#F1F5F9", text: "#475569" },
};

const DIALECTS = ["Egyptian", "Levantine", "Gulf", "Moroccan", "Sudanese"];

export default function TerminologiesPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();

  if (!user) { setLocation("/login"); return null; }

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDialect, setActiveDialect] = useState("All");

  const { data: saved, isLoading } = useGetSavedGlossary(undefined, {
    query: { queryKey: getGetSavedGlossaryQueryKey() },
  });

  const filtered = saved?.filter((entry: any) => {
    const matchesCategory = activeCategory === "All" ||
      String(entry.category ?? "").toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch = !searchQuery.trim() ||
      entry.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.results as any[]).some((r: any) =>
        String(r.arabic ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.term ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDialect = activeDialect === "All" ||
      (entry.results as any[]).some((r: any) => r.dialect === activeDialect);

    return matchesCategory && matchesSearch && matchesDialect;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6" style={{ color: "#1D9E75" }} />
              {t("Terminologies", "المصطلحات")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {t("Browse your saved terms across dialects and categories", "تصفح مصطلحاتك المحفوظة عبر اللهجات والفئات")}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {filtered?.length ?? 0} {t("terms", "مصطلح")}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("Search terms in English or Arabic...", "ابحث بالإنجليزية أو العربية...")}
            className="pl-10 text-base"
            dir="auto"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-gray-400 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={
                activeCategory === cat
                  ? { background: "#1D9E75", color: "#fff", borderColor: "#1D9E75" }
                  : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dialect filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
          {["All", ...DIALECTS].map(d => (
            <button
              key={d}
              onClick={() => setActiveDialect(d)}
              className="px-3 py-1.5 rounded-full text-sm transition-all border"
              style={
                activeDialect === d
                  ? { background: "#0F172A", color: "#fff", borderColor: "#0F172A" }
                  : { background: "#fff", color: "#374151", borderColor: "#E5E7EB" }
              }
            >
              {d}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}><CardContent className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent></Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered?.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t("No terms found", "لا توجد مصطلحات")}</p>
            <p className="text-gray-400 text-sm mt-1">
              {t("Save terms from the Glossary page to see them here", "احفظ مصطلحات من صفحة المعجم لتراها هنا")}
            </p>
          </div>
        )}

        {/* Terms grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered?.map((entry: any, i: number) => {
              const colors = CATEGORY_COLORS[entry.category] ?? CATEGORY_COLORS["General"];
              const dialects = activeDialect === "All"
                ? (entry.results as any[])
                : (entry.results as any[]).filter((r: any) => r.dialect === activeDialect);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{entry.term}</h3>
                        {entry.category && (
                          <Badge
                            className="shrink-0 text-xs font-medium border-0"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            {entry.category}
                          </Badge>
                        )}
                      </div>

                      <div className="divide-y divide-gray-50">
                        {dialects.map((r: any) => (
                          <div key={r.dialect} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs text-gray-400 shrink-0 w-16">{r.dialect}</span>
                              <span className="text-xs text-gray-300">|</span>
                              <span className="text-xs text-gray-500 truncate">{r.term}</span>
                            </div>
                            <p
                              className="text-base font-bold text-gray-900 shrink-0"
                              dir="rtl"
                              style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}
                            >
                              {r.arabic}
                            </p>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-300 mt-auto pt-1 border-t border-gray-50">
                        {new Date(entry.savedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
