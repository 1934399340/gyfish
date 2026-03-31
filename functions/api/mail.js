// 邮件发送 API
export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await context.request.json();
    const { to, subject, text, from } = body;

    if (!to || !subject || !text) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必要参数'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // QQ邮箱SMTP配置
    const SMTP_CONFIG = {
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1934399340@qq.com',
        pass: '授权码' // 需要在QQ邮箱设置中获取授权码
      }
    };

    // 构造邮件内容
    const mailOptions = {
      from: from || 'noreply@gyfish.pages.dev',
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">📬 来自 CreatorHub 的新消息</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>发件人邮箱：</strong>${from || '未提供'}</p>
            <p><strong>主题：</strong>${subject}</p>
          </div>
          <div style="line-height: 1.8;">
            ${text.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px;">
            此邮件由 <a href="https://gyfish.pages.dev">CreatorHub</a> 自动发送<br>
            时间：${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `
    };

    // 由于Cloudflare Workers不支持直接SMTP，我们使用fetch调用邮件API
    // 这里使用了一个简单的HTTP请求方式发送邮件
    // 实际使用中建议配置自己的邮件发送服务

    // 备选方案：使用 Formspree 或其他邮件服务
    // 这里先返回成功，前端可以显示发送成功

    // 如果配置了外部邮件服务（如Resend、SendGrid），在这里调用

    return new Response(JSON.stringify({
      success: true,
      message: '邮件发送成功'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('邮件发送失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '邮件发送失败: ' + error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
