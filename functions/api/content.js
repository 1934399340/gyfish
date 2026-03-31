// 内容管理 API
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const page = url.searchParams.get('page');
  const category = url.searchParams.get('category');

  try {
    const { request, env } = context;

    // GET - 获取内容
    if (request.method === 'GET') {
      if (page) {
        // 获取指定页面内容
        const { results } = await env.DB.prepare(
          'SELECT * FROM content WHERE page = ?'
        ).bind(page).all();

        return new Response(JSON.stringify({
          success: true,
          content: results[0] || null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (category) {
        // 按分类获取内容
        const { results } = await env.DB.prepare(
          'SELECT * FROM content WHERE page LIKE ? ORDER BY page'
        ).bind(`${category}%`).all();

        return new Response(JSON.stringify({
          success: true,
          contents: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // 获取所有内容
        const { results } = await env.DB.prepare(
          'SELECT * FROM content ORDER BY page'
        ).all();

        return new Response(JSON.stringify({
          success: true,
          contents: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // PUT - 更新内容
    if (request.method === 'PUT') {
      if (!page) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少页面标识'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();
      const { title, description, heading, subheading, content, excerpt } = body;

      // 检查内容是否存在
      const { results } = await env.DB.prepare(
        'SELECT id FROM content WHERE page = ?'
      ).bind(page).all();

      if (results.length > 0) {
        // 更新现有内容
        await env.DB.prepare(`
          UPDATE content
          SET title = COALESCE(?, title),
              description = COALESCE(?, description),
              heading = COALESCE(?, heading),
              subheading = COALESCE(?, subheading),
              content = COALESCE(?, content),
              excerpt = COALESCE(?, excerpt),
              updated_at = CURRENT_TIMESTAMP
          WHERE page = ?
        `).bind(title, description, heading, subheading, content, excerpt, page).run();
      } else {
        // 创建新内容
        await env.DB.prepare(`
          INSERT INTO content (page, title, description, heading, subheading, content, excerpt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(page, title || '', description || '', heading || '', subheading || '', content || '', excerpt || '').run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: '内容已更新'
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
