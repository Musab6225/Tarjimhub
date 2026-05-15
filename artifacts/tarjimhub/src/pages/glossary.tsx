import { useState } from "react";
import { useLocation } from "wouter";
import { useGlossaryLookup, useSaveGlossaryEntry, useGetGlossaryHistory, getGetGlossaryHistoryQueryKey, useGetSavedGlossary, getGetSavedGlossaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookmarkPlus, Clock, BookOpen } from "lucide-react";

const CATEGORIES = ["Medical", "Legal", "Social Services", "Mental Health", "General"];

export default function GlossaryPage() {
  const { user } = useAuth();
  const { t, isRTL } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) { setLocation("/login"); return null; }

  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("General");
  const [results, setResults] = useState<any[] | null>(null);
  const [currentTerm, setCurrentTerm] = useState("");

  const lookup = useGlossaryLookup({
    mutation: {
      onSuccess: (data: any) => {
        setResults(data.results || []);
        setCurrentTerm(term);
        queryClient.invalidateQueries({ queryKey: getGetGlossaryHistoryQueryKey() });
      },
      onError: () => {
        toast({ title: t("Lookup failed", "فشل البحث"), description: t("AI service unavailable", "خدمة الذكاء الاصطناعي غير متاحة"), variant: "destructive" });
      },
    },
  });

  const saveEntry = useSaveGlossaryEntry({
    mutation: {
      onSuccess: () => {
        toast({ title: t("Saved!", "تم الحفظ!"), description: t("Entry saved to your glossary", "تم حفظ الإدخال في معجمك") });
        queryClient.invalidateQueries({ queryKey: getGetSavedGlossaryQueryKey() });
      },
    },
  });

  const { data: history } = useGetGlossaryHistory({ query: { queryKey: getGetGlossaryHistoryQueryKey() } });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    lookup.mutate({ data: { term, category } });
  };

  const handleSaveDialect = (dialectResult: any) => {
    saveEntry.mutate({ data: { term: currentTerm, results: [dialectResult], category } });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("AI Glossary", "المعجم الذكي")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("Look up any term across 5 Arabic dialects", "ابحث عن أي مصطلح في 5 لهجات عربية")}</p>
          </div>

          {/* Search form */}
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={term}
                      onChange={e => setTerm(e.target.value)}
                      placeholder={t("Enter a term in English or Arabic...", "أدخل مصطلحاً بالإنجليزية أو العربية...")}
                      className="text-base"
                      dir="auto"
                      data-testid="input-term"
                    />
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" style={{ background: "#1D9E75" }} className="text-white" disabled={lookup.isPending} data-testid="button-lookup">
                  <Search className="w-4 h-4 mr-2" />
                  {lookup.isPending ? t("Looking up...", "جارٍ البحث...") : t("Look Up", "ابحث")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading skeleton */}
          {lookup.isPending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-10 w-full mb-2" /><Skeleton className="h-3 w-full" /></CardContent></Card>
              ))}
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results && !lookup.isPending && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("Results for:", "نتائج لـ:")} <span style={{ color: "#1D9E75" }}>"{currentTerm}"</span>
                  </h2>
                  <Badge variant="secondary">{category}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((r, i) => (
                    <motion.div key={r.dialect} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <Badge style={{ background: "#1D9E7520", color: "#1D9E75", border: "none" }}>{r.dialect}</Badge>
                            <span className="text-xs text-gray-500">{r.dialectAr}</span>
                          </div>
                          <p className="text-3xl font-bold text-gray-900 mb-2 leading-tight font-arabic" dir="rtl">{r.arabic}</p>
                          <p className="text-sm text-gray-600 mb-1 font-medium">{r.term}</p>
                          {r.note && <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2">{r.note}</p>}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3 text-xs"
                            onClick={() => handleSaveDialect(r)}
                            disabled={saveEntry.isPending}
                            data-testid={`button-save-${r.dialect}`}
                          >
                            <BookmarkPlus className="w-3 h-3 mr-1.5" />
                            {t("Save", "احفظ")}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Saved entries tab */}
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history"><Clock className="w-3.5 h-3.5 mr-1.5" />{t("History", "السجل")}</TabsTrigger>
              <TabsTrigger value="saved"><BookOpen className="w-3.5 h-3.5 mr-1.5" />{t("Saved", "المحفوظة")}</TabsTrigger>
            </TabsList>
            <TabsContent value="saved">
              <SavedGlossary />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: history */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />{t("Recent Lookups", "عمليات البحث الأخيرة")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!history && <div className="px-4 pb-4"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></div>}
              {history?.slice(0, 20).map((entry: any) => (
                <button
                  key={entry.id}
                  onClick={() => { setTerm(entry.term); }}
                  className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  data-testid={`history-${entry.id}`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{entry.term}</p>
                  {entry.category && <p className="text-xs text-gray-400">{entry.category}</p>}
                </button>
              ))}
              {history?.length === 0 && <p className="px-4 pb-4 text-xs text-gray-400">{t("No history yet", "لا يوجد سجل بعد")}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function SavedGlossary() {
  const { t } = useLang();
  const [filterCat, setFilterCat] = useState("");
  const { data: saved, isLoading } = useGetSavedGlossary(
    filterCat ? { category: filterCat } : undefined,
    { query: { queryKey: getGetSavedGlossaryQueryKey(filterCat ? { category: filterCat } : undefined) } }
  );

  return (
    <div className="space-y-3 mt-3">
      <Select value={filterCat} onValueChange={setFilterCat}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t("All categories", "كل الفئات")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("All categories", "كل الفئات")}</SelectItem>
          {["Medical", "Legal", "Social Services", "Mental Health", "General"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      {isLoading && <Skeleton className="h-20 w-full" />}
      {saved?.map((entry: any) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{entry.term}</span>
              {entry.category && <Badge variant="secondary">{entry.category}</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(entry.results as any[]).map((r: any) => (
                <div key={r.dialect} className="text-center">
                  <p className="text-lg font-bold text-gray-900 font-arabic" dir="rtl">{r.arabic}</p>
                  <p className="text-xs text-gray-500">{r.dialect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {saved?.length === 0 && <p className="text-sm text-gray-400">{t("No saved entries yet", "لا توجد إدخالات محفوظة بعد")}</p>}
    </div>
  );
}
