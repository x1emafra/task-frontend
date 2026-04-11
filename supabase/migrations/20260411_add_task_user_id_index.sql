-- Fix for: Table public.Task has a foreign key Task_user_id_fkey without a covering index.
-- This index optimizes queries that filter tasks by user (e.g., in useTasks.js).
CREATE INDEX IF NOT EXISTS "idx_Task_user_id" ON public."Task"(user_id);

-- Additional index for shared_tasks table foreign key
-- To prevent similar performance warnings for the sharing feature.
CREATE INDEX IF NOT EXISTS "idx_shared_tasks_task_id" ON public."shared_tasks"(task_id);
