# GitHub OAuth 配置指南

## 问题描述
点击 GitHub 登录按钮时出现错误：`{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

此错误表明：
1. GitHub 提供程序在 Supabase 中未启用，或
2. GitHub OAuth 应用配置不正确

## 解决方案概览
需要同时在两个地方完成配置：
1. **GitHub**：创建 OAuth 应用，获取 Client ID 和 Client Secret
2. **Supabase**：启用 GitHub 提供程序，填入 GitHub 应用的凭据

## 详细配置步骤

### 步骤1: 创建 GitHub OAuth 应用

#### 1.1 访问 GitHub 开发者设置
1. 登录 GitHub 账号
2. 访问 [GitHub OAuth Apps](https://github.com/settings/developers)
3. 点击 **New OAuth App** 按钮

#### 1.2 填写应用信息
- **Application name**: `CreatorHub` (可自定义)
- **Homepage URL**: `https://my-project-18w.pages.dev` (您的 Cloudflare Pages 域名)
- **Application description**: `CreatorHub 后台管理系统` (可选)

#### 1.3 配置回调 URL (最重要)
在 **Authorization callback URL** 字段中填写：
```
https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback
```
**重要**: 必须与您的 Supabase 项目 URL 匹配

#### 1.4 获取 Client ID 和 Client Secret
1. 点击 **Register application**
2. 在应用页面中找到：
   - **Client ID**: 一串类似 `Iv1.xxxxxxxxxxxx` 的字符串
   - **Client Secret**: 点击 **Generate a new client secret** 生成
3. 复制这两个值，稍后需要在 Supabase 中使用

### 步骤2: 在 Supabase 中配置 GitHub 提供程序

#### 2.1 登录 Supabase 控制台
1. 访问 [Supabase 控制台](https://supabase.com/dashboard/project/twfihaxptmhvdnapfovc)
2. 使用您的账号登录

#### 2.2 启用 GitHub 提供程序
1. 左侧菜单 → **Authentication** → **Providers**
2. 找到 **GitHub** 卡片
3. 点击开关启用 GitHub 提供程序

#### 2.3 填写 GitHub 应用凭据
在 GitHub 提供程序配置页面中填写：
- **Client ID**: 从 GitHub 获取的 Client ID
- **Client Secret**: 从 GitHub 获取的 Client Secret
- **Redirect URL**: 保持默认值（通常自动填充）

#### 2.4 可选配置
- **Allowed email domains**: 留空允许所有 GitHub 邮箱
- **Require verified email**: 建议启用
- **Auto confirm emails**: 建议启用，避免二次确认

#### 2.5 保存配置
点击 **Save** 保存配置

### 步骤3: 验证配置

#### 3.1 检查 Supabase 配置状态
在 Supabase 控制台中确认：
1. GitHub 提供程序显示为 **Enabled** (绿色)
2. Client ID 和 Client Secret 已正确保存

#### 3.2 测试 GitHub 登录
1. 访问您的登录页面：`https://my-project-18w.pages.dev/admin/login-supabase.html`
2. 点击 **使用 GitHub 登录** 按钮
3. 应该跳转到 GitHub 授权页面
4. 授权后跳转回您的后台管理界面

## 故障排除

### 常见错误及解决方案

#### 错误1: `Unsupported provider: provider is not enabled`
**原因**: GitHub 提供程序未在 Supabase 中启用
**解决方案**:
1. 确认 Supabase → Authentication → Providers 中 GitHub 已启用
2. 重新保存 GitHub 配置

#### 错误2: `Invalid OAuth credentials`
**原因**: Client ID 或 Client Secret 错误
**解决方案**:
1. 重新检查 GitHub 中的 Client ID 和 Client Secret
2. 在 Supabase 中重新填写凭据
3. 确保 GitHub 应用的回调 URL 正确

#### 错误3: `Redirect URI mismatch`
**原因**: GitHub 应用的回调 URL 与 Supabase 配置不匹配
**解决方案**:
1. 在 GitHub 应用中检查 **Authorization callback URL**
2. 必须为: `https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback`
3. 注意: 结尾不要有斜杠

#### 错误4: 授权后页面空白或错误
**原因**: 前端重定向 URL 配置错误
**解决方案**:
1. 检查 [login-supabase.html](file:///c:/Users/Administrator/Desktop/exe/exe/admin/login-supabase.html#L311) 中的重定向 URL
2. 确保为: `window.location.origin + '/admin/index.html'`

### 配置检查清单

#### GitHub 应用配置 ✅
- [ ] Application name 已设置
- [ ] Homepage URL 正确
- [ ] Authorization callback URL 正确
- [ ] Client ID 已获取
- [ ] Client Secret 已生成并保存

#### Supabase 配置 ✅
- [ ] GitHub 提供程序已启用
- [ ] Client ID 已填入
- [ ] Client Secret 已填入
- [ ] 配置已保存

#### 前端配置 ✅
- [ ] [login-supabase.html](file:///c:/Users/Administrator/Desktop/exe/exe/admin/login-supabase.html#L250) 中 `enableGitHubLogin: true`
- [ ] GitHub 登录按钮可见
- [ ] 重定向 URL 正确

## 高级配置

### 多环境配置
如果您有开发、测试、生产环境，需要为每个环境创建独立的 GitHub OAuth 应用：

| 环境 | GitHub 应用名称 | 回调 URL |
|------|----------------|----------|
| 开发 | CreatorHub Dev | `https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback` |
| 生产 | CreatorHub Prod | `https://twfihaxptmhvdnapfovc.supabase.co/auth/v1/callback` |

### 安全建议
1. **Client Secret 保密**: 不要在前端代码中暴露 Client Secret
2. **环境变量**: 在生产环境中使用环境变量存储敏感信息
3. **定期轮换**: 定期更新 Client Secret
4. **访问限制**: 在 GitHub 应用中限制访问 IP（如可能）

### 监控和日志
1. **Supabase 日志**: 查看 Authentication → Logs 中的登录尝试
2. **GitHub 日志**: 在 GitHub 应用页面查看授权请求
3. **前端日志**: 浏览器开发者工具 Console 标签页

## 备用方案

如果 GitHub OAuth 配置过于复杂，可以考虑：

### 方案A: 使用邮箱密码登录
1. 在 [login-supabase.html](file:///c:/Users/Administrator/Desktop/exe/exe/admin/login-supabase.html#L250) 中设置 `enableGitHubLogin: false`
2. 隐藏 GitHub 登录按钮，专注邮箱密码登录

### 方案B: 添加其他 OAuth 提供程序
Supabase 支持多种 OAuth 提供程序：
- **Google**: 配置简单，用户基数大
- **GitLab**: 类似 GitHub 的流程
- **Apple**: 需要苹果开发者账号

## 获取帮助

### 官方文档
- [Supabase OAuth 文档](https://supabase.com/docs/guides/auth/social-login)
- [GitHub OAuth 文档](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)

### 调试工具
1. **浏览器开发者工具**: Network 标签页查看 API 请求
2. **Supabase 日志**: 查看详细的认证错误
3. **GitHub 应用日志**: 查看授权请求详情

### 联系支持
如果问题仍未解决：
1. 提供完整的错误信息（截图或文本）
2. 说明已完成的配置步骤
3. 提供相关配置截图（隐藏敏感信息）