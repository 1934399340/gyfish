// 邮件发送云函数
const nodemailer = require('nodemailer');

exports.main = async (event, context) => {
  try {
    // 解析请求数据
    const { name, email, subject, message } = JSON.parse(event.body);
    
    // 验证必要字段
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: '请填写完整信息'
        })
      };
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: '请输入有效的邮箱地址'
        })
      };
    }
    
    // 配置邮件发送器（使用QQ邮箱SMTP）
    const transporter = nodemailer.createTransporter({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: '1934399340@qq.com',
        pass: 'hwdrnkqdgdlnbiia' // QQ邮箱SMTP授权码
      }
    });
    
    // 邮件内容
    const mailOptions = {
      from: '"CreatorHub Contact" <1934399340@qq.com>',
      to: '1934399340@qq.com',
      subject: `[联系表单] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">新联系消息</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>姓名：</strong> ${name}</p>
            <p><strong>邮箱：</strong> ${email}</p>
            <p><strong>主题：</strong> ${subject}</p>
            <p><strong>时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3>留言内容：</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            此邮件来自 CreatorHub 网站联系表单
          </p>
        </div>
      `
    };
    
    // 发送邮件
    await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: '消息发送成功！我们会尽快回复您。'
      })
    };
    
  } catch (error) {
    console.error('邮件发送失败:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: '发送失败，请稍后重试或直接通过邮箱联系'
      })
    };
  }
};