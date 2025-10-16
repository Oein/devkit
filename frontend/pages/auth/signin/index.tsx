import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import s from "../css.module.css";
import useAuth from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { ArrowRight } from "lucide-react";

function SignIn() {
  const auth = useAuth();

  const [loading, setLoading] = useState(false);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const redirect =
    typeof router.query.redirect == "string" ? router.query.redirect : "/";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;

        if (!id) {
          toast.error("아이디를 입력해주세요");
          return;
        }
        if (!password) {
          toast.error("비밀번호를 입력해주세요");
          return;
        }
        setLoading(true);
        auth.signin({ username: id, password }).then((res) => {
          setLoading(false);
          if (res.success) {
            toast.success("로그인에 성공했습니다");
            router.push(redirect);
          } else {
            toast.error(res.error || "로그인에 실패했습니다");
          }
        });
      }}
    >
      <FieldSet>
        <FieldLegend>로그인</FieldLegend>
        <FieldDescription>계정에 로그인하세요</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="id">아이디</FieldLabel>
            <Input
              id="id"
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">비밀번호</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </Field>
        </FieldGroup>

        <FieldDescription>
          계정이 없으신가요?{" "}
          <a
            href={`/auth/signup?redirect=${encodeURIComponent(redirect)}`}
            className="text-blue-400 hover:underline"
          >
            여기에서 가입하세요
          </a>
        </FieldDescription>

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : null}
            로그인
            <ArrowRight />
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
}

export default function AuthPage() {
  return (
    <div className={s.wrp}>
      <div className={s.card}>
        <SignIn />
      </div>
    </div>
  );
}
