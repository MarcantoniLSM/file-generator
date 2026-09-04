"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/app/auth/actions";

type AuthFormProps = {
  mode: "login" | "signup";
  error?: string;
};

const initialState = { message: "" };

export default function AuthForm({ mode, error }: AuthFormProps) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10 text-ink">
      <section className="w-full max-w-md border border-line bg-white">
        <div className="border-b border-line px-6 py-5">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-civic">Acesso institucional</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">
            {mode === "login" ? "Entrar na plataforma" : "Criar usuário"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mode === "login"
              ? "Acesse a área interna para gerar, revisar e administrar documentos."
              : "Cadastre um novo usuário para acessar a área interna."}
          </p>
        </div>

        <form
          action={isLogin ? "/auth/sign-in" : formAction}
          method={isLogin ? "post" : undefined}
          className="space-y-4 px-6 py-6"
        >
          {mode === "signup" ? (
            <label className="block">
              <span className="text-sm font-semibold">Nome completo</span>
              <input
                name="full_name"
                autoComplete="name"
                className="mt-2 w-full border border-line px-3 py-2 text-sm outline-none focus:border-civic"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="mt-2 w-full border border-line px-3 py-2 text-sm outline-none focus:border-civic"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Senha</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              className="mt-2 w-full border border-line px-3 py-2 text-sm outline-none focus:border-civic"
              required
            />
          </label>

          {error === "configuracao" ? (
            <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Supabase ainda não foi configurado neste ambiente.
            </p>
          ) : null}
          {error === "bloqueado" ? (
            <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Seu acesso está bloqueado. Procure o administrador.
            </p>
          ) : null}
          {error === "credenciais" ? (
            <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Não foi possível entrar. Verifique email e senha.
            </p>
          ) : null}
          {!isLogin && state?.message ? (
            <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{state.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 bg-civic px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {pending ? <Loader2 className="animate-spin" size={18} /> : null}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>

          <div className="flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              Voltar ao site
            </Link>
            <Link href={mode === "login" ? "/cadastro" : "/login"} className="font-semibold text-civic">
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
