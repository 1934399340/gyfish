# 邮箱确认操作指南

## 问题描述
由于 Supabase 的安全限制，service_role 密钥无法在浏览器环境中使用，因此无法通过脚本自动确认邮箱。

## 解决方案
使用 SQL 命令直接在 Supabase 数据库中确认用户邮箱。

## 操作步骤

### 步骤1: 登录 Supabase 控制台
1. 访问 [Supabase 控制台](https://supabase.com/dashboard/project/twfihaxptmhvdnapfovc)
2. 使用您的账号登录

### 步骤2: 运行 SQL 脚本
1. 在左侧菜单点击 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 复制以下 SQL 代码到编辑器中：

```sql
-- 确认 admin@creatorhub.com 的邮箱
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@creatorhub.com';

-- 验证更新结果
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'admin@creatorhub.com';
```

4. 点击 **Run** 执行 SQL
5. 确认查询结果显示 `email_confirmed_at` 字段有日期时间值（不为 NULL）

### 步骤3: 测试登录
1. 访问您的后台登录页面：`https://my-project-18w.pages.dev/admin/login-supabase.html`
2. 输入以下凭据：
   - **邮箱**: `admin@creatorhub.com`
   - **密码**: `TempPassword123!`
3. 点击登录，应该成功跳转到后台管理界面

## 备用方案

### 方案A: 确认所有未确认的用户
如果您有多个用户需要确认，可以使用以下 SQL：

```sql
-- 确认所有未确认邮箱的用户
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 查看统计信息
SELECT 
    COUNT(*) as 总用户数,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as 已确认邮箱用户数,
    COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as 未确认邮箱用户数
FROM auth.users;
```

### 方案B: 查看所有用户状态
```sql
-- 查看前10个用户的状态
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;
```

## 测试账户信息

### 已创建的账户
1. **主管理员账户**:
   - 邮箱: `admin@creatorhub.com`
   - 密码: `TempPassword123!`
   - 用户ID: `fd388d44-0f17-41cd-8a97-49425c04dfc2`

2. **测试账户** (如果需要):
   - 邮箱: `test@creatorhub.com`
   - 密码: `TestPassword123!`

## 常见问题

### Q1: 运行 SQL 时出现权限错误
**A**: 确保您使用的是项目所有者账号登录。如果权限不足，请联系项目所有者操作。

### Q2: 登录时仍提示 "Email not confirmed"
**A**: 
1. 重新运行 SQL 确认脚本
2. 检查 `email_confirmed_at` 字段是否已更新
3. 清除浏览器缓存后重试登录

### Q3: 忘记密码怎么办？
**A**: 在 Supabase 控制台可以重置密码：
1. **Authentication** → **Users**
2. 找到对应邮箱的用户
3. 点击 **Actions** → **Reset password**

### Q4: 需要创建更多用户
**A**: 使用以下 SQL 创建新用户：
```sql
-- 创建新用户 (需在 Supabase 控制台运行)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'newuser@example.com',
    crypt('YourPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    ''
);
```

## 后续步骤

1. ✅ 获取 service_role 密钥
2. ✅ 更新 config.json 配置
3. ✅ 创建管理员账户
4. ⬜ 运行 SQL 确认邮箱
5. ⬜ 测试邮箱密码登录
6. ⬜ 配置 GitHub OAuth (可选)

## 重要提醒

1. **安全警告**: service_role 密钥具有完全的管理权限，请妥善保管
2. **生产环境**: 在生产环境中建议启用邮箱验证，仅开发环境可以跳过
3. **定期审计**: 定期检查用户列表，移除不需要的账户

## 获取帮助

如果遇到问题：
1. 检查 Supabase 文档: [Supabase Auth API](https://supabase.com/docs/reference/javascript/auth-api)
2. 查看错误日志: 浏览器开发者工具 → Console 标签页
3. 联系技术支持