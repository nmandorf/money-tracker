CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'receipt')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'final')),
  payer_member_id TEXT NOT NULL,
  amount_cents INTEGER,
  note TEXT,
  date TEXT NOT NULL,
  image_name TEXT,
  image_mime_type TEXT,
  ocr_status TEXT,
  ocr_suggestions_json TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (payer_member_id) REFERENCES members(id)
);

CREATE TABLE expense_participants (
  expense_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  share_cents INTEGER,
  PRIMARY KEY (expense_id, member_id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE INDEX idx_members_group ON members(group_id);
CREATE INDEX idx_expenses_group_status ON expenses(group_id, status);
CREATE INDEX idx_expense_participants_member ON expense_participants(member_id);
