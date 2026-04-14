import PublicContent from "@/components/others/public-content";
export default function PublicLayout({ children }: {
    children: React.ReactNode;
}) {
    return <PublicContent>{children}</PublicContent>;
}

