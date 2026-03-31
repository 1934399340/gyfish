// 管理员账户管理 API
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const action = url.searchParams.get('action');

  try {
    const { request, env } = context;

    // 获取账户信息
    if (request.method === 'GET' && action === 'info') {
      const { results } = await env.DB.prepare(
        'SELECT username, created_at FROM admin_account LIMIT 1'
      ).all();

      if (results.length > 0) {
        return new Response(JSON.stringify({
          success: true,
          account: {
            username: results[0].username,
            createdAt: results[0].created_at
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          error: '账号不存在'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // 修改用户名
    if (request.method === 'PUT' && action === 'username') {
      const body = await request.json();
      const { currentPassword, newUsername } = body;

      if (!currentPassword || !newUsername) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少必要参数'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 验证当前密码
      const { results } = await env.DB.prepare(
        'SELECT * FROM admin_account WHERE password = ?'
      ).bind(currentPassword).all();

      if (results.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: '当前密码错误'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 更新用户名
      await env.DB.prepare(
        'UPDATE admin_account SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE password = ?'
      ).bind(newUsername, currentPassword).run();

      return new Response(JSON.stringify({
        success: true,
        message: '用户名已更新'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 修改密码
    if (request.method === 'PUT' && action === 'password') {
      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少必要参数'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 验证当前密码
      const { results } = await env.DB.prepare(
        'SELECT * FROM admin_account WHERE password = ?'
      ).bind(currentPassword).all();

      if (results.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: '当前密码错误'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 更新密码
      await env.DB.prepare(
        'UPDATE admin_account SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE password = ?'
      ).bind(newPassword, currentPassword).run();

      return new Response(JSON.stringify({
        success: true,
        message: '密码已更新'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 重置账户
    if (request.method === 'POST' && action === 'reset') {
      await env.DB.prepare(
        'UPDATE admin_account SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP'
      ).bind('admin', 'admin').run();

      return new Response(JSON.stringify({
        success: true,
        message: '账户已重置为默认 admin/admin'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
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
