ALTER TABLE users
    ADD COLUMN career_track VARCHAR(30) NOT NULL DEFAULT 'NONE';

COMMENT ON COLUMN users.career_track IS 'Career path for contextualized AI problem generation';
