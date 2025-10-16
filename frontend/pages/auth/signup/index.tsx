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

function SignUp() {
  const auth = useAuth();

  const [loading, setLoading] = useState(false);

  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
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

        if (!id || id.length < 4) {
          toast.error("ID는 최소 4자 이상이어야 합니다");
          return;
        }
        if (!nickname || nickname.length < 2) {
          toast.error("닉네임은 최소 2자 이상이어야 합니다");
          return;
        }
        if (!password || password.length < 4) {
          toast.error("비밀번호는 최소 4자 이상이어야 합니다");
          return;
        }
        setLoading(true);
        auth.signup({ username: id, nickname, password }).then((res) => {
          setLoading(false);
          if (res.success) {
            toast.success("성공적으로 회원가입되었습니다");
            router.push(redirect);
          } else {
            toast.error(res.error || "회원가입에 실패했습니다");
          }
        });
      }}
    >
      <FieldSet>
        <FieldLegend>회원가입</FieldLegend>
        <FieldDescription>새 계정을 등록하세요</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="id">아이디</FieldLabel>
            <FieldDescription>로그인에 사용할 아이디</FieldDescription>
            <Input
              id="id"
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nickname">닉네임</FieldLabel>
            <FieldDescription>표시 이름으로 사용할 닉네임</FieldDescription>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.currentTarget.value)}
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
          이미 계정이 있으신가요?{" "}
          <a
            href={`/auth/signin?redirect=${encodeURIComponent(redirect)}`}
            className="text-blue-400 hover:underline"
          >
            여기에서 로그인하세요
          </a>
        </FieldDescription>

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : null}
            회원가입
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
        <SignUp />
      </div>
    </div>
  );
}
