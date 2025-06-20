import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Ghaliah Sales CRM",
  description: "Learn more about Ghaliah Sales CRM and our mission to transform sales processes.",
}

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
} 
