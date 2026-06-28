import { useState } from "react";
import { loginUser } from "../../api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("rakib@home.com");
  const [password, setPassword] = useState("rakib112233");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser({ username, password, rememberMe });
      login(res.token);
      navigate("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 lg:gap-0">
        {/* Left Side - Illustration */}
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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:pl-8">
          {/* Logo and Header */}
          <div className="w-full max-w-md mb-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/assets/figma/logo.png"
                alt="Home Inventory Logo"
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900  text-center">
              Home Inventory
            </h1>
            <p className="text-sm text-slate-500 mt-2  text-center">
              Track and organize your things
            </p>
          </div>

          {/* Form Card */}
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Sign in to your account
            </h2>
            {error && <p className="text-red-700">{error}</p>}

            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pl-4 pr-12 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-4 pr-12 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="w-4 h-4 border border-slate-400"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-700 cursor-pointer font-normal"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary  font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="flex flex-col items-center mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="w-full max-w-md mt-8 pt-4 flex flex-col items-center space-y-3">
            <p className="text-xs text-slate-500">Version 1.2.4</p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-700 transition-colors">
                Help Center
              </a>
              <span className="text-slate-300">•</span>
              <a href="#" className="hover:text-slate-700 transition-colors">
                Privacy Policy
              </a>
              <span className="text-slate-300">•</span>
              <a href="#" className="hover:text-slate-700 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
