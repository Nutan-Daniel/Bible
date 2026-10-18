import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  Calendar,
  CloudUpload,
  Home,
  Notebook,
  Search,
  Settings as SettingsIcon,
  Menu,
  Heart,
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/read", label: "Read", icon: BookOpen },
  { to: "/search", label: "Search", icon: Search },
  { to: "/plans", label: "Plans", icon: Calendar },
  { to: "/devotionals", label: "Devotionals", icon: BookOpen },
  { to: "/prayer", label: "Prayer", icon: Heart },
  { to: "/sync", label: "Backup", icon: CloudUpload },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
  { to: "/notes", label: "Notes", icon: Notebook },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  const dark =
    settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const fontClass = settings.fontFamily === "sans" ? "font-sans" : "font-serif";
  const sizeClass =
    settings.fontSize === "sm"
      ? "text-sm"
      : settings.fontSize === "lg"
        ? "text-lg"
        : settings.fontSize === "xl"
          ? "text-xl"
          : "text-base";

  return (
    <div
      className={`min-h-screen ${fontClass} ${sizeClass} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}
    >
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur px-4 py-3">
        <button
          onClick={() => setDrawer((v) => !v)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="font-bold text-lg">
          Bible Reader
        </Link>
        {!online && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Offline
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <SettingsIcon size={20} />
          </Link>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-40" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((n) => {
                const Icon = n.icon;
                const active =
                  location.pathname === n.to ||
                  (n.to !== "/" && location.pathname.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setDrawer(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${active ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    <Icon size={18} /> {n.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur">
        <div className="max-w-3xl mx-auto flex justify-around py-2">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active =
              location.pathname === n.to ||
              (n.to !== "/" && location.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center text-xs ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}
              >
                <Icon size={20} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
