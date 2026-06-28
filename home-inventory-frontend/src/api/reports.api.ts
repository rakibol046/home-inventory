import { api } from "./client";

export const fetchReportsSummary = async () => {
  const { data } = await api.get("/v1/reports/summary");
  return data;
};
