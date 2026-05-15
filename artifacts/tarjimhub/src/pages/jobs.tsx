import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListJobs, getListJobsQueryKey,
  useCreateJob, useApplyToJob, useSaveJob,
  useGetSavedJobs, getGetSavedJobsQueryKey,
  useGetJobApplications, getGetJobApplicationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, Phone, Video, Users, Bookmark, Send, Plus } from "lucide-react";

const MODE_ICONS: Record<string, React.ElementType> = { otp: Phone, video: Video, inperson: Users };
const MODE_LABELS: Record<string, string> = { otp: "OTP", video: "Video", inperson: "In-Person" };

function JobCard({ job, onApply, onSave, isInterpreter }: any) {
  const { t } = useLang();
  const ModeIcon = MODE_ICONS[job.mode] || Briefcase;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-shadow" data-testid={`card-job-${job.id}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                {job.urgent && <Badge className="text-xs bg-red-500 text-white border-0">{t("Urgent", "عاجل")}</Badge>}
              </div>
              {job.clientName && <p className="text-sm text-gray-500 mt-0.5">{job.clientName}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900">{job.rateOffered}</p>
              <p className="text-xs text-gray-500">{t("per hour", "في الساعة")}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs gap-1"><ModeIcon className="w-3 h-3" />{MODE_LABELS[job.mode] || job.mode}</Badge>
            <Badge variant="secondary" className="text-xs">{job.languagePair}</Badge>
            {job.specialty && <Badge variant="secondary" className="text-xs">{job.specialty}</Badge>}
            {job.remote && <Badge variant="secondary" className="text-xs">{t("Remote", "عن بُعد")}</Badge>}
            {job.location && <Badge variant="secondary" className="text-xs gap-1"><MapPin className="w-3 h-3" />{job.location}</Badge>}
          </div>
          {isInterpreter && (
            <div className="flex gap-2">
              <Button size="sm" style={{ background: "#1D9E75" }} className="text-white flex-1" onClick={() => onApply(job)} data-testid={`button-apply-${job.id}`}>
                <Send className="w-3.5 h-3.5 mr-1.5" />{t("Apply", "تقدّم")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onSave(job.id)} data-testid={`button-save-${job.id}`}>
                <Bookmark className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isInterpreter = user?.role === "interpreter";

  if (!user) { setLocation("/login"); return null; }

  const [filters, setFilters] = useState({ languagePair: "", mode: "", specialty: "" });
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", languagePair: "Arabic-English", mode: "otp", rateOffered: "", specialty: "", urgent: false, remote: true, location: "" });

  const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data: jobs, isLoading } = useListJobs(Object.keys(activeFilters).length ? activeFilters : undefined, { query: { queryKey: getListJobsQueryKey(activeFilters) } });
  const { data: savedJobs } = useGetSavedJobs({ query: { queryKey: getGetSavedJobsQueryKey() } });

  const applyMutation = useApplyToJob({
    mutation: {
      onSuccess: () => { toast({ title: t("Applied!", "تم التقدم!") }); setApplyingJob(null); setApplyMessage(""); },
      onError: () => toast({ title: t("Failed", "فشل"), variant: "destructive" }),
    },
  });

  const saveMutation = useSaveJob({
    mutation: {
      onSuccess: (data: any) => { toast({ title: data.saved ? t("Saved!", "تم الحفظ!") : t("Removed", "تمت الإزالة") }); queryClient.invalidateQueries({ queryKey: getGetSavedJobsQueryKey() }); },
    },
  });

  const createMutation = useCreateJob({
    mutation: {
      onSuccess: () => { toast({ title: t("Job posted!", "تم نشر الوظيفة!") }); queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() }); setShowPostForm(false); },
      onError: () => toast({ title: t("Failed to post", "فشل النشر"), variant: "destructive" }),
    },
  });

  const setF = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }));
  const setJF = (k: string, v: any) => setJobForm(f => ({ ...f, [k]: v }));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("Job Board", "لوحة الوظائف")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t(isInterpreter ? "Find interpreting opportunities" : "Manage your job postings", isInterpreter ? "ابحث عن فرص ترجمة" : "أدر وظائفك المنشورة")}</p>
          </div>
          {!isInterpreter && (
            <Button onClick={() => setShowPostForm(true)} style={{ background: "#1D9E75" }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />{t("Post a Job", "انشر وظيفة")}
            </Button>
          )}
        </div>

        <Tabs defaultValue="browse">
          <TabsList>
            <TabsTrigger value="browse">{t("Browse Jobs", "تصفح الوظائف")}</TabsTrigger>
            {isInterpreter && <TabsTrigger value="saved">{t("Saved", "المحفوظة")} {savedJobs?.length ? `(${savedJobs.length})` : ""}</TabsTrigger>}
            {!isInterpreter && <TabsTrigger value="posted">{t("My Postings", "وظائفي")}</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Input value={filters.languagePair} onChange={e => setF("languagePair", e.target.value)} placeholder={t("Language pair...", "زوج اللغة...")} className="w-40" />
              <Select value={filters.mode} onValueChange={v => setF("mode", v)}>
                <SelectTrigger className="w-36"><SelectValue placeholder={t("Mode", "النوع")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("All modes", "كل الأنواع")}</SelectItem>
                  <SelectItem value="otp">OTP</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="inperson">In-Person</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.specialty} onValueChange={v => setF("specialty", v)}>
                <SelectTrigger className="w-40"><SelectValue placeholder={t("Specialty", "التخصص")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("All specialties", "كل التخصصات")}</SelectItem>
                  {["Medical", "Legal", "Social Services", "Mental Health", "General"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs?.map((job: any) => (
                <JobCard key={job.id} job={job} onApply={setApplyingJob} onSave={(id: number) => saveMutation.mutate({ id })} isInterpreter={isInterpreter} />
              ))}
            </div>
            {jobs?.length === 0 && <p className="text-gray-400 text-center py-12">{t("No jobs found", "لا توجد وظائف")}</p>}
          </TabsContent>

          {isInterpreter && (
            <TabsContent value="saved" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs?.map((job: any) => <JobCard key={job.id} job={job} onApply={setApplyingJob} onSave={(id: number) => saveMutation.mutate({ id })} isInterpreter />)}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Apply dialog */}
        <Dialog open={!!applyingJob} onOpenChange={() => { setApplyingJob(null); setApplyMessage(""); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("Apply for:", "التقدم لـ:")} {applyingJob?.title}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Label>{t("Cover message", "رسالة التقديم")}</Label>
              <Textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)} placeholder={t("Tell them about your experience...", "أخبرهم عن خبرتك...")} className="min-h-[120px]" />
              <div className="flex gap-3">
                <Button style={{ background: "#1D9E75" }} className="text-white flex-1" onClick={() => applyMutation.mutate({ id: applyingJob.id, data: { message: applyMessage } })} disabled={!applyMessage || applyMutation.isPending}>
                  {applyMutation.isPending ? t("Applying...", "جارٍ التقديم...") : t("Submit Application", "إرسال الطلب")}
                </Button>
                <Button variant="outline" onClick={() => setApplyingJob(null)}>{t("Cancel", "إلغاء")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Post job dialog */}
        <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("Post a Job", "انشر وظيفة")}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>{t("Job Title", "عنوان الوظيفة")}</Label><Input value={jobForm.title} onChange={e => setJF("title", e.target.value)} className="mt-1.5" /></div>
              <div><Label>{t("Description", "الوصف")}</Label><Textarea value={jobForm.description} onChange={e => setJF("description", e.target.value)} className="mt-1.5 min-h-[80px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t("Language Pair", "زوج اللغة")}</Label>
                  <Select value={jobForm.languagePair} onValueChange={v => setJF("languagePair", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{["Arabic-English","Arabic-French","Arabic-Spanish"].map(lp => <SelectItem key={lp} value={lp}>{lp}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Mode", "النوع")}</Label>
                  <Select value={jobForm.mode} onValueChange={v => setJF("mode", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="otp">OTP</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="inperson">In-Person</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("Rate Offered", "الراتب المعروض")}</Label><Input value={jobForm.rateOffered} onChange={e => setJF("rateOffered", e.target.value)} placeholder="$50/hr" className="mt-1.5" /></div>
                <div>
                  <Label>{t("Specialty", "التخصص")}</Label>
                  <Select value={jobForm.specialty} onValueChange={v => setJF("specialty", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("Select...", "اختر...")} /></SelectTrigger>
                    <SelectContent>{["Medical","Legal","Social Services","Mental Health","General"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button style={{ background: "#1D9E75" }} className="text-white w-full" onClick={() => createMutation.mutate({ data: jobForm as any })} disabled={!jobForm.title || !jobForm.description || createMutation.isPending}>
                {createMutation.isPending ? t("Posting...", "جارٍ النشر...") : t("Post Job", "نشر الوظيفة")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
