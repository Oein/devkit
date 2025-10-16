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
        toast.success("성공적으로 로그아웃되었습니다");
        router.push(redirect);
      } else {
        if (res.error == "로그인되어 있지 않습니다.") {
          toast.success("이미 로그아웃된 상태입니다");
          router.push(redirect);
          return;
        }
        toast.error(res.error || "로그아웃에 실패했습니다");
      }
    });
  }, [redirect]);

  return (
    <>
      <h1 className="text-3xl pb-4">로그아웃 중</h1>
      <div className="flex items-center gap-2">
        <Spinner />
        <div>잠시만 기다려 주세요, 로그아웃 처리 중입니다...</div>
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
