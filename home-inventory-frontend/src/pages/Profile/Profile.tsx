import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User } from "lucide-react";

import { getMe, updateMe } from "@/api/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormValues {
  full_name: string;
  avatar_url: string;
}

export default function Profile() {
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { full_name: "", avatar_url: "" },
  });

  useEffect(() => {
    if (user) reset({ full_name: user.full_name ?? "", avatar_url: user.avatar_url ?? "" });
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["me"] }); },
    onError: () => toast.error("Failed to update profile"),
  });

  const onSubmit = (values: FormValues) =>
    updateMutation.mutate({ full_name: values.full_name, avatar_url: values.avatar_url || undefined });

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <h2 className="text-2xl font-bold">Profile</h2>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="max-w-lg space-y-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <Card className="max-w-lg p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900 text-lg">{user?.full_name || user?.username}</p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <p className="text-slate-400 text-xs mt-0.5">@{user?.username}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p className="text-slate-900 mt-0.5">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Username</p>
                <p className="text-slate-900 mt-0.5">@{user?.username}</p>
              </div>
              <div>
                <Label className="mb-1 block">Full Name</Label>
                <Input
                  placeholder="Your full name"
                  {...register("full_name", { required: "Name is required" })}
                />
                {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <Label className="mb-1 block">Avatar URL</Label>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...register("avatar_url")}
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
