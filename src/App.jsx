import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { getTasks, createTask, deleteTask, updateTask } from "./api";
import Auth from "./Auth";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadTasks(data.session.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadTasks(session.user.id);
      else setTasks([]);
    });
  }, []);

  const loadTasks = async (userId) => {
    const res = await getTasks(userId);
    setTasks(res.data);
  };

  const handleAdd = async () => {
    if (!title) return;

    await createTask({
      title,
      userId: session.user.id,
    });

    setTitle("");
    loadTasks(session.user.id);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks(session.user.id);
  };

  const handleToggle = async (task) => {
    await updateTask(task.id, {
      completed: !task.completed,
    });

    loadTasks(session.user.id);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTasks(items);

    // actualizar orden en backend
    for (let i = 0; i < items.length; i++) {
      await updateTask(items[i].id, { order: i });
    }
  };

  if (!session) return <Auth />;

  // filtros + búsqueda
  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-black border-r border-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8">🚀 TaskApp</h1>

          <nav className="space-y-3">
            <button
              onClick={() => setFilter("all")}
              className="w-full text-left px-3 py-2 rounded bg-gray-800"
            >
              📋 Todas
            </button>

            <button
              onClick={() => setFilter("pending")}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-800"
            >
              ⏳ Pendientes
            </button>

            <button
              onClick={() => setFilter("completed")}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-800"
            >
              ✅ Completadas
            </button>
          </nav>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="text-red-400"
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        <h2 className="text-3xl font-bold mb-6">Tus tareas</h2>

        {/* STATS */}
        <div className="flex gap-6 mb-6">
          <div className="bg-gray-800 p-4 rounded-xl w-32 text-center">
            {total} total
          </div>
          <div className="bg-gray-800 p-4 rounded-xl w-32 text-center text-green-400">
            {completed} completadas
          </div>
        </div>

        {/* INPUT + SEARCH */}
        <div className="flex gap-2 mb-6 max-w-xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 px-4 py-3 rounded bg-gray-800"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 px-4 rounded"
          >
            +
          </button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="mb-6 px-4 py-2 rounded bg-gray-800 w-full max-w-xl"
        />

        {/* DRAG LIST */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 max-w-xl"
              >
                {filteredTasks.map((t, index) => (
                  <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-800 p-4 rounded flex justify-between items-center hover:scale-[1.02] transition"
                      >
                        <div
                          onClick={() => handleToggle(t)}
                          className="flex gap-3 cursor-pointer"
                        >
                          <div
                            className={`w-5 h-5 border rounded ${
                              t.completed ? "bg-green-500" : ""
                            }`}
                          />
                          <span
                            className={
                              t.completed ? "line-through text-gray-500" : ""
                            }
                          >
                            {t.title}
                          </span>
                        </div>

                        <button onClick={() => handleDelete(t.id)}>
                          ❌
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

      </div>
    </div>
  );
}

export default App;