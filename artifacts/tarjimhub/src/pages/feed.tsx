import { useState } from "react";
import { useLocation } from "wouter";
import {
  useGetFeed, getGetFeedQueryKey,
  useCreatePost,
  useLikePost,
  useGetPostComments, getGetPostCommentsQueryKey,
  useAddComment,
  useGetTrendingTopics, getGetTrendingTopicsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, TrendingUp } from "lucide-react";

const SPECIALTIES = ["", "Medical", "Legal", "Social Services", "Mental Health", "General"];

function PostCard({ post }: { post: any }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const likeMutation = useLikePost({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() }),
      onError: () => toast({ title: t("Failed", "فشل"), variant: "destructive" }),
    },
  });

  const addCommentMutation = useAddComment({
    mutation: {
      onSuccess: () => { setCommentText(""); queryClient.invalidateQueries({ queryKey: getGetPostCommentsQueryKey(post.id) }); },
    },
  });

  const { data: comments } = useGetPostComments(post.id, {
    query: { enabled: showComments, queryKey: getGetPostCommentsQueryKey(post.id) },
  });

  const initials = post.userName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <Card className="hover:shadow-sm transition-shadow" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 text-sm">{post.userName || t("Anonymous", "مجهول")}</p>
              {post.userRole && <Badge variant="secondary" className="text-xs capitalize">{post.userRole}</Badge>}
              {post.specialty && <Badge className="text-xs" style={{ background: "#1D9E7520", color: "#1D9E75", border: "none" }}>{post.specialty}</Badge>}
            </div>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <p className="text-gray-800 text-sm leading-relaxed mb-2">{post.content}</p>
        {post.contentAr && lang === "ar" && (
          <p className="text-gray-700 text-sm leading-relaxed mb-2 font-arabic border-t border-gray-100 pt-2 mt-2" dir="rtl">{post.contentAr}</p>
        )}

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => likeMutation.mutate({ id: post.id })}
            className={`flex items-center gap-1.5 text-sm transition-colors ${post.likedByMe ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
            data-testid={`button-like-${post.id}`}
          >
            <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-current" : ""}`} />
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(s => !s)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            data-testid={`button-comments-${post.id}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount} {t("comments", "تعليقات")}</span>
          </button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                {comments?.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-xs">{c.userName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                      <p className="text-xs font-medium text-gray-700">{c.userName}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))}
                {user && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder={t("Add a comment...", "أضف تعليقاً...")}
                      className="text-sm h-9"
                      onKeyDown={e => { if (e.key === "Enter" && commentText.trim()) addCommentMutation.mutate({ id: post.id, data: { content: commentText } }); }}
                    />
                    <Button size="sm" style={{ background: "#1D9E75" }} className="text-white h-9" onClick={() => addCommentMutation.mutate({ id: post.id, data: { content: commentText } })} disabled={!commentText.trim() || addCommentMutation.isPending}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) { setLocation("/login"); return null; }

  const [content, setContent] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [filterSpec, setFilterSpec] = useState("");

  const { data: feed, isLoading } = useGetFeed(filterSpec ? { specialty: filterSpec } : undefined, { query: { queryKey: getGetFeedQueryKey(filterSpec ? { specialty: filterSpec } : undefined) } });
  const { data: trending } = useGetTrendingTopics({ query: { queryKey: getGetTrendingTopicsQueryKey() } });

  const createPost = useCreatePost({
    mutation: {
      onSuccess: () => { setContent(""); setContentAr(""); queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() }); toast({ title: t("Posted!", "تم النشر!") }); },
      onError: () => toast({ title: t("Failed", "فشل"), variant: "destructive" }),
    },
  });

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <h1 className="text-2xl font-bold text-gray-900">{t("Community Feed", "منشورات المجتمع")}</h1>

          {/* Create post */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={t("Share something with the community...", "شارك شيئاً مع المجتمع...")}
                    className="min-h-[90px] resize-none text-sm"
                    data-testid="textarea-post"
                  />
                  <Textarea
                    value={contentAr}
                    onChange={e => setContentAr(e.target.value)}
                    placeholder={t("Arabic version (optional)...", "النسخة العربية (اختياري)...")}
                    className="min-h-[60px] resize-none text-sm"
                    dir="rtl"
                    data-testid="textarea-post-ar"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder={t("Category", "الفئة")} /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.filter(s => s).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button style={{ background: "#1D9E75" }} className="text-white h-8 text-sm" onClick={() => createPost.mutate({ data: { content, contentAr: contentAr || undefined, specialty: specialty || undefined } })} disabled={!content.trim() || createPost.isPending} data-testid="button-post">
                      <Send className="w-3.5 h-3.5 mr-1.5" />{t("Post", "نشر")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {["", ...SPECIALTIES.filter(s => s)].map(s => (
              <button key={s} onClick={() => setFilterSpec(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterSpec === s ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} style={filterSpec === s ? { background: "#1D9E75" } : {}}>
                {s || t("All", "الكل")}
              </button>
            ))}
          </div>

          {/* Feed */}
          {isLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          <div className="space-y-4">
            {feed?.map((post: any) => <PostCard key={post.id} post={post} />)}
          </div>
          {feed?.length === 0 && <p className="text-gray-400 text-center py-16">{t("No posts yet. Be the first!", "لا توجد منشورات بعد. كن الأول!")}</p>}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: "#1D9E75" }} />{t("Trending", "الأكثر تداولاً")}
              </h3>
              {trending?.map((topic: any) => (
                <button key={topic.topic} onClick={() => setFilterSpec(topic.topic)} className="w-full flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded px-1">
                  <span className="text-sm font-medium text-gray-700">#{topic.topic}</span>
                  <span className="text-xs text-gray-400">{topic.count}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
