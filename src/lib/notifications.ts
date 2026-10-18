import type { Settings } from "../db";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function isNotificationGranted(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

export function showDailyNotification(
  settings: Settings,
  verseText: string,
  verseRef: string,
): void {
  if (!settings.notificationsEnabled) return;
  if (!isNotificationGranted()) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (settings.lastNotificationDate === today) return;

  const [hours, minutes] = settings.notificationTime.split(":").map(Number);
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  if (nowHours < hours || (nowHours === hours && nowMinutes < minutes)) return;

  new Notification("Bible Reader — Daily Verse", {
    body: `“${verseText}” — ${verseRef}`,
    icon: "/favicon.ico",
    tag: "daily-verse",
  });
}

export function markNotificationShown(settings: Settings): Settings {
  return {
    ...settings,
    lastNotificationDate: new Date().toISOString().slice(0, 10),
  };
}
