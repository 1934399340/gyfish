# 技术方案迁移计划

## 当前状态 vs 新方案

| 组件 | 当前方案 | 新方案 |
|------|----------|--------|
| **前端部署** | Cloudflare Pages | EdgeOne Pages |
| **后端服务** | Supabase (PostgreSQL + Auth + Storage) | 腾讯云 CloudBase |
| **域名解析** | Cloudflare DNS | DNSPod |
| **CDN/安全** | Cloudflare (部分) | EdgeOne (一体化) |

## 方案优势

### EdgeOne Pages 优势
- ✅ **国内访问更快**: 腾讯云CDN节点覆盖中国大陆
- ✅ **一体化方案**: 与DNSPod、CloudBase同属腾讯云生态
- ✅ **免费额度**: 每月包含一定流量包
- ✅ **支持Edge Functions**: 可在边缘节点运行轻量代码

### 云开发CloudBase 优势
- ✅ **Serverless后端**: 无需管理服务器
- ✅ **数据库**: 支持MySQL和NoSQL
- ✅ **用户认证**: 内置登录/注册/验证码
- ✅ **文件存储**: 内置云存储
- ✅ **CMS支持**: 可选云开发CMS内容管理
- ✅ **HTTPS**: 自动配置SSL证书
- ✅ **CLI工具**: 方便部署和管理

## 迁移任务清单

### 第一阶段：准备工作 (预计1-2天)

#### 1.1 腾讯云账号准备
- [ ] 注册腾讯云账号
- [ ] 实名认证（个人/企业）
- [ ] 开通 EdgeOne Pages 服务
- [ ] 开通 CloudBase 服务
- [ ] 申请 DNSPod 免费域名（如需）

#### 1.2 域名配置
- [ ] 将域名转入 DNSPod 或添加已有域名
- [ ] 配置 DNS 解析到 EdgeOne
- [ ] 申请 SSL 证书（或自动配置）

### 第二阶段：CloudBase 后端搭建 (预计2-3天)

#### 2.1 云开发环境初始化
```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 初始化项目
tcb init
```

#### 2.2 CloudBase 数据库设计

**需要创建的集合（Collections）：**

| 集合名 | 用途 | 字段 |
|--------|------|------|
| `users` | 用户信息 | openid, nickname, avatar, role, created_at |
| `portfolio` | 作品集 | title, description, cover_image, images[], tags[], featured, created_at |
| `posts` | 博客文章 | title, content, excerpt, cover_image, tags[], status, views, created_at |
| `settings` | 网站设置 | site_name, site_description, social_links, seo_settings |
| `media` | 媒体文件 | url, type, size, uploaded_by, created_at |

#### 2.3 CloudBase Auth 配置
- [ ] 配置登录方式（微信/邮箱/手机）
- [ ] 设置登录规则
- [ ] 配置管理员白名单

#### 2.4 CloudBase Storage 配置
- [ ] 创建存储桶
- [ ] 设置访问权限
- [ ] 配置图片处理规则

### 第三阶段：前端代码改造 (预计3-5天)

#### 3.1 替换 Supabase 客户端

**当前代码 (Supabase):**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxx.supabase.co',
  'sb_xxx'
)

// 使用
const { data, error } = await supabase
  .from('portfolio')
  .select()
```

**新代码 (CloudBase):**
```javascript
import cloudbase from '@cloudbase/js-sdk'

const app = cloudbase.init({
  env: 'your-env-id'
})

// 登录
const auth = app.auth()

// 数据库
const db = app.database()
const { data, error } = await db.collection('portfolio').get()
```

#### 3.2 需要修改的文件

| 文件 | 修改内容 | 优先级 |
|------|----------|--------|
| `admin/index.html` | 替换Supabase为CloudBase认证 | P0 |
| `admin/login-supabase.html` | 改写为CloudBase登录 | P0 |
| `js/data-service.js` | 重写数据服务层 | P0 |
| `portfolio.html` | 更新作品集加载逻辑 | P1 |
| `index.html` | 更新首页数据加载 | P1 |
| 所有页面 | 替换CDN链接 | P2 |

#### 3.3 EdgeOne Pages 配置

**创建 `cloudbase.json` 配置文件：**
```json
{
  "envId": "your-env-id",
  "version": "2.0",
  "framework": "static",
  "outputDir": "./",
  "cloudfunction": {
    "name": "auth-helper"
  }
}
```

**创建 EdgeOne Pages 配置文件：**
在项目根目录创建 `edgeone.config.js` 或在控制台配置。

### 第四阶段：部署与测试 (预计2-3天)

#### 4.1 部署到 EdgeOne Pages
1. 连接 Git 仓库或直接上传
2. 配置构建命令（如需）
3. 设置环境变量
4. 部署成功获取访问地址

#### 4.2 部署 CloudBase 云函数
```bash
# 部署云函数
tcb fn deploy function-name

