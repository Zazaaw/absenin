import { Suspense } from "react";
import { AuthForm } from "@/components/app/auth-form";

export const metadata = { title: "Daftar" };
export default function RegisterPage() {
  return <Suspense><AuthForm mode="register" /></Suspense>;
}
