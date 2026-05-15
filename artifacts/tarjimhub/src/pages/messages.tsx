import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  useGetConversations, getGetConversationsQueryKey,
  useGetMessages, getGetMessagesQueryKey,
  useSendMessage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (!user) { setLocation("/login"); return null; }

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: convsLoading } = useGetConversations({
    query: { queryKey: getGetConversationsQueryKey(), refetchInterval: 3000 },
  });

  const { data: messages } = useGetMessages(
    selectedUserId!,
    { query: { enabled: !!selectedUserId, queryKey: getGetMessagesQueryKey(selectedUserId!), refetchInterval: 3000 } }
  );

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        setMessageText("");
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(selectedUserId!) });
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations?.find((c: any) => c.userId === selectedUserId);

  const handleSend = () => {
    if (!messageText.trim() || !selectedUserId) return;
    sendMutation.mutate({ data: { receiverId: selectedUserId, content: messageText } });
  };

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("Messages", "الرسائل")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white" style={{ height: "calc(100vh - 220px)" }}>
          {/* Conversation list */}
          <div className="border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="font-semibold text-gray-700 text-sm">{t("Conversations", "المحادثات")}</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convsLoading && (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="flex gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-3 w-40" /></div></div>)}
                </div>
              )}
              {conversations?.map((conv: any) => {
                const initials = conv.userName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                const active = selectedUserId === conv.userId;
                return (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full flex items-center gap-3 p-4 border-b border-gray-100 text-left transition-colors hover:bg-gray-50 ${active ? "bg-teal-50 border-l-2 border-l-teal-500" : ""}`}
                    data-testid={`conv-${conv.userId}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-xs font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      {conv.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800 text-sm truncate">{conv.userName}</p>
                        {conv.unreadCount > 0 && <Badge className="text-xs ml-1" style={{ background: "#1D9E75", color: "white", border: "none" }}>{conv.unreadCount}</Badge>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                );
              })}
              {conversations?.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">{t("No conversations yet", "لا توجد محادثات بعد")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat window */}
          <div className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedUserId && selectedConv ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-xs font-bold">
                      {selectedConv.userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{selectedConv.userName}</p>
                    <p className="text-xs text-gray-400">{selectedConv.isOnline ? t("Online", "متصل") : t("Offline", "غير متصل")}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages?.map((msg: any) => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        data-testid={`msg-${msg.id}`}
                      >
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`} style={isMine ? { background: "#1D9E75" } : {}}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-gray-400"}`}>{new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder={t("Type a message...", "اكتب رسالة...")}
                      className="flex-1"
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      data-testid="input-message"
                    />
                    <Button onClick={handleSend} disabled={!messageText.trim() || sendMutation.isPending} style={{ background: "#1D9E75" }} className="text-white px-4" data-testid="button-send">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#1D9E7515" }}>
                    <Send className="w-7 h-7" style={{ color: "#1D9E75" }} />
                  </div>
                  <p className="text-gray-500 font-medium">{t("Select a conversation", "اختر محادثة")}</p>
                  <p className="text-gray-400 text-sm mt-1">{t("to start messaging", "لبدء المراسلة")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
