import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { getTasks } from "../api/tasks";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // 🔐 Obtener usuario
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          console.log("⛔ No hay usuario");
          setError("Usuario no autenticado");
          return;
        }

        console.log("👤 USER ID:", user.id);

        // 📡 Obtener tareas
        const data = await getTasks(user.id);

        console.log("📦 DATA RECIBIDA:", data);
        console.log("📦 TYPE:", typeof data);
        console.log("📦 ES ARRAY:", Array.isArray(data));

        setTasks(data);
      } catch (err) {
        console.error("🔥 ERROR REAL:", err);

        if (err.message) {
          setError(err);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔍 DEBUG render
  console.log("🎯 RENDER TASKS:", tasks);

  // 🧠 UI STATES

  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
  return (
    <div>
      <h2>ERROR REAL 👇</h2>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}

  return (
    <div>
      <h2>Tareas</h2>

      {tasks.length === 0 ? (
        <p>No tienes tareas aún</p>
      ) : (
        tasks.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "8px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <strong>{t.title}</strong>
            <p>{t.completed ? "✅ Completada" : "⏳ Pendiente"}</p>
          </div>
        ))
      )}
    </div>
  );
}