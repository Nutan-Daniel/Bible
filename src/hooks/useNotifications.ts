import { useCallback, useEffect, useState } from "react";
import { db } from "../db";
import type { Settings } from "../db";
import {
  isNotificationGranted,
  requestNotificationPermission,
} from "../lib/notifications";

export function useNotifications(
  settings: Settings,
  verseText: string,
  verseRef: string,
) {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    isNotificationGranted() ? Notification.permission : null,
  );

  useEffect(() => {
    if (!settings.notificationsEnabled || !isNotificationGranted()) return;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (settings.lastNotificationDate === today) return;
    const [hours, minutes] = settings.notificationTime.split(":").map(Number);
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    if (nowHours < hours || (nowHours === hours && nowMinutes < minutes))
      return;
    new Notification("Bible Reader — Daily Verse", {
      body: `“${verseText}” — ${verseRef}`,
      icon: "/favicon.ico",
      tag: "daily-verse",
    });
    void db.settings.update(settings.id!, {
      lastNotificationDate: today,
    });
  }, [settings, verseText, verseRef]);

  const enableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    if (granted) {
      await db.settings.update(settings.id!, {
        notificationsEnabled: true,
      });
    }
  }, [settings.id]);

  const disableNotifications = useCallback(async () => {
    setPermission("denied");
    await db.settings.update(settings.id!, {
      notificationsEnabled: false,
    });
  }, [settings.id]);

  const setNotificationTime = useCallback(
    async (time: string) => {
      await db.settings.update(settings.id!, {
        notificationTime: time,
      });
    },
    [settings.id],
  );

  return {
    permission,
    isEnabled: settings.notificationsEnabled,
    notificationTime: settings.notificationTime,
    enableNotifications,
    disableNotifications,
    setNotificationTime,
  };
}
