import { useQuery } from "@tanstack/react-query";
import { Package, MapPin, ShieldCheck, DollarSign, Bell } from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchDashboardStats } from "@/api/dashboard.api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading || !data) {
    return (
      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const categoryData = data.items_by_category.map((c, i) => ({
    name: c.name,
    value: c.count,
    fill: c.color ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  const locationData = data.items_by_location.slice(0, 6).map((l, i) => ({
    name: l.name,
    count: l.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your home inventory</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Items" value={data.total_items} iconBg="bg-blue-500" />
        <StatCard icon={MapPin} label="Locations" value={data.total_locations} iconBg="bg-purple-500" />
        <StatCard
          icon={ShieldCheck}
          label="Active Warranties"
          value={data.active_warranties}
          sub={data.expiring_warranties_30d > 0 ? `${data.expiring_warranties_30d} expiring soon` : undefined}
          iconBg="bg-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={`$${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          iconBg="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Items by Category</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Items by Location</h3>
          {locationData.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locationData} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]}>
                  {locationData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {data.recent_activity.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {data.recent_activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="text-slate-500">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