# 部署静态网站
tcb hosting deploy ./dist
```

#### 4.3 测试清单
- [ ] 用户注册/登录功能
- [ ] 作品集 CRUD 操作
- [ ] 文章发布/编辑功能
- [ ] 文件上传/删除功能
- [ ] 管理员权限验证
- [ ] 移动端适配测试

#### 4.4 DNS 切换
- [ ] 在 DNSPod 配置 DNS 记录
- [ ] 将域名解析到 EdgeOne
- [ ] 等待 DNS 生效（通常5-30分钟）
- [ ] 验证 HTTPS 证书
- [ ] 测试全站功能

## 技术对比：Supabase vs CloudBase

### 功能对比

| 功能 | Supabase | CloudBase | 备注 |
|------|----------|-----------|------|
| **数据库** | PostgreSQL | MySQL + NoSQL | CloudBase更灵活 |
| **用户认证** | ✅ | ✅ | 功能类似 |
| **实时订阅** | ✅ | ❌ | CloudBase不支持 |
| **文件存储** | ✅ | ✅ | 功能类似 |
| **Edge Functions** | ✅ | ⚠️ | EdgeOne有支持 |
| **自动HTTPS** | ✅ | ✅ | 免费 |
| **CDN** | ✅ | ✅ | EdgeOne更优 |
| **免费额度** | 500MB | 1GB | CloudBase更优 |
| **中国访问** | 一般 | 优秀 | EdgeOne优势明显 |

### API 风格对比

**Supabase:**
```javascript
const { data, error } = await supabase
  .from('users')
  .select()
  .eq('role', 'admin')
```

**CloudBase:**
```javascript
const res = await db.collection('users')
  .where({ role: 'admin' })
  .get()

// 或使用云函数
const res = await app.callFunction({
  name: 'getAdmins',
  data: {}
})
```

## 代码迁移示例

### 示例1: 用户认证

**Supabase 版本:**
```javascript
// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// 获取用户
const { data: { user } } = await supabase.auth.getUser()

// 登出
await supabase.auth.signOut()

// 监听状态
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Signed in:', session.user)
  }
})
```

**CloudBase 版本:**
```javascript
// 登录（使用匿名登录示例）
const app = cloudbase.init({
  env: 'your-env-id'
})

// 匿名登录
await app.auth().anonymousAuth().signIn()

// 获取用户
const authState = await app.auth().getAuthState()

// 邮箱登录（需配置）
await app.auth().signInByEmail(email, password)

// 登出
await app.auth().signOut()

// 监听状态（需手动实现或使用云函数）
```

### 示例2: 数据库查询

**Supabase 版本:**
```javascript
// 获取作品集
const { data: portfolio, error } = await supabase
  .from('portfolio')
  .select('*, media(*)')
  .eq('featured', true)
  .order('created_at', { ascending: false })
  .limit(10)

// 插入数据
const { data, error } = await supabase
  .from('portfolio')
  .insert([
    { title: '新作品', description: '描述', featured: true }
  ])

// 更新数据
const { data, error } = await supabase
  .from('portfolio')
  .update({ featured: false })
  .eq('id', itemId)

// 删除数据
const { error } = await supabase
  .from('portfolio')
  .delete()
  .eq('id', itemId)
```

**CloudBase 版本:**
```javascript
const db = app.database()

// 获取作品集（需创建索引）
const res = await db.collection('portfolio')
  .where({ featured: true })
  .orderBy('created_at', 'desc')
  .limit(10)
  .get()

// 插入数据
const res = await db.collection('portfolio')
  .add({
    title: '新作品',
    description: '描述',
    featured: true,
    created_at: new Date()
  })

// 更新数据
const res = await db.collection('portfolio')
  .doc(itemId)
  .update({
    featured: false,
    updated_at: new Date()
  })

// 删除数据
const res = await db.collection('portfolio')
  .doc(itemId)
  .remove()
```

### 示例3: 文件上传

**Supabase 版本:**
```javascript
const file = event.target.files[0]
const { data, error } = await supabase
  .storage
  .from('portfolio')
  .upload(`public/${Date.now()}_${file.name}`, file)

// 获取公开URL
const { data: { publicUrl } } = supabase
  .storage
  .from('portfolio')
  .getPublicUrl(filePath)
```

**CloudBase 版本:**
```javascript
const cloudbase = require('@cloudbase/js-sdk')

// 上传文件
const uploadTask = cloudbase.uploadFile({
  cloudPath: `portfolio/${Date.now()}_${file.name}`,
  filePath: file.path
})

uploadTask.on('progress', (snapshot) => {
  console.log('上传进度:', snapshot.loaded / snapshot.total)
})

const res = await uploadTask
```

## 实施时间线

```
Week 1: 环境搭建
├── Day 1-2: 腾讯云账号注册、实名认证、服务开通
├── Day 3-4: CloudBase 环境初始化、数据库设计
└── Day 5: DNSPod 域名配置

Week 2: 代码改造
├── Day 1-2: 前端代码 - 认证模块改造
├── Day 3-4: 前端代码 - 数据服务层改造
└── Day 5: 单元测试、代码审查

Week 3: 部署测试
├── Day 1-2: EdgeOne Pages 部署
├── Day 3-4: 全端集成测试
└── Day 5: DNS 切换、线上验证

Week 4 (可选): 优化
├── 性能优化
├── 移动端适配
└── 监控告警配置
```

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| CloudBase API 不熟悉 | 中 | 提前学习文档、示例代码 |
| 数据迁移复杂 | 高 | 编写迁移脚本、多次测试 |
| DNS 切换期间服务中断 | 中 | 保持旧服务运行、准备回滚 |
| 免费额度用尽 | 低 | 监控使用量、及时升级 |

## 后续优化建议

1. **添加 CDN 缓存规则**: 静态资源缓存优化
2. **配置告警监控**: 监控 API 调用量和错误率
3. **添加云函数**: 将复杂业务逻辑移至后端
4. **数据库索引**: 为常用查询创建复合索引
5. **安全加固**: 配置请求频率限制、CORS

## 参考资料

- [腾讯云 EdgeOne Pages 文档](https://cloud.tencent.com/document/product/1460)
- [云开发 CloudBase 文档](https://docs.cloudbase.net/)
- [CloudBase JS SDK](https://github.com/TencentCloudBase/cloudbase-js-sdk)
- [DNSPod 域名解析](https://www.dnspod.cn/)