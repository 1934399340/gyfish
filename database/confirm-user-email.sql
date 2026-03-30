-- Supabase 邮箱确认 SQL 脚本
-- 在 Supabase 控制台的 SQL Editor 中运行此脚本
-- 将确认指定用户的邮箱，使其无需邮件验证即可登录

-- 方法1: 更新特定用户的 email_confirmed_at
-- 将 'admin@creatorhub.com' 替换为需要确认的邮箱
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@creatorhub.com';

-- 检查更新结果
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'admin@creatorhub.com';

-- 方法2: 确认所有未确认邮箱的用户
-- 警告: 这会确认所有用户的邮箱，包括可能不需要的账户
/*
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

SELECT 
    COUNT(*) as 已确认用户数,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as 已确认邮箱用户数,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as 未确认邮箱用户数
FROM auth.users;
*/

-- 方法3: 查看所有用户状态
/*
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;
*/

-- 重要提示:
-- 1. 此操作需要项目所有者权限或使用 service_role 密钥
-- 2. 在生产环境中谨慎使用，仅确认信任的用户邮箱
-- 3. 确认后，用户可以直接使用邮箱密码登录，无需点击邮件中的确认链接

-- 操作完成后，使用以下账户测试登录:
-- 邮箱: admin@creatorhub.com
-- 密码: TempPassword123!