-- 书循 · 0003 补丁：表级权限（可重复执行）
-- 用法：在 Supabase 控制台 → SQL Editor 中整段粘贴运行。
--
-- 背景：0001 建表时 public 架构的默认授权可能已被收回，导致登录用户报
-- 「permission denied for table books (42501)」。RLS 策略只负责“行级”过滤，
-- 前提是角色先拥有对应表的表级权限，这里补上。
-- 真正的访问范围仍由 0001 中的 RLS 策略控制。

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated;

-- 以后新建的表 / 序列也自动带上权限
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
