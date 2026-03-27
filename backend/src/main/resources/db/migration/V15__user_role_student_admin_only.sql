-- Reduce user roles to STUDENT and ADMIN only.
-- Postgres enums cannot drop values directly, so we recreate the type.
--
-- Important: map any legacy TEACHER users to ADMIN to preserve access.

DO $$
BEGIN
  -- Create a replacement enum type if it doesn't exist.
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
    CREATE TYPE user_role_new AS ENUM ('STUDENT', 'ADMIN');
  END IF;
END$$;

-- Drop old default first, otherwise PostgreSQL cannot cast it to the new enum type.
ALTER TABLE users
  ALTER COLUMN role DROP DEFAULT;

-- Convert users.role to the new type, mapping TEACHER -> ADMIN if present.
ALTER TABLE users
  ALTER COLUMN role TYPE user_role_new
  USING (
    CASE
      WHEN role::text = 'TEACHER' THEN 'ADMIN'
      ELSE role::text
    END
  )::user_role_new;

-- Replace old enum type with the new one.
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Restore default on the column with the new enum type.
ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'STUDENT'::user_role;

