import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/actions";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    if (!cookieStore.get("admin_token")) {
        redirect("/admin");
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black p-6 flex flex-col hidden md:flex">
                <div className="text-xl font-bold tracking-widest text-brand-yellow mb-10">
                    ADMIN
                </div>

                <nav className="space-y-4 flex-1">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/admin/dashboard/content" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <Settings size={20} />
                        Site Content
                    </Link>
                </nav>

                <form action={logout}>
                    <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full text-left">
                        <LogOut size={20} />
                        Logout
                    </button>
                </form>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
