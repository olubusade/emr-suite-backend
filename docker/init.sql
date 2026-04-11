-- DATABASE INITIALIZATION SCRIPT
-- This script runs automatically on the first container start.
-- It ensures the target EMR database exists before the backend attempts to connect.

-- Create the database if it doesn't already exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'busade_emr_demo_db'
   ) THEN
      PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE busade_emr_demo_db');
   END IF;
END
$do$;