import { redirect } from "next/navigation";

export default function HomePage() {
  // Sprint 1: sin auth, mandamos directo al dashboard.
  // Cuando metamos Stack Auth, acá decidimos según session: landing o dashboard.
  redirect("/dashboard");
}
