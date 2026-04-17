import { URL } from "@/enums/global-enums";
import clsx from "clsx";
import Link from "next/link";
export default function SideBarLink({ label, url, active }: {
    label: string;
    url: URL;
    active: boolean;
}) {
    return (<Link className={clsx("text-small indent-3 font-normal text-slate-800 mt-1 mb-3", active && "font-semibold")} href={url}>
      {label}
    </Link>);
}

