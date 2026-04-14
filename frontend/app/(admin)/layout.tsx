import AdminContent from "@/components/others/admin-content";
export default function AdminLayout({ children }: {
    children: React.ReactNode;
}) {
    return <AdminContent>{children}</AdminContent>;
}

