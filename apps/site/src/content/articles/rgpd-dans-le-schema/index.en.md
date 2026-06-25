---
title: "GDPR in the schema, not on a sticky note"
registre: impl
date: "2026-06-24"
tags: ["supabase", "gdpr", "rpc", "postgres", "compliance"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 7
image: ./images/hero.webp
imageFocus: center
excerpt: "Export, erasure, retention: RPCs scoped to identity, an anonymization that preserves the invoice, and a scheduled purge. The right, carved into the database."
---

## The need

A customer writes: "send me all the data you have on me" (article 15). Another: "delete it" (article 17). Two rights the law requires you to satisfy. But two immediate traps.

For the export, how do you guarantee the customer receives **their** data, and not someone else's? For erasure, how do you delete their personal data while **keeping the invoice**, which accounting law requires you to retain for years? If you handle this "later, in the application layer," you add a place never to forget — and one day you'll forget it. The right place is the database itself.

## The principle: compliance is a property of the schema

> **↑ Going deeper:** this chapter applies [Compliance is a property of the schema](/en/journal/conformite-propriete-du-schema). Here's the short version.

Three ideas. One, the **scope is bounded by the authenticated identity**, read by the operation itself rather than supplied by the client. Two, **erasing isn't deleting**: it's selective anonymization, removing what identifies and keeping what the law requires. Three, **retention is a declared policy** that runs on its own. We're about to see all three carved into functions and a scheduler.

## The Supabase implementation

### Article 15: export, scoped by `auth.uid()`

The right of access becomes an RPC. The decisive point: it takes **no customer id as input**. It reads who's calling itself, via `auth.uid()`, and bounds its whole scope to that.

```sql
-- Art. 15 (access): jsonb export of the AUTHENTICATED customer's data (auth.uid() bounds the scope)
create or replace function public.export_customer_data()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'not_authenticated' using errcode = 'insufficient_privilege'; end if;
  return jsonb_build_object(
    'customer', (select to_jsonb(c) from public.customers c where c.id = v_uid),
    'orders',  (select coalesce(jsonb_agg(...), '[]'::jsonb) from public.orders o where o.auth_user_id = v_uid),
    'loyalty', (select coalesce(jsonb_agg(...), '[]'::jsonb) from public.loyalty_ledger l where l.customer_id = v_uid)
  );
end; $$;
```

Look at what it makes **impossible**: there's no "export customer X" parameter. A caller can't request someone else's data, because the function gives no handle to do so. The scope is carved into the function's definition. That's the "bounded by identity" principle, literally.

### Article 17: erasure that anonymizes, not destroys

The right to erasure isn't a `DELETE`. The function removes the PII and **keeps the invoice**, depersonalized.

```sql
-- Art. 17 (erasure): ANONYMIZES the PII, KEEPS the invoice (accounting obligation)
create or replace function public.delete_customer_data()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid; v_orders int;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'not_authenticated' using errcode = 'insufficient_privilege'; end if;
  update public.customers set email = null, phone = null where id = v_uid;
  update public.orders set delivery_address = null where auth_user_id = v_uid and delivery_address is not null;
  get diagnostics v_orders = row_count;
  return jsonb_build_object('anonymized', true, 'orders_anonymized', v_orders);
end; $$;
```

Two seemingly contradictory obligations — make the person disappear, keep the accounting record — reconciled by a surgical operation: you nullify the personal fields (email, phone, delivery address), you leave the order and its amount. The invoice remains, but it no longer points to an individual. And again, the scope is `auth.uid()`: you erase only *their* data. The `anonymized` return names the operation for what it is.

### Retention: a policy that runs on its own

What's left is tied to no customer request: data that expires with time. Logs beyond 13 months, addresses beyond 10 years — that's not cleaned up by hand every other quarter. It's a **scheduled purge**: a purge function called periodically by the scheduler (see `pg_cron`, chapter 6). Retention becomes a behavior of the system. (Dedicated migrations: purge + cron; governance and legal basis live in a separate data-governance migration.)

## Honesty

The **design** of these rights is proven at the right level (the RPCs, the `auth.uid()` bounding, the anonymization are pure SQL, A-testable on an ephemeral database — see chapter 5). Two clarifications so as not to oversell:

- **Single-restaurant.** This project has no `restaurant_id`: roles are global and the customer scope is identity alone. In a multi-tenant context, you'd need to *also* bound by tenant — that's an extension of the pattern, not what this code does.
- Full **legal compliance** (registers, legal bases, exact durations) belongs to governance, not just these functions. This chapter shows how the **schema carries** the technical guarantees — it doesn't substitute for legal advice.

---

**Takeaway:** export and erasure are RPCs scoped by `auth.uid()`, erasure anonymizes the PII while keeping the invoice, and retention runs as a scheduled purge.
