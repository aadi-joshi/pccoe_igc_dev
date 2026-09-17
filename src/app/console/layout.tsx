import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supervisor console",
  description: "Today's occupational heat plan for a Pune work site.",
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
