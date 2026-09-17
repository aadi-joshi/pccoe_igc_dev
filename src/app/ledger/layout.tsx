import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance",
  description: "Which Pune work sites were briefed, and which supervisors confirmed.",
};

export default function LedgerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
