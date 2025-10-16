import s from "../css.module.css";
import useAuth from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";

function SignOut() {
  const auth = useAuth();
  const router = useRouter();
  const redirect =
    typeof router.query.redirect == "string" ? router.query.redirect : "/";

  useEffect(() => {
    auth.signout().then((res) => {
      if (res.success) {
        toast.success("Signed out successfully");
        router.push(redirect);
      } else {
        if (res.error.toLocaleLowerCase().includes("not logged in")) {
          toast.success("You are already signed out");
          router.push(redirect);
          return;
        }
        toast.error(res.error || "Failed to sign out");
      }
    });
  }, [redirect]);

  return (
    <>
      <h1 className="text-3xl pb-4">Signing Out</h1>
      <div className="flex items-center gap-2">
        <Spinner />
        <div>Give us a moment, signing you out...</div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className={s.wrp}>
      <div className={s.card}>
        <SignOut />
      </div>
    </div>
  );
}
