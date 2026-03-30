# 🔐 CreatorHub 安全管理配置指南

## 🛡️ 安全架构设计

### 多层安全防护体系
1. **访问码验证** - 第一层防护
2. **邮箱密码认证** - 第二层防护  
3. **两步验证(TOTP)** - 第三层防护
4. **IP白名单** - 网络层防护
5. **会话管理** - 时间限制防护

## 🔧 GitHub OAuth 配置步骤

### 1. 创建 GitHub OAuth App

**访问地址**：[GitHub Developer Settings](https://github.com/settings/developers)

**应用配置**：
```
Application name: CreatorHub Admin
Homepage URL: https://gyfish-4gbxsy3dc619f1e8-1416769265.tcloudbaseapp.com
Authorization callback URL: https://gyfish-4gbxsy3dc619f1e8.service.tcloudbase.com/auth/github/callback
```

### 2. 获取认证凭证
- **Client ID**：从GitHub应用页面获取
- **Client Secret**：生成并妥善保管

### 3. CloudBase 配置
在腾讯云CloudBase控制台：
1. 进入"登录鉴权"模块
2. 选择"GitHub登录"
3. 填入Client ID和Client Secret
4. 设置回调URL
5. 限定允许登录的GitHub用户名

## 🎯 管理员账户设置

### 预配置管理员信息
```json
{
  "adminUsers": [
    {
      "email": "1934399340@qq.com",
      "githubUsername": "your-github-username",
      "role": "super_admin",
      "permissions": ["all"],
      "status": "active"
    }
  ]
}
```

### 访问码生成规则
- 6位数字组合
- 每24小时更换一次
- 通过安全渠道发送到管理员邮箱
- 失败5次自动锁定30分钟

## 🔒 安全最佳实践

### 密码策略
- 最小长度：12位
- 必须包含：大小写字母、数字、特殊字符
- 定期更换：每90天
- 不可重复：最近5次密码不能相同

### 会话安全
- 自动超时：24小时无操作
- IP绑定：会话与IP地址绑定
- 并发限制：同一账户最多2个活跃会话

### 监控告警
- 登录失败告警
- 异常IP访问告警
- 权限变更告警
- 系统安全事件告警

## 🚀 部署安全配置

### 1. 部署安全登录页面
```bash
# 部署安全登录系统
tcb hosting deploy admin/secure-login.html --envId gyfish-4gbxsy3dc619f1e8
```

### 2. 配置安全策略
- 在CloudBase控制台设置访问白名单
- 配置GitHub OAuth应用
- 设置安全组规则

### 3. 测试安全功能
- 验证多因子认证
- 测试访问控制
- 验证会话管理

## ⚠️ 紧急安全措施

### 立即执行的安全设置
1. **禁用公共注册**：只允许邀请注册
2. **启用强制两步验证**：所有管理员必须使用
3. **设置IP白名单**：限制访问来源
4. **配置安全监控**：实时监控异常行为

### 安全应急响应
- 发现异常立即更改所有密码
- 撤销可疑会话
- 检查系统日志
- 必要时暂时关闭系统访问

## 📋 需要你操作的步骤

### 立即执行（5分钟内）：
1. **访问安全登录页面**：
   ```
   https://gyfish-4gbxsy3dc619f1e8-1416769265.tcloudbaseapp.com/admin/secure-login.html
   ```

2. **使用预设凭据登录**：
   - 访问码：`123456`（临时测试用）
   - 邮箱：`1934399340@qq.com`
   - 密码：你设定的密码
   - 两步验证码：查看控制台输出的6位数字

### 后续安全配置（建议24小时内完成）：
1. 在GitHub创建OAuth应用
2. 在CloudBase配置GitHub登录
3. 更改默认访问码为动态生成
4. 启用完整的安全监控

---

**安全提醒**：首次登录后请立即更改默认访问码，并按照安全最佳实践配置完整防护体系。