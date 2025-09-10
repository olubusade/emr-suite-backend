-- Create the database if it doesn't already exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'busade_emr_demo_db'
   ) THEN
      CREATE DATABASE busade_emr_demo_db;
   END IF;
END
$do$;
