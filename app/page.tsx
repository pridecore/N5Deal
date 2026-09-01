import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function Home() {
  redirect((await getCurrentUser()) ? "/dashboard" : "/login");
}
