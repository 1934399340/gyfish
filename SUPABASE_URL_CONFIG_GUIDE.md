# Supabase URL 配置指南

## 问题描述
登录后页面反复跳转回登录页面，通常是由于 Supabase 认证配置中的 URL 设置不正确导致的跨域问题。

## 根本原因
当您的网站部署在 Cloudflare Pages (`my-project-18w.pages.dev`) 而 Supabase 服务在另一个域名 (`twfihaxptmhvdnapfovc.supabase.co`) 时，需要正确配置以下设置：

1. **Site URL**: 告诉 Supabase 您的主网站地址
2. **Redirect URLs**: 允许的重定向地址列表
3. **CORS 设置**: 允许跨域请求

## 配置步骤

### 步骤1: 登录 Supabase 控制台
1. 访问 [Supabase 控制台](https://supabase.com/dashboard/project/twfihihaxptmhvdnapfovc)
2. 使用您的账号登录

### 步骤2: 配置 Authentication URL 设置
1. 左侧菜单 → **Authentication** → **URL Configuration**
2. 填写以下设置：

#### 2.1 Site URL (最重要)
```
https://my-project-18w.pages.dev
```
**作用**: 告诉 Supabase 您的主网站地址，用于构建正确的重定向链接。

#### 2.2 Additional Redirect URLs
添加以下重定向 URL：
```
https://my-project-18w.pages.dev/admin/index.html
https://my-project-18w.pages.dev/admin/login-supabase.html
https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback
```

#### 2.3 Additional Sign-in Redirect URLs (可选)
```
https://my-project-18w.pages.dev/admin/
```

### 步骤3: 检查 CORS 设置
1. 左侧菜单 → **Authentication** → **Settings**
2. 找到 **CORS Settings** 部分
3. 确保包含您的域名：
   ```
   https://my-project-18w.pages.dev
   http://localhost:3000 (用于本地开发)
   ```

### 步骤4: 验证 GitHub OAuth 回调 URL (如使用)
如果使用 GitHub OAuth，确保 GitHub 应用中的回调 URL 为：
```
https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback
```

## 配置检查清单

### ✅ Supabase 配置验证
- [ ] **Site URL**: `https://my-project-18w.pages.dev`
- [ ] **Redirect URLs**: 包含您的管理页面地址
- [ ] **CORS**: 允许您的域名
- [ ] **GitHub OAuth**: 回调 URL 正确（如使用）

### ✅ 前端代码验证
- [ ] [login-supabase.html](file:///c:/Users/Administrator/Desktop/exe/exe/admin/login-supabase.html): Supabase 客户端配置正确
- [ ] [admin/index.html](file:///c:/Users/Administrator/Desktop/exe/exe/admin/index.html): 认证初始化逻辑已修复
- [ ] **Supabase 客户端配置**: 包含 `persistSession: true` 和 `autoRefreshToken: true`

### ✅ 浏览器验证
- [ ] **清除浏览器缓存**: 特别是 localStorage 和 cookies
- [ ] **检查开发者工具**:
  - **Console**: 查看认证日志
  - **Network**: 检查 API 请求状态
  - **Application** → **Storage**: 查看 `supabase.auth.token`

## 测试流程

### 1. 清除浏览器数据
1. 打开开发者工具 (F12)
2. **Application** → **Storage** → **Clear site data**
3. 或直接访问: `chrome://settings/clearBrowserData`

### 2. 测试登录
1. 访问: `https://my-project-18w.pages.dev/admin/login-supabase.html`
2. 使用测试账户:
   - **邮箱**: `admin@creatorhub.com`
   - **密码**: `TempPassword123!`
3. 观察行为:
   - 成功登录 → 跳转到管理页面
   - 保持登录状态 → 不自动跳回登录页面
   - 查看控制台日志 → 确认认证状态变化

### 3. 验证会话持久化
1. 登录后刷新页面 (F5)
2. 应该保持登录状态，无需重新登录
3. 检查 localStorage 中是否有 `supabase.auth.token`

## 故障排除

### 问题1: 登录后立即跳回登录页面
**可能原因**: Site URL 配置错误或 CORS 问题
**解决方案**:
1. 确认 Supabase 中的 Site URL 配置正确
2. 检查 CORS 设置包含您的域名
3. 清除浏览器缓存后重试

### 问题2: 会话不持久化 (刷新后需要重新登录)
**可能原因**: `persistSession` 配置错误或 localStorage 问题
**解决方案**:
1. 确认 Supabase 客户端配置中包含 `persistSession: true`
2. 检查浏览器是否阻止 localStorage
3. 尝试其他浏览器测试

### 问题3: 控制台显示 CORS 错误
**可能原因**: 域名未在 CORS 设置中允许
**解决方案**:
1. 在 Supabase → Authentication → Settings 中添加您的域名到 CORS
2. 格式: `https://my-project-18w.pages.dev`

### 问题4: GitHub OAuth 重定向失败
**可能原因**: 回调 URL 不匹配
**解决方案**:
1. 在 GitHub OAuth 应用中检查回调 URL
2. 必须为: `https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback`
3. 在 Supabase 中启用 GitHub 提供程序

## 高级配置

### 多环境配置
如果您有多个环境，需要为每个环境配置：

| 环境 | Site URL | 用途 |
|------|----------|------|
| 生产 | `https://my-project-18w.pages.dev` | 线上环境 |
| 预览 | `https://*.pages.dev` | Cloudflare 预览部署 |
| 本地 | `http://localhost:3000` | 本地开发 |

### 通配符配置
对于预览部署，可以使用通配符：
```
https://*.pages.dev
```

### 本地开发配置
1. 在本地运行时，修改 `config.js` 中的 Supabase 配置
2. 在 Supabase CORS 中添加 `http://localhost:3000`
3. 使用本地服务器运行: `python -m http.server 3000`

## 获取帮助

### 调试工具
1. **Supabase 日志**: Authentication → Logs
2. **浏览器开发者工具**: Console 和 Network 标签页
3. **API 测试工具**: 使用 curl 或 Postman 测试认证端点

### 联系支持
如果问题仍未解决:
1. 提供完整的错误信息（截图）
2. 说明已完成的配置步骤
3. 提供 Supabase 项目 ID: `twfihaxptmhvdnapfovc`

## 配置完成后的验证命令
```powershell
# 测试登录API
$supabaseUrl = "https://twfihaxptmhvdnapfovc.supabase.co"
$anonKey = "sb_publishable_IFWl0r0vz0m5Vr4_Gk5w-A_xG9lGTYj"
$headers = @{"apikey"=$anonKey;"Content-Type"="application/json"}
$body = @{email="admin@creatorhub.com";password="TempPassword123!"} | ConvertTo-Json
Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/token?grant_type=password" -Method Post -Headers $headers -Body $body
```

**期望响应**: 包含 `access_token` 和 `user` 对象，而不是错误信息。