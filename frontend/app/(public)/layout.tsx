// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import PublicContent from "@/components/others/public-content";

// this is layout without user sidebar
export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicContent>{children}</PublicContent>;
}
