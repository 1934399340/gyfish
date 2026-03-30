# CloudBase 数据库初始化指南

## 环境信息
- **环境ID**: `gyfish-4gbxsy3dc619f1e8`
- **访问地址**: `https://gyfish.com`

---

## 第一步：创建数据库集合

### 1.1 进入云开发控制台
1. 访问 [腾讯云云开发控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境：`gyfish-4gbxsy3dc619f1e8`
3. 左侧菜单 → **数据库** → **集合管理**

### 1.2 创建集合

请按顺序创建以下集合：

#### 集合1: `users` (用户表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| openid | string | 用户唯一标识 |
| email | string | 邮箱地址 |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| role | string | 角色：admin/admin |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

**创建方法**:
1. 点击 **创建集合**
2. 输入集合名：`users`
3. 点击 **确定**

#### 集合2: `portfolio` (作品集)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| title | string | 作品标题 |
| description | string | 作品描述 |
| cover_image | string | 封面图片URL |
| images | array | 图片列表 |
| tags | array | 标签列表 |
| featured | boolean | 是否精选 |
| status | string | 状态：published/draft |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

#### 集合3: `posts` (博客文章)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| title | string | 文章标题 |
| content | string | 文章内容(富文本) |
| excerpt | string | 文章摘要 |
| cover_image | string | 封面图片URL |
| tags | array | 标签列表 |
| author | string | 作者 |
| status | string | 状态：published/draft |
| views | number | 阅读量 |
| created_at | date | 创建时间 |
| updated_at | date | 更新时间 |

#### 集合4: `settings` (网站设置)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| key | string | 设置键名 |
| value | string | 设置值 |
| description | string | 设置描述 |
| updated_at | date | 更新时间 |

#### 集合5: `media` (媒体文件)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| url | string | 文件URL |
| filename | string | 文件名 |
| type | string | 文件类型：image/video/document |
| size | number | 文件大小(字节) |
| uploaded_by | string | 上传者openid |
| created_at | date | 上传时间 |

---

## 第二步：配置权限

### 2.1 设置集合权限
对于每个集合，需要设置适当的权限：

#### `users` 集合权限
1. 进入 `users` 集合 → **权限设置**
2. 选择 **自定义安全规则**
3. 添加规则：
```json
{
  "read": "doc._openid == auth.openid || auth.role == 'admin'",
  "create": "auth != null",
  "update": "doc._openid == auth.openid || auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}
```

#### `portfolio` 集合权限
```json
{
  "read": true,
  "create": "auth != null",
  "update": "auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}
```

#### `posts` 集合权限
```json
{
  "read": true,
  "create": "auth != null",
  "update": "auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}
```

#### `settings` 集合权限
```json
{
  "read": true,
  "create": "auth.role == 'admin'",
  "update": "auth.role == 'admin'",
  "delete": "auth.role == 'admin'"
}
```

#### `media` 集合权限
```json
{
  "read": true,
  "create": "auth != null",
  "update": "doc.uploaded_by == auth.openid || auth.role == 'admin'",
  "delete": "doc.uploaded_by == auth.openid || auth.role == 'admin'"
}
```

---

## 第三步：创建管理员账户

### 3.1 通过控制台创建用户
1. 进入 **Authentication** → **用户管理**
2. 点击 **添加用户**
3. 填写信息：
   - 邮箱：`admin@gyfish.com`（替换为您的邮箱）
   - 密码：`YourPassword123!`（设置强密码）
4. 点击 **确定**

### 3.2 设置用户为管理员
创建用户后，需要在 `users` 集合中添加管理员记录：

1. 进入 **数据库** → **集合管理** → **users**
2. 点击 **添加记录**
3. 填写记录：
```json
{
  "openid": "用户的openid",
  "email": "admin@gyfish.com",
  "nickname": "管理员",
  "role": "admin",
  "created_at": new Date(),
  "updated_at": new Date()
}
```

**注意**: `openid` 需要替换为实际创建用户的 openid，可以在 Authentication → 用户管理 中查看。

---

## 第四步：配置存储

### 4.1 进入存储控制台
1. 左侧菜单 → **存储** → **文件管理**

### 4.2 创建存储路径
1. 点击 **创建文件夹**
2. 创建以下文件夹结构：
   - `/portfolio` - 作品集图片
   - `/posts` - 文章图片
   - `/avatar` - 用户头像
   - `/media` - 通用媒体文件

### 4.3 配置存储权限
```json
{
  "read": true,
  "upload": "auth != null",
  "delete": "auth.role == 'admin'"
}
```

---

## 第五步：配置登录方式

### 5.1 进入Authentication设置
1. 左侧菜单 → **Authentication** → **设置**

### 5.2 启用邮箱登录
1. 找到 **邮箱登录** 选项
2. 点击 **启用**
3. 保存设置

### 5.3 配置邮件模板（可选）
1. **Authentication** → **邮件模板**
2. 配置发送邮箱（如已配置）
3. 设置邮件主题和内容

---

## 验证配置

### 检查清单
- [ ] 5个集合已创建（users, portfolio, posts, settings, media）
- [ ] 各集合权限已配置
- [ ] 至少1个管理员用户已创建
- [ ] users集合中有管理员记录
- [ ] 存储文件夹已创建
- [ ] 邮箱登录已启用

### 测试登录
1. 访问 `https://gyfish.com/admin/login-cloudbase.html`
2. 使用管理员邮箱和密码登录
3. 应成功跳转到管理后台

---

## 常见问题

### Q1: 找不到 openid？
**A**: 在 CloudBase 中，用户登录后会有 `openid` 或 `uid`。可以在 Authentication → 用户管理 中查看用户详情获取。

### Q2: 权限设置失败？
**A**: 确保使用管理员账号登录控制台。如果仍失败，可以先使用宽松权限测试，之后再收紧。

### Q3: 存储上传失败？
**A**: 检查存储权限设置，确保已启用文件上传功能。

### Q4: 登录失败？
**A**:
1. 确认邮箱登录已启用
2. 确认用户已创建且已验证
3. 检查浏览器控制台错误信息

---

## 下一步

配置完成后，请告诉我：
1. ✅ 已完成以上所有步骤
2. ❌ 遇到问题（请描述具体问题）

我将帮您：
1. 验证配置是否正确
2. 创建初始数据
3. 测试完整登录流程