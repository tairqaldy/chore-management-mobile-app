# Database Schema Design

## Overview
This document outlines the database schema for the Chore Management Mobile App using Supabase (PostgreSQL).

## Tables

### 1. Users Table
Stores user authentication and profile information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'tenant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `email`: User email (unique, used for authentication)
- `username`: Display name (unique)
- `role`: User role - either 'host' or 'tenant'
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_username` on `username`

---

### 2. Houses Table
Stores house/group information created by hosts.

```sql
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  max_tenants INTEGER NOT NULL DEFAULT 10,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: House name
- `description`: Optional house description
- `max_tenants`: Maximum number of tenants allowed
- `host_id`: Foreign key to users table (the host who created the house)
- `created_at`: House creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `idx_houses_host_id` on `host_id`

---

### 3. House_Members Table
Junction table linking users (tenants) to houses.

```sql
CREATE TABLE house_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(house_id, user_id)
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `house_id`: Foreign key to houses table
- `user_id`: Foreign key to users table (tenant)
- `joined_at`: When the tenant joined the house

**Indexes:**
- `idx_house_members_house_id` on `house_id`
- `idx_house_members_user_id` on `user_id`
- Unique constraint on `(house_id, user_id)` to prevent duplicate memberships

---

### 4. Chores Table
Stores chore/task information.

```sql
CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_done' CHECK (status IN ('not_done', 'done')),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `house_id`: Foreign key to houses table
- `title`: Chore title
- `description`: Optional chore description
- `assigned_to_user_id`: Foreign key to users table (who the chore is assigned to, nullable)
- `created_by_user_id`: Foreign key to users table (who created the chore)
- `status`: Chore status - 'not_done' or 'done'
- `archived`: Boolean flag indicating if the chore has been archived (default: false)
- `created_at`: Chore creation timestamp
- `updated_at`: Last update timestamp
- `completed_at`: When the chore was marked as done (nullable)

**Indexes:**
- `idx_chores_house_id` on `house_id`
- `idx_chores_assigned_to_user_id` on `assigned_to_user_id`
- `idx_chores_created_by_user_id` on `created_by_user_id`
- `idx_chores_status` on `status`

---

## Relationships

1. **Users → Houses** (One-to-Many)
   - A user (host) can create multiple houses
   - Foreign key: `houses.host_id` → `users.id`

2. **Users → House_Members** (Many-to-Many)
   - Users (tenants) can join multiple houses
   - Houses can have multiple tenants
   - Junction table: `house_members`

3. **Houses → Chores** (One-to-Many)
   - A house can have multiple chores
   - Foreign key: `chores.house_id` → `houses.id`

4. **Users → Chores** (One-to-Many for assignments)
   - A user can be assigned multiple chores
   - Foreign key: `chores.assigned_to_user_id` → `users.id`

5. **Users → Chores** (One-to-Many for creation)
   - A user can create multiple chores
   - Foreign key: `chores.created_by_user_id` → `users.id`

---

## Row Level Security (RLS) Policies

### Users Table
- Users can read their own profile
- Users can update their own profile
- Hosts can read tenant profiles in their houses

### Houses Table
- Anyone can read public house information (for searching)
- Hosts can create, update, and delete their own houses
- Tenants can read houses they are members of

### House_Members Table
- Users can read members of houses they belong to
- Hosts can add/remove tenants from their houses
- Tenants can join available houses (if not at max capacity)

### Chores Table
- Users can read chores in houses they belong to
- Users can create chores in houses they belong to
- Assigned users and hosts can update chores
- Hosts can delete chores in their houses
- Assigned users can mark their chores as done

---

## Triggers

### Update Timestamp Trigger
Automatically update `updated_at` field on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chores_updated_at BEFORE UPDATE ON chores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Views (Optional - for easier queries)

### House Details View
Combines house information with member count.

```sql
CREATE VIEW house_details AS
SELECT 
  h.*,
  COUNT(DISTINCT hm.user_id) as current_tenant_count,
  u.username as host_username
FROM houses h
LEFT JOIN house_members hm ON h.id = hm.house_id
LEFT JOIN users u ON h.host_id = u.id
GROUP BY h.id, u.username;
```

---

## Notes

- All tables use UUID for primary keys
- Timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate
- RLS policies should be enabled on all tables for security
- Consider adding soft delete functionality if needed (add `deleted_at` column)
- Consider adding indexes on frequently queried fields for performance

