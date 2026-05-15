import { Link, useLocation } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen, Briefcase, MessageSquare, Rss, Settings, Home, LogOut, User, Menu, X, Languages
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/dashboard", icon: Home, en: "Dashboard", ar: "الرئيسية" },
  { href: "/glossary", icon: BookOpen, en: "Glossary", ar: "المعجم" },
  { href: "/tools", icon: Settings, en: "Tools", ar: "الأدوات" },
  { href: "/jobs", icon: Briefcase, en: "Jobs", ar: "الوظائف" },
  { href: "/feed", icon: Rss, en: "Feed", ar: "المنشورات" },
  { href: "/messages", icon: MessageSquare, en: "Messages", ar: "الرسائل" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { t, toggleLang, lang, isRTL } = useLang();
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1D9E75" }}>
                  <span className="text-white font-bold text-sm">ت</span>
                </div>
                <span className="font-bold text-gray-900 text-lg">
                  {lang === "ar" ? "ترجيم هاب" : "TarjimHub"}
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      style={active ? { background: "#1D9E75" } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      {t(link.en, link.ar)}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                data-testid="lang-toggle"
              >
                <Languages className="w-4 h-4" />
                {lang === "en" ? "عربي" : "EN"}
              </button>

              {/* User menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors" data-testid="user-menu">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ background: "#1D9E75", color: "white" }} className="text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {lang === "ar" && user.nameAr ? user.nameAr : user.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                    <DropdownMenuItem onClick={() => setLocation(`/profile/${user.id}`)}>
                      <User className="w-4 h-4 mr-2" />
                      {t("My Profile", "ملفي الشخصي")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/profile/edit")}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t("Edit Profile", "تعديل الملف")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("Sign Out", "تسجيل الخروج")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = location.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href}>
                      <button
                        onClick={() => setMobileOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          active ? "text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                        style={active ? { background: "#1D9E75" } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        {t(link.en, link.ar)}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
