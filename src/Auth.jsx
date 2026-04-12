import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // ⬅️ Toggle entre Login y Register
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const cleanEmail = (email) => email.trim().toLowerCase();
  const isValidPassword = (pwd) => pwd.length >= 6;
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () => {
    const clean = cleanEmail(email);
    const authValid = clean.length > 0 && isValidEmail(clean) && isValidPassword(password);
    if (!isLogin) {
      return authValid && fullName.trim().length > 0;
    }
    return authValid;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const clean = cleanEmail(email);

    if (!isValidEmail(clean) || !isValidPassword(password)) {
      setStatus({ loading: false, message: "Ingresa un email válido y contraseña (mínimo 6 caracteres).", error: true });
      return;
    }

    setStatus({ loading: true, message: "", error: false });

    if (isLogin) {
      // LOGIN LOGIC
      const { error } = await supabase.auth.signInWithPassword({
        email: clean,
        password,
      });

      if (error) {
        setStatus({ loading: false, message: error.message, error: true });
      } else {
        setStatus({ loading: false, message: "Login exitoso, redirigiendo...", error: false });
        navigate("/");
      }
    } else {
      // REGISTER LOGIC
      const { error } = await supabase.auth.signUp({
        email: clean,
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined
          }
        }
      });

      if (error) {
        setStatus({ loading: false, message: error.message, error: true });
      } else {
        setStatus({ loading: false, message: "Usuario creado. Por favor revisa tu correo para confirmar.", error: false });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {isLogin ? "¡Bienvenido de nuevo!" : "Crea tu cuenta"}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Inicia sesión para gestionar tus tareas" : "Regístrate para empezar a organizar tu día"}
          </p>
        </div>

        {/* STATUS MESSAGE */}
        {status.message && (
          <div className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            status.error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
          }`}>
            <span className="text-lg">{status.error ? "⚠️" : "🚀"}</span>
            <p>{status.message}</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* FULL NAME (Only for Register) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 ml-1">Mínimo 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={status.loading || !isFormValid()}
            className={`w-full py-4 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-xl mt-4 ${
              status.loading || !isFormValid()
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : isLogin 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
            }`}
          >
            {status.loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              isLogin ? "Iniciar Sesión" : "Crear Cuenta"
            )}
          </button>
        </form>

        {/* TOGGLE MODE */}
        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-sm">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStatus({ loading: false, message: "", error: false });
              }}
              className={`ml-2 font-bold transition-colors ${isLogin ? "text-blue-400 hover:text-blue-300" : "text-green-400 hover:text-green-300"}`}
            >
              {isLogin ? "Regístrate ahora" : "Inicia sesión"}
            </button>
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em] font-medium">
            Created by Emanuel Franco @ 2026
          </p>
        </div>

      </div>
    </div>
  );
}
