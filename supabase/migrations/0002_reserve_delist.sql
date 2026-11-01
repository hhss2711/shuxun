-- 书循 · 0002 补充脚本（可重复执行）
-- 用法：在 Supabase 控制台 → SQL Editor 中整段粘贴运行。
--
-- 背景：拍下即锁定（平台不参与收款）。买家拍下商品后需要把商品立即下架，
-- 但 books 表原本只有「卖家可改」的策略，买家无权更新，故此处补充一条策略：
-- 任何已登录用户可以把「在售」商品改为「已下架 / 已售出」。
-- 卖家重新上架 / 编辑仍由 books_update_own 策略负责。

drop policy if exists "books_reserve_delist" on public.books;
create policy "books_reserve_delist" on public.books
  for update
  using (status = '在售')
  with check (status in ('已下架', '已售出'));
