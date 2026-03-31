// 消息管理 API - 使用 Resend API 发送邮件
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  try {
    const { request, env } = context;

    // GET - 获取消息列表
    if (request.method === 'GET') {
      if (id) {
        const { results } = await env.DB.prepare(
          'SELECT * FROM contact_messages WHERE id = ?'
        ).bind(id).all();

        return new Response(JSON.stringify({
          success: true,
          message: results[0] || null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { results } = await env.DB.prepare(
        'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100'
      ).all();

      return new Response(JSON.stringify({
        success: true,
        messages: results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST - 保存新消息并发送邮件
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, email, subject, message } = body;

      if (!name || !email || !message) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少必要字段'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 保存到数据库
      const result = await env.DB.prepare(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
      ).bind(name, email, subject || 'other', message).run();

      // 发送邮件 - 使用 Resend API
      let emailSent = false;
      const subjectMap = {
        'video': '视频创作合作',
        'photo': '摄影服务',
        'copy': '文案策划',
        'other': '其他咨询'
      };
      const subjectText = subjectMap[subject] || subject;

      // Resend API 配置
      const RESEND_API_KEY = env.RESEND_API_KEY || 're_PvGsYXNC_NmgK4XjjKqNsf5UkvRhh8PFm';
      const TO_EMAIL = '1934399340@qq.com';
      const FROM_EMAIL = 'onboarding@resend.dev'; // Resend 免费版必须用这个

      if (RESEND_API_KEY) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [TO_EMAIL],
              subject: `[${subjectText}] 来自 ${name} - CreatorHub`,
              html: `
                <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">📬 新的联系消息</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">CreatorHub 网站访客留言</p>
                  </div>
                  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569; width: 80px;">姓名</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">邮箱</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                          <a href="mailto:${email}" style="color: #6366f1; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">主题</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${subjectText}</td>
                      </tr>
                    </table>
                    <div style="margin-top: 20px; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #6366f1;">
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <a href="mailto:${email}" style="display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
                        回复此人
                      </a>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        此邮件由 <a href="https://gyfish.pages.dev" style="color: #6366f1;">CreatorHub</a> 自动发送<br>
                        收到时间：${new Date().toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              `
            })
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            if (emailResult.id) {
              emailSent = true;
              console.log('邮件发送成功:', emailResult.id);
            }
          } else {
            const errorText = await emailResponse.text();
            console.error('Resend 邮件发送失败:', emailResponse.status, errorText);
          }
        } catch (emailError) {
          console.error('邮件发送异常:', emailError);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: '消息已保存',
        emailSent: emailSent
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT - 标记消息为已读
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少消息ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await env.DB.prepare(
        'UPDATE contact_messages SET read = 1 WHERE id = ?'
      ).bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: '消息已标记为已读'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE - 删除消息
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少消息ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await env.DB.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: '消息已删除'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
