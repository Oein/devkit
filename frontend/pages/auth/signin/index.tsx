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
          toast.error("You must provide your ID");
          return;
        }
        if (!password) {
          toast.error("You must provide your password");
          return;
        }
        setLoading(true);
        auth.signin({ username: id, password }).then((res) => {
          setLoading(false);
          if (res.success) {
            toast.success("Signed in successfully");
            router.push(redirect);
          } else {
            toast.error(res.error || "Failed to sign up");
          }
        });
      }}
    >
      <FieldSet>
        <FieldLegend>Sign In</FieldLegend>
        <FieldDescription>Log in to your account</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="id">ID</FieldLabel>
            <Input
              id="id"
              type="text"
              placeholder="ID"
              value={id}
              onChange={(e) => setId(e.currentTarget.value)}
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
          Don't have an account?{" "}
          <a
            href={`/auth/signup?redirect=${encodeURIComponent(redirect)}`}
            className="text-blue-400 hover:underline"
          >
            Sign up here
          </a>
        </FieldDescription>

        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : null}
            Sign in
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
