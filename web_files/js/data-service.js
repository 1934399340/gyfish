// 前端数据服务 - 从Cloudflare Pages API加载数据

const API_BASE = '';

// 作品分类名称映射
const CATEGORY_NAMES = {
    video: '视频创作',
    image: '图片作品',
    branding: '品牌定制'
};

// 文章分类名称映射
const ARTICLE_CATEGORY_NAMES = {
    copywriting: '文案研究',
    editing: '剪辑技巧',
    photography: '摄影'
};

// 加载作品列表
async function loadWorks(category = null) {
    try {
        const url = category
            ? `${API_BASE}/api/works?category=${category}`
            : `${API_BASE}/api/works`;
        const response = await fetch(url);
        const result = await response.json();
        return result.success ? result.works : [];
    } catch (error) {
        console.error('加载作品失败:', error);
        return [];
    }
}

// 加载文章列表
async function loadArticles(category = null) {
    try {
        const url = category
            ? `${API_BASE}/api/articles?category=${category}`
            : `${API_BASE}/api/articles`;
        const response = await fetch(url);
        const result = await response.json();
        return result.success ? result.articles : [];
    } catch (error) {
        console.error('加载文章失败:', error);
        return [];
    }
}

// 加载页面内容
async function loadContent(page) {
    try {
        const response = await fetch(`${API_BASE}/api/content?page=${page}`);
        const result = await response.json();
        return result.success ? result.content : null;
    } catch (error) {
        console.error('加载内容失败:', error);
        return null;
    }
}

// 渲染作品卡片 - 支持展开/折叠详情
function renderWorkCard(work) {
    const categoryName = CATEGORY_NAMES[work.category] || work.category;
    return `
        <article class="work-card" data-id="${work.id}">
            <div class="work-image">
                <img src="${work.image_url || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80'}"
                     alt="${work.title}" loading="lazy">
                ${work.featured ? '<div class="work-badge">精选</div>' : ''}
                <div class="work-overlay">
                    <span class="work-category">${categoryName}</span>
                    <h3 class="work-title">${work.title}</h3>
                    <p class="work-desc">${work.description || ''}</p>
                    ${work.video_url ? `<a href="${work.video_url}" class="work-link" target="_blank">观看视频 →</a>` : `<a href="portfolio.html" class="work-link">查看详情 →</a>`}
                </div>
            </div>
            <div class="work-details-inline">
                ${work.content ? `<p class="work-content-preview">${work.content.substring(0, 100)}${work.content.length > 100 ? '...' : ''}</p>` : ''}
                ${work.tools ? `<div class="work-tools"><span class="tool-tag">${work.tools.split(',')[0]}</span></div>` : ''}
            </div>
        </article>
    `;
}

// 渲染文章卡片
function renderArticleCard(article) {
    const date = new Date(article.created_at).toLocaleDateString('zh-CN');
    const categoryName = ARTICLE_CATEGORY_NAMES[article.category] || article.category;
    return `
        <article class="article-card">
            <div class="article-meta-top">
                <span class="article-category">${categoryName}</span>
                <span class="article-date">${date}</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt || '暂无摘要...'}</p>
            <div class="article-footer">
                <span class="article-author">${article.author || '李桂宇'}</span>
                <span class="article-read-more">阅读全文 →</span>
            </div>
        </article>
    `;
}

// 更新首页英雄区域
async function updateHomeHero() {
    const content = await loadContent('home-hero');
    if (content) {
        const titleEl = document.querySelector('.hero-title .highlight');
        const subtitleEl = document.querySelector('.hero-subtitle');
        if (titleEl && content.heading) {
            titleEl.textContent = content.heading.replace('你好，我是', '');
        }
        if (subtitleEl && content.subheading) {
            subtitleEl.innerHTML = content.subheading.replace(/·/g, '<br>');
        }
    }
}

// 更新首页统计数据
async function updateHomeStats() {
    const content = await loadContent('home-stats');
    if (content && content.heading) {
        const parts = content.heading.split('·');
        if (parts.length >= 3) {
            const statNumbers = document.querySelectorAll('.stat-number');
            const statLabels = document.querySelectorAll('.stat-label');
            if (statNumbers[0]) statNumbers[0].textContent = parts[0].trim();
            if (statNumbers[1]) statNumbers[1].textContent = parts[1].trim();
            if (statNumbers[2]) statNumbers[2].textContent = parts[2].trim();
        }
    }
}

// 加载首页精选作品
async function loadFeaturedWorks() {
    const works = await loadWorks();
    const featuredGrid = document.querySelector('.featured-grid, .works-grid');
    if (featuredGrid && works.length > 0) {
        const featured = works.slice(0, 4);
        featuredGrid.innerHTML = featured.map(renderWorkCard).join('');
    }
}

// 加载作品集页面作品
async function loadPortfolioPage(category = null) {
    const works = await loadWorks(category);
    const worksGrid = document.querySelector('.works-grid');
    if (worksGrid) {
        if (works.length === 0) {
            worksGrid.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);">暂无作品</p>';
        } else {
            worksGrid.innerHTML = works.map(renderWorkCard).join('');
        }
    }
}

// 加载文章列表页面
async function loadArticlesPage(category = null) {
    const articles = await loadArticles(category);
    const articlesList = document.querySelector('.articles-list, .posts-grid');
    if (articlesList) {
        if (articles.length === 0) {
            articlesList.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);">暂无文章</p>';
        } else {
            articlesList.innerHTML = articles.map(renderArticleCard).join('');
        }
    }
}

// 导出服务
window.DataService = {
    loadWorks,
    loadArticles,
    loadContent,
    renderWorkCard,
    renderArticleCard,
    updateHomeHero,
    updateHomeStats,
    loadFeaturedWorks,
    loadPortfolioPage,
    loadArticlesPage,
    CATEGORY_NAMES,
    ARTICLE_CATEGORY_NAMES
};
