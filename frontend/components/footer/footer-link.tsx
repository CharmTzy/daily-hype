// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { URL } from "@/enums/global-enums";
import Link from "next/link";

export default function FooterLink({ url, label }: { url: URL; label: string }) {
  return (
    <Link className="mt-3 text-slate-500 dark:text-slate-300 cursor-pointer hover:font-medium laptop-3xl:text-large laptop-xl:text-small" href={url}>
      {label}
    </Link>
  );
}
