-- ============================================================
-- Atorni – Lawyer Booking Platform
-- Supabase PostgreSQL Schema (safe / idempotent version)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'client'
                          CHECK (role IN ('client', 'lawyer')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- LAWYER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id                    UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID        REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio                   TEXT,
  specializations       TEXT[]      DEFAULT '{}',
  hourly_rate           DECIMAL(10,2),
  years_experience      INTEGER,
  bar_number            TEXT,
  location              TEXT,
  languages             TEXT[]      DEFAULT '{"English"}',
  is_verified           BOOLEAN     DEFAULT FALSE,
  is_accepting_clients  BOOLEAN     DEFAULT TRUE,
  stripe_account_id     TEXT,
  website               TEXT,
  linkedin_url          TEXT,
  phone                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lawyer profiles are viewable by everyone" ON lawyer_profiles;
CREATE POLICY "Lawyer profiles are viewable by everyone"
  ON lawyer_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lawyers can insert their own profile" ON lawyer_profiles;
CREATE POLICY "Lawyers can insert their own profile"
  ON lawyer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lawyers can update their own profile" ON lawyer_profiles;
CREATE POLICY "Lawyers can update their own profile"
  ON lawyer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_slots (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  lawyer_id   UUID        REFERENCES lawyer_profiles(id) ON DELETE CASCADE NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  is_booked   BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Availability slots are viewable by everyone" ON availability_slots;
CREATE POLICY "Availability slots are viewable by everyone"
  ON availability_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lawyers can manage their own slots" ON availability_slots;
CREATE POLICY "Lawyers can manage their own slots"
  ON availability_slots FOR ALL USING (
    EXISTS (
      SELECT 1 FROM lawyer_profiles lp
      WHERE lp.id = availability_slots.lawyer_id
        AND lp.user_id = auth.uid()
    )
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                        UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id                 UUID          REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  lawyer_id                 UUID          REFERENCES lawyer_profiles(id) ON DELETE RESTRICT NOT NULL,
  slot_id                   UUID          REFERENCES availability_slots(id) ON DELETE RESTRICT NOT NULL,
  status                    TEXT          NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  stripe_payment_intent_id  TEXT,
  stripe_session_id         TEXT,
  amount                    DECIMAL(10,2),
  notes                     TEXT,
  meeting_link              TEXT,
  created_at                TIMESTAMPTZ   DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can see their own bookings" ON bookings;
CREATE POLICY "Clients can see their own bookings"
  ON bookings FOR SELECT USING (
    auth.uid() = client_id
    OR EXISTS (
      SELECT 1 FROM lawyer_profiles lp
      WHERE lp.id = bookings.lawyer_id
        AND lp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Parties can update their bookings" ON bookings;
CREATE POLICY "Parties can update their bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = client_id
    OR EXISTS (
      SELECT 1 FROM lawyer_profiles lp
      WHERE lp.id = bookings.lawyer_id
        AND lp.user_id = auth.uid()
    )
  );

-- ============================================================
-- ADVICE POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS advice_posts (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  category    TEXT,
  is_answered BOOLEAN     DEFAULT FALSE,
  view_count  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE advice_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advice posts are viewable by everyone" ON advice_posts;
CREATE POLICY "Advice posts are viewable by everyone"
  ON advice_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create advice posts" ON advice_posts;
CREATE POLICY "Authenticated users can create advice posts"
  ON advice_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their posts" ON advice_posts;
CREATE POLICY "Authors can update their posts"
  ON advice_posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their posts" ON advice_posts;
CREATE POLICY "Authors can delete their posts"
  ON advice_posts FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- ADVICE ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS advice_answers (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id     UUID        REFERENCES advice_posts(id) ON DELETE CASCADE NOT NULL,
  author_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT        NOT NULL,
  is_accepted BOOLEAN     DEFAULT FALSE,
  upvotes     INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE advice_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Answers are viewable by everyone" ON advice_answers;
CREATE POLICY "Answers are viewable by everyone"
  ON advice_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can answer" ON advice_answers;
CREATE POLICY "Authenticated users can answer"
  ON advice_answers FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their answers" ON advice_answers;
CREATE POLICY "Authors can update their answers"
  ON advice_answers FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their answers" ON advice_answers;
CREATE POLICY "Authors can delete their answers"
  ON advice_answers FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyer_profiles_updated_at ON lawyer_profiles;
CREATE TRIGGER update_lawyer_profiles_updated_at
  BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advice_posts_updated_at ON advice_posts;
CREATE TRIGGER update_advice_posts_updated_at
  BEFORE UPDATE ON advice_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_user_id          ON lawyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_specializations  ON lawyer_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_availability_slots_lawyer_id     ON availability_slots(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_start_time    ON availability_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id               ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_lawyer_id               ON bookings(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id                 ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_advice_posts_author_id           ON advice_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_advice_posts_category            ON advice_posts(category);
CREATE INDEX IF NOT EXISTS idx_advice_answers_post_id           ON advice_answers(post_id);
