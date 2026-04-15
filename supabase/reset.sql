-- ============================================================
-- RESET SCRIPT — run this FIRST to wipe everything cleanly
-- Safe to run: you have no real data yet
-- ============================================================

DROP TABLE IF EXISTS advice_answers       CASCADE;
DROP TABLE IF EXISTS advice_posts         CASCADE;
DROP TABLE IF EXISTS bookings             CASCADE;
DROP TABLE IF EXISTS availability_slots   CASCADE;
DROP TABLE IF EXISTS lawyer_profiles      CASCADE;
DROP TABLE IF EXISTS profiles             CASCADE;

DROP FUNCTION IF EXISTS handle_new_user()           CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column()  CASCADE;
