---
title: "Orthodox RBAC on Supabase"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rbac", "authorization", "rls", "postgres"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 1
image: ./images/hero.webp
imageFocus: center
excerpt: "Manager, chef, counter: three roles, three sets of rights. Supabase's official two-table pattern, an authority function, and a JWT claim that's nothing but a mirror."
---

## The need

Three people behind the counter, three roles. The **manager** (`gerante`) can do everything: menu, promotions, refunds, settings, staff. The **chef** runs the kitchen and the menu, nothing more. The **counter** (`comptoir`) takes orders — and that's all: no refunds, no settings.

You could hardcode this with `if (user.email === ...)`. But the day a fourth person joins, a role changes, or you want to add a permission, you're back in the code. What you want is to express **who is allowed to do what** as data, not as scattered code.

## The principle: who you are → what you can do

> **↑ Going deeper:** this chapter applies [RBAC vs ABAC: who you are vs what you own](/en/journal/rbac-vs-abac-qui-tu-es-ce-que-tu-possedes), and builds on [ACL at the gate, RLS as the safety net](/en/journal/acl-en-entree-rls-en-filet). Here's the short version.

RBAC (role-based access control) answers a single question: *who are you?* A role maps to a set of permissions. The role is identity; the permissions are what that identity unlocks. Two things to hold onto:

1. The **source of truth** lives server-side. What the client presents (a token, a claim) is only a **mirror** — never the original.
2. By default, you **deny**. A permission exists only when it has been explicitly granted.

We're about to see both ideas laid down as-is in the schema.

## The Supabase implementation

### Two tables: the assignment and the matrix

Supabase's official "Custom Claims & RBAC" pattern fits in two tables. One says *who has which role*, the other *which role unlocks which permission*.

```sql
-- Enums: business roles + granular permissions
create type public.app_role as enum ('gerante', 'chef', 'comptoir');
create type public.app_permission as enum (
  'catalog.write', 'promotions.write', 'delivery.dispatch', 'refunds.write',
  'settings.write', 'staff.manage', 'compliance.read', 'orders.manage'
);

-- user_roles: role ⇄ user assignment (SOURCE OF TRUTH; the JWT claim is its mirror)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- role_permissions: the role → permission MATRIX
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);
alter table public.role_permissions enable row level security;

-- Matrix: manager = admin (everything); chef = kitchen + menu; counter = orders.
insert into public.role_permissions (role, permission) values
  ('gerante','catalog.write'),('gerante','promotions.write'),('gerante','delivery.dispatch'),
  ('gerante','refunds.write'),('gerante','settings.write'),('gerante','staff.manage'),
  ('gerante','compliance.read'),('gerante','orders.manage'),
  ('chef','catalog.write'),('chef','orders.manage'),
  ('comptoir','orders.manage');
```

The need from the start has become **data**. Adding a permission to the chef is one row to insert, with no code to touch.

> Note: the role values stay in French (`gerante`, `chef`, `comptoir`) because they're the real enum values in the database — translating them would misrepresent the code.

### `authorize()`: the shared authority

You need a single place that answers "does this role have this permission?", usable by both RLS and server code.

```sql
-- authorize(permission): the shared AUTHORITY. SECURITY DEFINER to read the matrix
-- bypassing RLS. search_path = '' (anti-shadowing). Deny by default.
create or replace function public.authorize(requested_permission public.app_permission)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
declare
  bind_permissions int;
  v_claims jsonb;
  v_role public.app_role;
begin
  v_claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  v_role := (nullif(v_claims ->> 'user_role', ''))::public.app_role;
  if v_role is null then return false; end if;
  select count(*) into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = v_role;
  return bind_permissions > 0;
exception
  when invalid_text_representation then return false;  -- unknown claim ⇒ deny, never a 500
end;
$$;
```

Three details that make this pattern solid:

- **Deny by default.** No role, unreadable claim, missing permission → `false`. An unknown claim raises an exception caught as `false`: never a 500, never an accidental opening.
- **`security definer` + `search_path = ''`.** The function reads the matrix bypassing RLS (otherwise it couldn't consult it), and the empty `search_path` prevents a booby-trapped table from being substituted.
- **Reading `current_setting('request.jwt.claims')` rather than `auth.jwt()`.** That's the choice that makes the function **portable** between the real stack and a test Postgres (more in chapter 5).

### The claim is only a mirror

What's left is putting the role into the JWT. And this is where "source of truth server-side" gets concrete: the role is **set by the server** on every token issuance, via the Custom Access Token Hook.

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  v_role public.app_role;
begin
  select role into v_role from public.user_roles
  where user_id = (event->>'user_id')::uuid limit 1;
  claims := event->'claims';
  if v_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
  else
    claims := jsonb_set(claims, '{user_role}', 'null');
  end if;
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The hook runs as supabase_auth_admin (GoTrue): execution REVOKED from application roles.
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
```

And we wire it in `config.toml`:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

**The anti-pattern to avoid:** storing the role in `user_metadata`. It's tempting, it's right there — but `user_metadata` is **client-editable**. You'd be handing authority to the very party you're supposed to control. The source of truth is the `user_roles` table, and the claim derives from it, set server-side. If the two diverge, the table is right.

## Honesty

The RBAC tables and `authorize()` are tested at the right level (A, on an ephemeral database): the matrix, deny-by-default, claim reading — all covered. The **Custom Access Token Hook**, though, depends on a real role (`supabase_auth_admin`) and a real GoTrue: it carries a skip marker in unit tests and belongs to level-C validation, **deferred** in this project. So: here's the correct design and what's proven. The hook's real wiring is verified in E2E.

---

**Takeaway:** two tables turn "who's allowed to do what" into data, `authorize()` decides with deny-by-default, and the role travels in the JWT but stays set by the server from the `user_roles` table.
