import { URL } from "@/enums/global-enums";
import clsx from "clsx";
import Link from "next/link";

export default function HeaderNavLink({ url, active, label }: { url: URL; active: boolean; label: string }) {
  return (
    <Link href={url} className={clsx("text-small ms-7 cursor-pointer hover:font-medium hover:text-black laptop-3xl:text-large laptop-2xl:ms-7 laptop-xl:ms-6", active && "text-black font-medium dark:text-white", !active && "text-slate-500 dark:text-slate-300")}>
      {label}
    </Link>
  );
}
