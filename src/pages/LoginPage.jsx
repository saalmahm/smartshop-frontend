import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import loginIllustration from '../assets/login-illustration.png';

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [backendError, setBackendError] = useState(null);

  const onSubmit = async (data) => {
    setBackendError(null);
    try {
      await authApi.login(data);
    } catch (error) {
      setBackendError(
        error?.response?.status === 401
          ? "Nom d'utilisateur ou mot de passe incorrect."
          : 'Une erreur est survenue.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      {/* CARD */}
      <div className="w-full max-w-5xl rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.25)] overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT – ILLUSTRATION */}
          <div className="flex items-center justify-center px-6 py-10 bg-slate-50">
            <img
              src={loginIllustration}
              alt="Illustration connexion SmartShop"
              className="w-full max-w-sm animate-fade-in"
            />
          </div>

          {/* RIGHT – FORM */}
          <div className="px-10 py-12 flex flex-col justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white">

            {/* HEADER */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">
                Connexion
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Accédez à votre espace SmartShop
              </p>
            </div>

            {/* BACKEND ERROR */}
            {backendError && (
              <div className="mb-4 rounded-lg bg-white/15 border border-white/30 text-sm px-4 py-3 animate-shake">
                {backendError}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium">
                  Adresse e-mail
                </label>
                <div className="mt-2 flex items-center rounded-xl px-4 py-2 bg-white/20 focus-within:bg-white transition-all duration-200 shadow-sm">
                  <input
                    type="email"
                    placeholder="votre@entreprise.com"
                    {...register('username', {
                      required: "L'adresse e-mail est requise",
                    })}
                    className="flex-1 bg-transparent text-sm text-white focus:text-slate-900 placeholder:text-white/70 focus:placeholder:text-slate-400 outline-none transition"
                  />
                  <span className="material-symbols-outlined text-white/70">
                    alternate_email
                  </span>
                </div>
                {errors.username && (
                  <p className="text-xs text-white/90 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium">
                  Mot de passe
                </label>
                <div className="mt-2 flex items-center rounded-xl px-4 py-2 bg-white/20 focus-within:bg-white transition-all duration-200 shadow-sm">
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Le mot de passe est requis',
                    })}
                    className="flex-1 bg-transparent text-sm text-white focus:text-slate-900 placeholder:text-white/70 focus:placeholder:text-slate-400 outline-none transition"
                  />
                  <span className="material-symbols-outlined text-white/70">
                    lock
                  </span>
                </div>
                {errors.password && (
                  <p className="text-xs text-white/90 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* FORGOT */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-white/80 hover:text-white hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
                {!isSubmitting && (
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                )}
              </button>

              {/* FOOTER */}
              <p className="mt-4 text-center text-xs text-white/70">
                Accès réservé aux professionnels SmartShop
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ANIMATIONS (TAILWIND UTILS) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
