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
       <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 rounded-lg p-12 min-h-96">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10 overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-white" />
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src="/assets/figma/illustration.png"
              alt="Organize Everything"
              className="w-full max-w-sm h-auto object-contain mb-8"
            />
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                Organize Everything
              </h2>
              <p className="text-base text-slate-600 max-w-md leading-relaxed">
                Keep track of your belongings, warranties, and important
                documents all in one secure place.
              </p>
            </div>
          </div>
        </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8">
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
