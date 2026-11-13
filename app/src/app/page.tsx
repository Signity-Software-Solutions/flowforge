import { DEMO_MODE } from "@/lib/demo/config";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function Home() {
  if (DEMO_MODE) redirect("/dashboard");
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard");
}
