/*
  # Expense Sharing App Schema

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text) - グループ名
      - `created_at` (timestamp)
      
    - `members`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key) - 所属グループ
      - `name` (text) - メンバー名
      - `created_at` (timestamp)
      
    - `expenses`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key) - グループID
      - `payer_id` (uuid, foreign key) - 支払った人
      - `description` (text) - 支払い内容
      - `amount` (decimal) - 金額
      - `created_at` (timestamp)
      
    - `expense_participants`
      - `id` (uuid, primary key)
      - `expense_id` (uuid, foreign key) - 支払いID
      - `member_id` (uuid, foreign key) - メンバーID
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a URL-shareable app)
*/

-- Groups table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Members table
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, name)
);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES members(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Expense participants table
CREATE TABLE expense_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(expense_id, member_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to groups"
  ON groups FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to groups"
  ON groups FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to members"
  ON members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to members"
  ON members FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to expenses"
  ON expenses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to expenses"
  ON expenses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to expense_participants"
  ON expense_participants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to expense_participants"
  ON expense_participants FOR INSERT
  TO public
  WITH CHECK (true);