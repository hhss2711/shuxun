-- 书循 · Supabase 初始化脚本（可重复执行）
-- 用法：在 Supabase 控制台 → SQL Editor 中整段粘贴运行。
-- 覆盖：用户资料、商品发布、订单（拍下）、收藏、聊天消息。

-- ---------------------------------------------------------------------------
-- 1. 用户资料（与 auth.users 一对一）
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nick_name text,
  avatar_url text default '/images/icons/avatar.png',
  campus text,
  college text,
  grade text,
  major text,
  location text,
  description text,
  credit_score integer not null default 100,
  deal_count integer not null default 0,
  join_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. 商品
-- ---------------------------------------------------------------------------
create table if not exists public.books (
  id bigint generated always as identity primary key,
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  cover text,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  description text,
  condition text,
  category text,
  location text,
  campus text,
  college text,
  grade text,
  semester text,
  course_type text,
  course_name text,
  images jsonb not null default '[]'::jsonb,
  status text not null default '在售', -- 在售 / 已下架 / 已售出
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists books_seller_id_idx on public.books (seller_id);
create index if not exists books_status_idx on public.books (status);

-- ---------------------------------------------------------------------------
-- 3. 订单（拍下即锁定，平台不参与收款）
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  book_id bigint not null references public.books(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  book_title text,
  book_cover text,
  price numeric(10, 2) not null default 0,
  meetup_note text,
  status text not null default 'reserved',
  created_at timestamptz not null default now()
);
create index if not exists orders_buyer_id_idx on public.orders (buyer_id);
create index if not exists orders_seller_id_idx on public.orders (seller_id);

-- ---------------------------------------------------------------------------
-- 4. 收藏
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id bigint not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);
create index if not exists favorites_user_id_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- 5. 聊天消息（会话由 book_id + 双方 id 推导）
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  book_id bigint not null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_pair_idx on public.chat_messages (book_id, sender_id, receiver_id);

-- ---------------------------------------------------------------------------
-- 6. 新用户注册时自动建 profile
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nick_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'nick_name', ''), '/images/icons/avatar.png')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 7. 行级安全（RLS）—— 策略先删后建，确保可重复执行
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.orders enable row level security;
alter table public.favorites enable row level security;
alter table public.chat_messages enable row level security;

-- profiles：所有人可读，本人可写
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- books：所有人可读，卖家可增删改
drop policy if exists "books_select_all" on public.books;
drop policy if exists "books_insert_own" on public.books;
drop policy if exists "books_update_own" on public.books;
drop policy if exists "books_delete_own" on public.books;
create policy "books_select_all" on public.books for select using (true);
create policy "books_insert_own" on public.books for insert with check (auth.uid() = seller_id);
create policy "books_update_own" on public.books for update using (auth.uid() = seller_id);
create policy "books_delete_own" on public.books for delete using (auth.uid() = seller_id);

-- orders：买卖双方可见，买家可创建，双方可更新
drop policy if exists "orders_select_participant" on public.orders;
drop policy if exists "orders_insert_buyer" on public.orders;
drop policy if exists "orders_update_participant" on public.orders;
create policy "orders_select_participant" on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "orders_insert_buyer" on public.orders for insert with check (auth.uid() = buyer_id);
create policy "orders_update_participant" on public.orders for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- favorites：仅本人可见可写
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_select_own" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);

-- chat_messages：仅收发双方可见，发送者可创建
drop policy if exists "chat_select_participant" on public.chat_messages;
drop policy if exists "chat_insert_sender" on public.chat_messages;
create policy "chat_select_participant" on public.chat_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "chat_insert_sender" on public.chat_messages for insert with check (auth.uid() = sender_id);
