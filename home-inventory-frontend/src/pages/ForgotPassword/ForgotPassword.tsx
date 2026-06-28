import { useState } from "react";
import { Link } from "react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-6 mx-auto">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center">Forgot password?</h1>
        <p className="text-slate-500 text-sm text-center mt-2 mb-6">
          Enter your email address and we'll send you a reset link.
        </p>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-sm text-green-700">
            If an account exists for <strong>{email}</strong>, you'll receive a password reset email shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email address</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!email}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
