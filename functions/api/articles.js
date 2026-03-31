// 文章管理 API (CRUD)
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

    // GET - 获取文章列表或单篇文章
    if (request.method === 'GET') {
      if (id) {
        // 获取单篇文章
        const { results } = await env.DB.prepare(
          'SELECT * FROM articles WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            error: '文章不存在'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          article: results[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // 获取文章列表
        let query = 'SELECT * FROM articles';
        const params = [];

        if (category) {
          query += ' WHERE category = ?';
          params.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const { results } = params.length > 0
          ? await env.DB.prepare(query).bind(...params).all()
          : await env.DB.prepare(query).all();

        return new Response(JSON.stringify({
          success: true,
          articles: results
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST - 创建文章
    if (request.method === 'POST') {
      const body = await request.json();
      const { category, title, content, excerpt, author, status } = body;

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
        INSERT INTO articles (category, title, content, excerpt, author, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        category,
        title,
        content || '',
        excerpt || '',
        author || '李桂宇',
        status || 'published'
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: '文章创建成功',
        id: result.meta.last_row_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT - 更新文章
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少文章ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();
      const { category, title, content, excerpt, author, status } = body;

      await env.DB.prepare(`
        UPDATE articles
        SET category = COALESCE(?, category),
            title = COALESCE(?, title),
            content = COALESCE(?, content),
            excerpt = COALESCE(?, excerpt),
            author = COALESCE(?, author),
            status = COALESCE(?, status)
        WHERE id = ?
      `).bind(
        category,
        title,
        content,
        excerpt,
        author,
        status,
        id
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: '文章更新成功'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE - 删除文章
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少文章ID'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: '文章删除成功'
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
