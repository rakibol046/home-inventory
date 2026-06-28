import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { registerUser } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  full_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { full_name: "", email: "", username: "", password: "", confirm_password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (values.password !== values.confirm_password) return;
    setLoading(true);
    try {
      await registerUser({ email: values.email, username: values.username, password: values.password, full_name: values.full_name });
      toast.success("Account created! Welcome.");
      navigate("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Registration failed";
      toast.error(typeof msg === "string" ? msg : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/figma/logo.png" alt="Logo" className="h-10 w-auto filter brightness-0 invert" />
          <span className="text-white text-xl font-bold">Home Inventory</span>
        </div>
        <div className="text-white">
          <h2 className="text-4xl font-bold leading-tight">Track everything you own,<br />from anywhere.</h2>
          <p className="mt-4 text-blue-200">Create your free account and start organizing your home inventory today.</p>
        </div>
        <p className="text-blue-300 text-sm">© 2025 Home Inventory. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-1">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="mb-1 block">Full Name</Label>
              <Input
                placeholder="John Smith"
                {...register("full_name", { required: "Full name is required" })}
              />
              {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">Username</Label>
              <Input
                placeholder="johnsmith"
                {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">Password</Label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label className="mb-1 block">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Repeat password"
                {...register("confirm_password", {
                  required: "Please confirm password",
                  validate: (v) => v === watch("password") || "Passwords don't match",
                })}
              />
              {errors.confirm_password && <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
