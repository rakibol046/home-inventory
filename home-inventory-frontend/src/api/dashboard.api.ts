import { api } from "./client";
import type { DashboardStats, Notification, PaginatedResponse } from "@/types";

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/v1/dashboard/stats");
  return data;
};

export const fetchNotifications = async (params?: {
  unread_only?: boolean;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Notification>> => {
  const { data } = await api.get("/v1/notifications", { params });
  return data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/v1/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.post("/v1/notifications/read-all");
};
