-- Migration: Initial Schema
-- Created: 2025-11-15
-- Description: Creates all initial tables for FlowSync

-- UP

-- This migration sets up the complete initial schema for FlowSync
-- For new deployments, the full schema.sql will be applied
-- For existing deployments, migrations should be additive

-- The actual schema is in ../schema.sql
-- This migration file serves as a marker for the baseline

-- Check if users table exists (indicator of existing schema)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE 'Base schema should be applied from schema.sql before running migrations';
    RAISE EXCEPTION 'Run schema.sql first to create base tables';
  END IF;
END $$;

-- Verify core tables exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') OR
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'energy_logs') OR
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedules') THEN
    RAISE EXCEPTION 'Core tables missing - apply schema.sql first';
  END IF;
END $$;

-- Record that initial schema is in place
SELECT 'Initial schema verified' as status;

-- DOWN

-- Cannot rollback initial schema
-- This would require dropping all tables
RAISE EXCEPTION 'Cannot rollback initial schema migration';
