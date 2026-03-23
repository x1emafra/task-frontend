import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else window.location.reload();
  };

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Usuario creado!");
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-80">
      <h2 className="text-xl mb-4 text-white">Login</h2>

      <input
        className="w-full mb-2 p-2 bg-gray-800 rounded text-white"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full mb-4 p-2 bg-gray-800 rounded text-white"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 p-2 rounded mb-2"
      >
        Login
      </button>

      <button
        onClick={handleRegister}
        className="w-full bg-green-600 p-2 rounded"
      >
        Register
      </button>
    </div>
  );
}