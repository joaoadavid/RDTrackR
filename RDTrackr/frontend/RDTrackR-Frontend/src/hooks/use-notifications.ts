// src/hooks/use-notifications.ts
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import * as signalR from "@microsoft/signalr";

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  async function load() {
    try {
      const result = await api.notifications();

      const mapped: Notification[] = result.map((n) => ({
        id: n.id!,
        message: n.message ?? "",
        isRead: n.isRead ?? false,
        createdAt: n.createdAt ?? new Date(),
      }));

      setNotifications(mapped);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number) {
    await api.read(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllAsRead() {
    if (notifications.length === 0) return;

    await Promise.all(notifications.map((n) => api.read(n.id)));

    setNotifications([]);
  }

  useEffect(() => {
    load();

    const token = localStorage.getItem("accessToken");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://api.rdtrackr.com.br/hub/notifications", {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => console.log("🔌 SignalR conectado"))
      .catch((err) => console.error("Erro na conexão SignalR:", err));

    // Evento recebido do backend
    connection.on("ReceiveNotification", (data: any) => {
      console.log("📩 Nova notificação recebida:", data);

      const newNotification: Notification = {
        id: data.id,
        message: data.message,
        isRead: false,
        createdAt: new Date(data.createdAt),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      connection.stop();
    };
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    loading,
    markAsRead,
    markAllAsRead,
    reload: load,
  };
}
