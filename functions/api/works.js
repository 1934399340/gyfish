// 作品管理 API (CRUD)
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
  const category = url.searchParams.get('category');

  try {
    const { request, env } = context;

    // GET - 获取作品列表或单个作品
    if (request.method === 'GET') {
      if (id) {
        // 获取单个作品
        const { results } = await env.DB.prepare(
          'SELECT * FROM works WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '作品不存在'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          work: results[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // 获取作品列表
        let query = 'SELECT * FROM works';
        const params = [];

        if (category) {
          query += ' WHERE category = ?';
          params.push(category);
        }

        query += ' ORDER BY sort_order ASC, created_at DESC';

        const { results } = params.length > 0
          ? await env.DB.prepare(query).bind(...params).all()
          : await env.DB.prepare(query).all();

        return new Response(JSON.stringify({
          success: true,
          works: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST - 创建作品
    if (request.method === 'POST') {
      const body = await request.json();
      const { category, title, description, content, image_url, video_url, tools, duration, client, featured, sort_order, status } = body;

      if (!category || !title) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少必要字段'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await env.DB.prepare(`
        INSERT INTO works (category, title, description, content, image_url, video_url, tools, duration, client, featured, sort_order, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        category,
        title,
        description || '',
        content || '',
        image_url || '',
        video_url || '',
        tools || '',
        duration || '',
        client || '',
        featured ? 1 : 0,
        sort_order || 0,
        status || 'published'
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: '作品创建成功',
        id: result.meta.last_row_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT - 更新作品
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少作品ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();
      const { category, title, description, content, image_url, video_url, tools, duration, client, featured, sort_order, status } = body;

      await env.DB.prepare(`
        UPDATE works
        SET category = COALESCE(?, category),
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            content = COALESCE(?, content),
            image_url = COALESCE(?, image_url),
            video_url = COALESCE(?, video_url),
            tools = COALESCE(?, tools),
            duration = COALESCE(?, duration),
            client = COALESCE(?, client),
            featured = COALESCE(?, featured),
            sort_order = COALESCE(?, sort_order),
            status = COALESCE(?, status)
        WHERE id = ?
      `).bind(
        category,
        title,
        description,
        content,
        image_url,
        video_url,
        tools,
        duration,
        client,
        featured !== undefined ? (featured ? 1 : 0) : null,
        sort_order,
        status,
        id
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: '作品更新成功'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE - 删除作品
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少作品ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: '作品删除成功'
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
