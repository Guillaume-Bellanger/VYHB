import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z
  .object({
    password: z.string().min(8, "Minimum 8 caractères"),
    confirm: z.string().min(8, "Minimum 8 caractères"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

type CallbackType = "invite" | "recovery" | "magiclink" | null;

function detectType(): CallbackType {
  // Implicit flow : tokens dans le hash
  const hash = new URLSearchParams(window.location.hash.substring(1));
  // PKCE flow : type dans les query params
  const query = new URLSearchParams(window.location.search);
  const t = hash.get("type") || query.get("type");
  if (t === "invite" || t === "recovery" || t === "magiclink") return t;
  return null;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [type] = useState<CallbackType>(detectType);
  const [sessionReady, setSessionReady] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    console.log('[callback] hash:', window.location.hash);
    console.log('[callback] search:', window.location.search);
    console.log('[callback] href:', window.location.href);

    const searchParams = new URLSearchParams(window.location.search);
    const tokenHash = searchParams.get('token_hash');
    const tokenType = searchParams.get('type') as 'invite' | 'recovery' | 'magiclink' | null;

    if (tokenHash && tokenType) {
      // Flow PKCE : token_hash dans les query params (recovery, invite récents)
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: tokenType })
        .then(({ error }) => {
          if (error) setServerError(error.message);
          else setSessionReady(true);
        });
      return;
    }

    // Flow implicite : tokens dans le hash (invitations anciennes)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "SIGNED_IN" ||
          event === "PASSWORD_RECOVERY" ||
          event === "USER_UPDATED")
      ) {
        setSessionReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async ({ password }: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setServerError(error.message);
      return;
    }
    navigate("/admin/dashboard", { replace: true });
  };

  const isPasswordFlow = type !== null;

  const title =
    type === "invite" ? "Définir votre mot de passe" : "Nouveau mot de passe";
  const description =
    type === "invite"
      ? "Bienvenue ! Choisissez un mot de passe pour accéder à l'espace admin."
      : "Choisissez un nouveau mot de passe pour votre compte.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-black text-white font-display">
            Val d'Yerres <span className="text-orange-500">Handball</span>
          </p>
          <p className="text-white/40 text-sm mt-1">Espace administration</p>
        </div>

        <Card className="bg-white/[0.04] border-white/[0.08] text-white">
          {!isPasswordFlow ? (
            <>
              <CardHeader>
                <CardTitle className="text-white">Lien invalide</CardTitle>
                <CardDescription className="text-white/40">
                  Ce lien est expiré ou incorrect. Demandez un nouvel envoi à
                  l'administrateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-white/70 hover:text-white"
                  onClick={() => navigate("/admin/login")}
                >
                  Retour à la connexion
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-white">{title}</CardTitle>
                <CardDescription className="text-white/40">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!sessionReady ? (
                  <p className="text-white/50 text-sm text-center py-4">
                    Initialisation de la session…
                  </p>
                ) : (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-white/70">
                        Nouveau mot de passe
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                        {...register("password")}
                      />
                      {errors.password && (
                        <p className="text-red-400 text-xs">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="text-white/70">
                        Confirmer le mot de passe
                      </Label>
                      <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
                        {...register("confirm")}
                      />
                      {errors.confirm && (
                        <p className="text-red-400 text-xs">
                          {errors.confirm.message}
                        </p>
                      )}
                    </div>

                    {serverError && (
                      <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {serverError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold"
                    >
                      {isSubmitting
                        ? "Enregistrement…"
                        : "Définir le mot de passe"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
