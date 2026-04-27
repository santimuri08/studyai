// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Signup failed. Try again.");
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but we couldn't log you in. Try logging in manually.");
        setLoading(false);
        router.push("/login");
        return;
      }

      router.push("/chat");
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title={<>Create your<br/><span className="gradient-text">StudyAI account</span></>}
      subtitle="Takes 20 seconds. Your chats and plans live here."
    >
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Alex Student"
          autoComplete="name"
          autoFocus
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@school.edu"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ marginTop: 6 }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--primary-text)", textDecoration: "none", fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

// ─── Shared layout & fields (also used by /login) ──────────────────────────

export function AuthShell({
  eyebrow, title, subtitle, children,
}: {
  eyebrow:  string;
  title:    React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{
      minHeight:       "100vh",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         "40px 20px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          width:         "100%",
          maxWidth:      420,
          background:    "rgba(255,255,255,0.025)",
          border:        "1px solid var(--border)",
          borderRadius:  "var(--radius-xl)",
          padding:       "36px 32px",
          backdropFilter: "blur(16px)",
          boxShadow:     "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display:      "inline-block",
            fontSize:     11,
            fontWeight:   600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color:        "var(--primary-text)",
            background:   "var(--primary-dim)",
            border:       "1px solid rgba(124,92,255,0.22)",
            borderRadius: 999,
            padding:      "5px 12px",
            marginBottom: 18,
          }}>
            {eyebrow}
          </div>
          <h1 style={{ fontSize: "1.9rem", lineHeight: 1.15, marginBottom: 10 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </main>
  );
}

export function Field({
  label, type, value, onChange, placeholder, autoComplete, autoFocus,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; autoFocus?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: "var(--text-muted)",
        letterSpacing: "0.02em",
        fontFamily: "var(--font-sora), sans-serif",
      }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className="input"
        required
      />
    </label>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      marginTop:    4,
      padding:      "10px 12px",
      fontSize:     13,
      background:   "rgba(239,68,68,0.08)",
      border:       "1px solid rgba(239,68,68,0.24)",
      borderRadius: "var(--radius-sm)",
      color:        "#fca5a5",
    }}>
      {message}
    </div>
  );
}