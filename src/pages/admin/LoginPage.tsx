import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ALLOW_SIGNUP = import.meta.env.VITE_ALLOW_SIGNUP === "true";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

const LOGIN_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Identifiants incorrects.",
  "Email not confirmed": "Compte non confirmé. Contactez l'administrateur.",
  "User not found": "Aucun compte avec cet email.",
};

function friendlyError(msg: string): string {
  for (const key of Object.keys(LOGIN_ERRORS)) {
    if (msg.includes(key)) return LOGIN_ERRORS[key];
  }
  return "Une erreur est survenue. Réessayez.";
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginData) => {
    setServerError(null);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setServerError(friendlyError(msg));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/70">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="prenom@club.fr"
          className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
          {...register("email")}
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/70">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
          {...register("password")}
        />
        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
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
        {isSubmitting ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}

function SignupForm({ onCancel }: { onCancel: () => void }) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async ({ email, password }: SignupData) => {
    setServerMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setServerMessage(error.message);
      return;
    }
    setSuccess(true);
    setServerMessage("Compte créé. Vérifiez votre email pour confirmer.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="su-email" className="text-white/70">Email</Label>
        <Input
          id="su-email"
          type="email"
          autoComplete="email"
          placeholder="prenom@club.fr"
          className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
          {...register("email")}
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-password" className="text-white/70">Mot de passe</Label>
        <Input
          id="su-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25"
          {...register("password")}
        />
        {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
      </div>

      {serverMessage && (
        <p className={`text-sm rounded-lg px-3 py-2 border ${success ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
          {serverMessage}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-white/10 text-white/60 hover:text-white"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || success}
          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold"
        >
          {isSubmitting ? "Création…" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

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
          <CardHeader>
            <CardTitle className="text-white">
              {showSignup ? "Créer un compte" : "Connexion"}
            </CardTitle>
            <CardDescription className="text-white/40">
              {showSignup
                ? "Compte temporaire — désactiver VITE_ALLOW_SIGNUP en prod."
                : "Les comptes sont créés par l'administrateur."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSignup ? (
              <SignupForm onCancel={() => setShowSignup(false)} />
            ) : (
              <>
                <LoginForm onSuccess={() => navigate("/admin/dashboard", { replace: true })} />
                {ALLOW_SIGNUP && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-3 text-white/30 hover:text-white/60 text-xs"
                    onClick={() => setShowSignup(true)}
                  >
                    Créer un compte
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
