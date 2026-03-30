# 域名解析和SSL证书配置指南

## 🌐 域名解析配置

### 1. 获取CloudBase CNAME记录

在腾讯云CloudBase控制台操作：
1. 进入"静态网站托管"页面
2. 找到"域名信息"或"CNAME记录"部分
3. 记录显示的CNAME值（类似：`your-site-123456.tcloudbaseapp.com`）

### 2. 配置DNS解析

根据你的域名注册商选择对应配置：

#### 腾讯云域名（推荐）
1. 进入[腾讯云域名控制台](https://console.cloud.tencent.com/domain)
2. 选择要配置的域名
3. 点击"解析"按钮
4. 添加记录：
   ```
   记录类型：CNAME
   主机记录：www
   记录值：[你在步骤1中记录的CNAME值]
   TTL：600
   ```

#### 其他域名注册商
常见的DNS配置示例：

**阿里云万网**
- 控制台 → 域名 → 解析设置 → 添加记录

**华为云**
- 控制台 → 域名解析 → 添加记录

**新网**
- 域名管理 → DNS解析 → 添加解析

### 3. 验证解析生效

```bash
# Windows命令行
nslookup www.yourdomain.com

# Linux/Mac终端
dig www.yourdomain.com

# 或使用在线工具
https://www.whatsmydns.net/
```

等待DNS传播（通常5分钟-24小时）

## 🔒 SSL证书配置

### 方法一：CloudBase自动申请（推荐）

1. 在CloudBase控制台进入"静态网站托管"
2. 点击"HTTPS设置"
3. 选择"申请免费证书"
4. 输入你的域名（如：www.yourdomain.com）
5. 等待自动签发（通常几分钟内完成）

### 方法二：手动上传证书

如果你已有SSL证书：
1. 在"HTTPS设置"中选择"上传证书"
2. 上传证书文件（.crt/.pem格式）
3. 上传私钥文件（.key格式）
4. 提交并等待生效

## 🧪 配置验证

### 1. HTTPS访问测试
```
https://www.yourdomain.com
```

应该能看到绿色锁图标，表示SSL正常工作

### 2. 混合内容检查
确保所有资源都通过HTTPS加载：
- 图片链接使用https://
- CSS/JS文件使用相对路径或https://

### 3. 重定向配置（可选）
在CloudBase中设置HTTP到HTTPS自动重定向：
1. 进入"静态网站托管" → "HTTPS设置"
2. 开启"强制HTTPS"选项

## ⚠️ 常见问题解决

### DNS解析不生效
- 检查记录是否正确添加
- 等待更长时间（最长24小时）
- 清除本地DNS缓存

### SSL证书申请失败
- 确保域名已完成备案
- 检查DNS解析是否生效
- 确认域名所有权

### 混合内容警告
- 检查HTML中是否有http://资源引用
- 替换为相对路径或https://链接

## 📋 配置检查清单

- [ ] 已获取CloudBase CNAME记录
- [ ] 已在域名服务商添加CNAME解析
- [ ] DNS解析已生效（可ping通）
- [ ] 已申请SSL证书
- [ ] HTTPS访问正常
- [ ] 无混合内容警告
- [ ] 移动端访问正常
- [ ] 所有页面功能测试通过

完成以上配置后，你的网站就可以通过自定义域名安全访问了！