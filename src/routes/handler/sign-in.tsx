import { createFileRoute } from "@tanstack/react-router";
import { CustomSignInPage } from "@/components/auth/custom-sign-in-page";

export const Route = createFileRoute("/handler/sign-in")({
  ssr: false,
  component: CustomSignInPage,
});
