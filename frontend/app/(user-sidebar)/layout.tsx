// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import UserContent from "@/components/others/user-content";

// this is layout with user sidebar
export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserContent>{children}</UserContent>;
}
