-- ESTE SCRIPT CONTIENE LA CONFIGURACIÓN DE SEGURIDAD (RLS) PARA LA BASE DE DATOS
-- Ejecutar este script en el SQL Editor de Supabase para corregir errores de permisos.

-- ==========================================
-- 1. TABLA: shared_tasks
-- ==========================================

-- Asegurarse de que RLS esté habilitado
ALTER TABLE public.shared_tasks ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT: 
-- Un usuario solo puede compartir una tarea si él es el dueño original de esa tarea en la tabla "Task".
CREATE POLICY "Propietarios pueden compartir sus tareas" ON public.shared_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public."Task"
    WHERE id = task_id AND user_id = auth.uid()
  )
);

-- Política para permitir SELECT:
-- Un usuario puede ver los registros de tareas compartidas si su email coincide con el destino.
CREATE POLICY "Usuarios pueden ver tareas compartidas con ellos" ON public.shared_tasks
FOR SELECT
TO authenticated
USING (
  user_email = auth.jwt()->>'email'
);

-- Política para permitir DELETE:
-- El dueño de la tarea puede revocar el acceso compartido.
CREATE POLICY "Propietarios pueden eliminar accesos compartidos" ON public.shared_tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public."Task"
    WHERE id = task_id AND user_id = auth.uid()
  )
);

-- ==========================================
-- 2. TABLA: Task (Asegurar RLS básico)
-- ==========================================

-- Asegurarse de que RLS esté habilitado en Task
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean solo SUS tareas
-- (Esta ya debería estar, pero se incluye por seguridad)
-- CREATE POLICY "Usuarios ven sus propias tareas" ON public."Task"
-- FOR ALL USING (auth.uid() = user_id);
