// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthShell, Field, ErrorBox } from "@/app/signup/page";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/chat";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={<>Log in to<br/><span className="gradient-text">StudyAI</span></>}
      subtitle="Pick up your chats and plans where you left off."
    >
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@school.edu"
          autoComplete="email"
          autoFocus
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
        />

        {error && <ErrorBox message={error} />}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 6 }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
        New here?{" "}
        <Link href="/signup" style={{ color: "var(--primary-text)", textDecoration: "none", fontWeight: 600 }}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}