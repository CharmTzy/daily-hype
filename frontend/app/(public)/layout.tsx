import PublicContent from "@/components/others/public-content";
export default function Layout({ children }: {
    children: React.ReactNode;
}) {
    return <PublicContent>{children}</PublicContent>;
}

