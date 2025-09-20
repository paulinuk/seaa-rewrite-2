// lib/server/env-constants.ts
// This module is server-only, so it cannot be imported by client components.
import 'server-only';

/**
 * ⚠️ WARNING
 * You are hard-coding secrets here to avoid Bolt/new env issues.
 * This file MUST NEVER be imported from a 'use client' module.
 * Keep it under lib/server/* to make intent clear.
 */

export const SUPABASE_URL = 'https://wawvpxslhhhsivamabeu.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhd3ZweHNsaGhoc2l2YW1hYmV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM3NjM1MiwiZXhwIjoyMDczOTUyMzUyfQ.N2o6pJpSegcRCLYzMw3ielMy-xJpuvnZ0vA8VPWcOxg';
