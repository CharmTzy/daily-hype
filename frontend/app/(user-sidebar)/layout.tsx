import UserContent from "@/components/others/user-content";
export default function Layout({ children }: {
    children: React.ReactNode;
}) {
    return <UserContent>{children}</UserContent>;
}

