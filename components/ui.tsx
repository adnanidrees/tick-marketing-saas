import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-black/10 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-base font-semibold ${className}`}>{children}</div>;
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm text-black/70 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 pt-2 ${className}`}>{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-black/90"
      : variant === "outline"
      ? "border border-black/10 bg-white hover:bg-black/5"
      : "bg-transparent hover:bg-black/5";
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30 ${props.className || ""}`}
    />
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs ${className}`}>{children}</span>;
}

export function Divider() {
  return <div className="h-px w-full bg-black/10" />;
}
