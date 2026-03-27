ALTER TABLE student_feedback
    ALTER COLUMN rating TYPE INTEGER USING rating::integer;
