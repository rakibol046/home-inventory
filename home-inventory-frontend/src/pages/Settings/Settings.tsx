import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { fetchSettings, updateSettings } from "@/api/settings.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormValues {
  currency: string;
  timezone: string;
  date_format: string;
  language: string;
  warranty_alert_days: string;
}

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { currency: "USD", timezone: "UTC", date_format: "MM/DD/YYYY", language: "en", warranty_alert_days: "30" },
  });

  useEffect(() => {
    if (data) {
      reset({
        currency: data.currency,
        timezone: data.timezone,
        date_format: data.date_format,
        language: data.language,
        warranty_alert_days: String(data.warranty_alert_days),
      });
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: (v: FormValues) => updateSettings({
      currency: v.currency,
      timezone: v.timezone,
      date_format: v.date_format,
      language: v.language,
      warranty_alert_days: Number(v.warranty_alert_days),
    }),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: () => toast.error("Failed to save settings"),
  });

  const onSubmit = (values: FormValues) => updateMutation.mutate(values);

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <h2 className="text-2xl font-bold">Settings</h2>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="space-y-4 max-w-2xl">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : (
          <Tabs defaultValue="preferences" className="max-w-2xl">
            <TabsList className="mb-6">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences">
              <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <Label className="mb-1 block">Currency</Label>
                    <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Timezone</Label>
                    <Select value={watch("timezone")} onValueChange={(v) => setValue("timezone", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[
                          "UTC", "America/New_York", "America/Chicago", "America/Denver",
                          "America/Los_Angeles", "Europe/London", "Europe/Paris",
                          "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney",
                        ].map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Date Format</Label>
                    <Select value={watch("date_format")} onValueChange={(v) => setValue("date_format", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Language</Label>
                    <Select value={watch("language")} onValueChange={(v) => setValue("language", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "en", label: "English" },
                          { value: "es", label: "Español" },
                          { value: "fr", label: "Français" },
                          { value: "de", label: "Deutsch" },
                        ].map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <Label className="mb-1 block">Warranty Alert (days before expiry)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      {...register("warranty_alert_days", {
                        min: { value: 1, message: "Minimum 1 day" },
                        max: { value: 365, message: "Maximum 365 days" },
                      })}
                    />
                    {errors.warranty_alert_days && (
                      <p className="text-xs text-destructive mt-1">{errors.warranty_alert_days.message}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      You'll be notified this many days before a warranty expires.
                    </p>
                  </div>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
