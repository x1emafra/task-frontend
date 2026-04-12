import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState(""); // ⬅️ Nuevo campo
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const cleanEmail = (email) => email.trim().toLowerCase();
  const isValidPassword = (pwd) => pwd.length >= 6;
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () => {
    const clean = cleanEmail(email);
    return clean.length > 0 && isValidEmail(clean) && isValidPassword(password);
  };

  const handleLogin = async () => {
    const clean = cleanEmail(email);

    if (!isValidEmail(clean) || !isValidPassword(password)) {
      setStatus({ loading: false, message: "Ingresa un email válido y contraseña (mínimo 6 caracteres).", error: true });
      return;
    }

    setStatus({ loading: true, message: "", error: false });

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
  };

  const handleRegister = async () => {
    const clean = cleanEmail(email);

    if (!isValidEmail(clean) || !isValidPassword(password)) {
      setStatus({ loading: false, message: "Ingresa un email válido y contraseña (mínimo 6 caracteres).", error: true });
      return;
    }

    setStatus({ loading: true, message: "", error: false });

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
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-80">
      <h2 className="text-xl mb-4 text-white">Login</h2>

      {status.message && (
        <p className={`text-sm mb-3 ${status.error ? "text-red-400" : "text-green-400"}`}>
          {status.message}
        </p>
      )}

      <input
        className="w-full mb-2 p-2 bg-gray-800 rounded text-white"
        placeholder="Nombre completo (Solo para registro)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        className="w-full mb-2 p-2 bg-gray-800 rounded text-white"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full p-2 pr-10 bg-gray-800 rounded text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-gray-400"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={status.loading || !isFormValid()}
        className="w-full bg-blue-600 p-2 rounded mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.loading ? "Cargando..." : "Login"}
      </button>

      <button
        onClick={handleRegister}
        disabled={status.loading || !isFormValid()}
        className="w-full bg-green-600 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.loading ? "Cargando..." : "Register"}
      </button>
    </div>
  );
}
