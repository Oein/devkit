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
          toast.error("ID must be at least 4 characters long");
          return;
        }
        if (!nickname || nickname.length < 2) {
          toast.error("Nickname must be at least 2 characters long");
          return;
        }
        if (!password || password.length < 4) {
          toast.error("Password must be at least 4 characters long");
          return;
        }
        setLoading(true);
        auth.signup({ username: id, nickname, password }).then((res) => {
          setLoading(false);
          if (res.success) {
            toast.success("Signed up successfully");
            router.push(redirect);
          } else {
            toast.error(res.error || "Failed to sign up");
          }
        });
      }}
    >
      <FieldSet>
        <FieldLegend>Sign Up</FieldLegend>
        <FieldDescription>Register a new account</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="id">ID</FieldLabel>
            <FieldDescription>ID for signing in</FieldDescription>
            <Input
              id="id"
              type="text"
              placeholder="ID"
              value={id}
              onChange={(e) => setId(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
            <FieldDescription>Nickname for your display name</FieldDescription>
            <Input
              id="nickname"
              type="text"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.currentTarget.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          </Field>
        </FieldGroup>

        <FieldDescription>
          Already have an account?{" "}
          <a
            href={`/auth/signin?redirect=${encodeURIComponent(redirect)}`}
            className="text-blue-400 hover:underline"
          >
            Sign in here
          </a>
        </FieldDescription>

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : null}
            Sign up
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
