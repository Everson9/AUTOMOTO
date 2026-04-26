-- supabase/migrations/20260417190000_add_assalto_enum.sql
-- Add 'assalto' to tipo_alerta_via enum for assault alerts

ALTER TYPE tipo_alerta_via ADD VALUE IF NOT EXISTS 'assalto';