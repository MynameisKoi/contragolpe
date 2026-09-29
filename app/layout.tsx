import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CONTRAGOLPE — Adversarial AI Security Wargame",
  description:
    "CONTRAGOLPE is an interactive AI security wargame that teaches OWASP Top 10 for LLMs through hands-on adversarial challenges including prompt injection, MCP tool poisoning, excessive permissions, and data exfiltration.",
  keywords: [
    "AI security",
    "OWASP LLM",
    "prompt injection",
    "MCP tool poisoning",
    "AI wargame",
    "cybersecurity training",
  ],
  authors: [{ name: "CONTRAGOLPE Security Engineering" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
