import { useQuery } from "@tanstack/react-query";
import { Download, BarChart2 } from "lucide-react";
import { fetchReportsSummary } from "@/api/reports.api";
import { exportItems } from "@/api/items.api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { data, isLoading } = useQuery({ queryKey: ["reports", "summary"], queryFn: fetchReportsSummary });

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reports</h2>
          <Button variant="outline" onClick={exportItems}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        {isLoading || !data ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Items", value: data.total_items ?? 0 },
                { label: "Total Value", value: `$${(data.total_value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                { label: "Active Warranties", value: data.active_warranties ?? 0 },
                { label: "Total Locations", value: data.total_locations ?? 0 },
              ].map((s) => (
                <Card key={s.label} className="p-5">
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Categories breakdown */}
            {data.items_by_category?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-slate-400" /> Items by Category
                </h3>
                <div className="space-y-3">
                  {data.items_by_category.map((c: { name: string; count: number; color: string | null }) => {
                    const pct = data.total_items > 0 ? Math.round((c.count / data.total_items) * 100) : 0;
                    return (
                      <div key={c.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{c.name}</span>
                          <span className="text-slate-500">{c.count} items ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: c.color ?? "#3B82F6" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Locations breakdown */}
            {data.items_by_location?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-slate-400" /> Items by Location
                </h3>
                <div className="space-y-3">
                  {data.items_by_location.map((l: { name: string; count: number }) => {
                    const pct = data.total_items > 0 ? Math.round((l.count / data.total_items) * 100) : 0;
                    return (
                      <div key={l.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{l.name}</span>
                          <span className="text-slate-500">{l.count} items ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
