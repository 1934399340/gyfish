# 腾讯云CloudBase部署指南

## 🎯 部署优势

相比当前的Netlify方案，腾讯云CloudBase的优势：
- **国内访问速度更快**（CDN节点更多）
- **完全免费额度充足**（每日10万次访问）
- **与腾讯云生态整合更好**
- **备案要求相对宽松**

## 🚀 部署步骤

### 1. 注册腾讯云账号
- 访问 [https://cloud.tencent.com](https://cloud.tencent.com)
- 使用微信/QQ登录即可

### 2. 开通CloudBase服务
1. 进入 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
2. 点击"新建环境"
3. 选择"按量计费"（免费额度足够使用）
4. 环境名称：`creatorhub-prod`
5. 点击"免费开通"

### 3. 配置静态网站托管
1. 在CloudBase控制台选择刚创建的环境
2. 进入"静态网站托管"模块
3. 点击"开启静态网站托管"
4. 记录分配的访问域名（类似：`https://creatorhub-prod-123456.tcloudbaseapp.com`）

### 4. 部署网站文件
方法一：控制台上传（推荐新手）
1. 在"静态网站托管"页面点击"上传文件"
2. 将整个项目文件夹拖拽上传
3. 设置默认首页为 `index.html`

方法二：CLI部署（推荐开发者）
```bash
# 安装CloudBase CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署（在项目根目录执行）
cloudbase framework deploy
```

### 5. 域名配置
1. 在CloudBase控制台的"静态网站托管"中找到"CNAME记录"
2. 记录下这个CNAME值
3. 进入腾讯云域名管理，添加CNAME解析记录
4. 主机记录：`www`（或其他子域名）
5. 记录类型：`CNAME`
6. 记录值：填入刚才记录的CNAME值

### 6. SSL证书配置
1. 在CloudBase控制台进入"静态网站托管"
2. 点击"HTTPS设置"
3. 选择"申请免费证书"
4. 输入已备案的域名
5. 等待证书自动签发（通常几分钟）

## 💰 费用说明

### 免费额度（足够个人使用）
- 静态网站托管：10GB存储空间
- CDN流量：每月10GB
- 请求次数：每日10万次
- SSL证书：永久免费

### 超出部分费用（极低）
- 额外存储：￥0.12/GB/月
- 额外流量：￥0.18/GB
- 额外请求：￥0.00001/次

## 🔄 与现有项目的兼容性

你的项目完美适配CloudBase，因为：
✅ 纯静态网站（HTML/CSS/JS）
✅ 无服务器依赖
✅ 响应式设计
✅ 已有完善的SEO配置

## 📊 性能优化建议

1. **图片优化**：将Unsplash图片替换为本地优化图片
2. **CDN加速**：CloudBase自带全球CDN
3. **缓存策略**：在CloudBase控制台设置缓存规则
4. **gzip压缩**：自动开启

## 🔧 后续维护

### 更新网站内容
```bash
# 方法1：重新上传文件到CloudBase控制台
# 方法2：使用CLI快速部署
cloudbase hosting:upload ./ / -e your-env-id
```

### 监控访问数据
- CloudBase控制台提供详细的访问统计
- 可集成腾讯云监控服务
- 支持自定义日志分析

## 🆘 常见问题

**Q: 需要备案吗？**
A: 如果使用腾讯云提供的默认域名（.tcloudbaseapp.com），不需要备案。如果绑定自己的域名，则需要备案。

**Q: 部署后访问慢怎么办？**
A: 可以在CloudBase控制台开启CDN加速，或者检查图片是否进行了优化。

**Q: 如何回滚到旧版本？**
A: CloudBase支持版本管理，可以在控制台查看历史版本并回滚。