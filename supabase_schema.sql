-- Run this SQL in your Supabase SQL Editor to create the tables

-- 1. Study Hub Data
CREATE TABLE user_study_hub (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subjects JSONB DEFAULT '[]'::jsonb,
  chapters JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Goals Data
CREATE TABLE user_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  goals JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tasks Data
CREATE TABLE user_tasks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Exams Data
CREATE TABLE user_exams (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  exams JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Finance/Transactions Data
CREATE TABLE user_finance (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  transactions JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Prayers Data
CREATE TABLE user_prayers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prayers JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE user_study_hub ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prayers ENABLE ROW LEVEL SECURITY;

-- Create Policies so users can only read/update their own data
CREATE POLICY "Manage own study hub" ON user_study_hub FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own tasks" ON user_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own exams" ON user_exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own finance" ON user_finance FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Manage own prayers" ON user_prayers FOR ALL USING (auth.uid() = user_id);
