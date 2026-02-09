import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const cookieStore = await cookies();
  
  if (cookieStore.get("admin_token")) {
    redirect("/admin/dashboard");
  } else {
    redirect("/admin/login");
  }
}

