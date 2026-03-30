# EdgeOne Pages + CloudBase 完整配置指南

## 环境信息
- **CloudBase 环境ID**: `gyfish-4gbxsy3dc619f1e8`
- **网站域名**: `gyfish.com`

---

## 第一部分：EdgeOne Pages 配置

### 1.1 登录 EdgeOne 控制台
1. 访问 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 使用您的腾讯云账号登录

### 1.2 添加网站
1. 进入 **站点管理** → **添加站点**
2. 输入您的域名：`gyfish.com`
3. 选择套餐（建议选择免费版试用）
4. 点击 **确认添加**

### 1.3 配置 DNS
1. 在站点列表中找到 `gyfish.com`
2. 点击进入 **DNS 设置**
3. 添加以下 DNS 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|----------|----------|--------|-----|
| CNAME | www | `gyfish.com.edgeone.dev` | 自动 |
| CNAME | @ | `gyfish.com.edgeone.dev` | 自动 |

### 1.4 部署静态网站

#### 方法一：通过 Git 部署
1. 进入 **部署** → **Git 部署**
2. 连接您的 Git 仓库（GitHub/GitLab/Gitee）
3. 选择分支和构建命令
4. 设置输出目录：`/`
5. 点击 **部署**

#### 方法二：直接上传
1. 进入 **部署** → **直接上传**
2. 将项目文件夹压缩为 `.zip`
3. 上传压缩包
4. 解压并部署

### 1.5 配置边缘函数（可选）
如需使用边缘函数：
1. 进入 **边缘函数**
2. 创建新函数
3. 编写函数代码
4. 配置触发规则

---

## 第二部分：CloudBase 配置

### 2.1 数据库集合

请按照 [database/CLOUDBASE_INIT.md](file:///c:/Users/Administrator/Desktop/exe/exe/database/CLOUDBASE_INIT.md) 中的说明创建以下集合：

- `users` - 用户表
- `portfolio` - 作品集
- `posts` - 博客文章
- `settings` - 网站设置
- `media` - 媒体文件

### 2.2 配置 Authentication

1. 进入 **Authentication** → **设置**
2. 启用 **邮箱登录**
3. 配置邮件发送（可选）

### 2.3 配置存储

1. 进入 **存储** → **文件管理**
2. 创建文件夹：`portfolio`, `posts`, `avatar`, `media`

---

## 第三部分：代码文件清单

### 已创建的文件

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `cloudbase.json` | CloudBase 项目配置 | ✅ 必需 |
| `js/cloudbase-service.js` | CloudBase 服务层 | ✅ 必需 |
| `admin/login-cloudbase.html` | CloudBase 登录页面 | ✅ 必需 |
| `admin/index-cloudbase.html` | CloudBase 管理后台 | ✅ 必需 |
| `database/CLOUDBASE_INIT.md` | 数据库初始化指南 | ✅ 必需 |
| `MIGRATION_PLAN.md` | 迁移计划文档 | 📖 参考 |

### 需要您创建的内容

由于 CloudBase 需要在控制台手动配置的部分：
1. 数据库集合和权限
2. Authentication 用户账户
3. 存储文件夹结构

---

## 第四部分：部署清单

### 检查清单

#### EdgeOne 配置
- [ ] 已添加站点 `gyfish.com`
- [ ] DNS 解析已配置
- [ ] SSL 证书已生效（HTTPS）
- [ ] 网站可访问

#### CloudBase 配置
- [ ] 5个数据库集合已创建
- [ ] 各集合权限已配置
- [ ] 管理员用户已创建
- [ ] users 集合中有管理员记录
- [ ] 存储文件夹已创建
- [ ] 邮箱登录已启用

#### 代码文件
- [ ] `cloudbase.json` 已配置
- [ ] `js/cloudbase-service.js` 已创建
- [ ] `admin/login-cloudbase.html` 已创建
- [ ] `admin/index-cloudbase.html` 已创建

---

## 第五部分：测试流程

### 测试1：本地预览
```bash
# 使用 Python 启动本地服务器
cd c:\Users\Administrator\Desktop\exe\exe
python -m http.server 8080

# 访问 http://localhost:8080/admin/login-cloudbase.html
```

### 测试2：EdgeOne 部署后
1. 访问 `https://gyfish.com/admin/login-cloudbase.html`
2. 使用管理员邮箱和密码登录
3. 应成功跳转到 `https://gyfish.com/admin/index-cloudbase.html`

### 测试3：功能验证
- [ ] 登录/登出正常
- [ ] 统计数据正确显示
- [ ] 导航到各功能模块正常

---

## 第六部分：常见问题

### Q1: DNS 解析不生效？
**A**: DNS 生效通常需要5分钟-24小时。请耐心等待，或检查 DNS 配置是否正确。

### Q2: SSL 证书申请失败？
**A**: EdgeOne 会自动申请 Let's Encrypt 证书。如果失败，请检查域名是否已正确解析。

### Q3: 登录失败？
**A**:
1. 确认已在 CloudBase 创建用户
2. 确认已在 users 集合添加管理员记录
3. 检查浏览器控制台错误信息

### Q4: 数据库集合无法创建？
**A**: 确保使用具有管理员权限的账号。如果仍有问题，可以先跳过，创建简单的测试数据。

---

## 下一步操作

### 立即执行：
1. [ ] 登录 EdgeOne 控制台，添加站点 `gyfish.com`
2. [ ] 配置 DNS 解析
3. [ ] 部署网站到 EdgeOne Pages
4. [ ] 登录 CloudBase 控制台，创建数据库集合
5. [ ] 创建管理员用户
6. [ ] 配置 users 集合中的管理员记录

### 获取帮助：
如遇问题，请提供：
1. 具体的错误信息或截图
2. 您已完成的配置步骤
3. 是在哪个步骤遇到问题

---

## 文件路径参考

```
项目根目录/
├── cloudbase.json                    # CloudBase 配置
├── js/
│   └── cloudbase-service.js          # CloudBase 服务层
├── admin/
│   ├── login-cloudbase.html          # CloudBase 登录页
│   └── index-cloudbase.html          # CloudBase 管理后台
├── database/
│   └── CLOUDBASE_INIT.md            # 数据库初始化指南
├── MIGRATION_PLAN.md                 # 迁移计划
└── EDGEONE_CLOUDBASE_SETUP.md       # 本文档
```