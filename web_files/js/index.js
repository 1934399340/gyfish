// 首页数据加载 - 使用新的DataService
document.addEventListener('DOMContentLoaded', function() {
    console.log('首页初始化...');

    // 加载首页内容
    loadHomeContent();

    // 加载精选作品
    loadFeaturedWorks();

    // 加载最新文章
    loadLatestArticles();

    // 加载统计数据
    loadHomeStats();
});

// 加载首页英雄区域内容
async function loadHomeContent() {
    try {
        const content = await window.DataService.loadContent('home-hero');
        if (content) {
            const heroTitle = document.querySelector('.hero-title .highlight');
            const heroSubtitle = document.querySelector('.hero-subtitle');

            if (heroTitle && content.heading) {
                heroTitle.textContent = content.heading.replace('你好，我是', '');
            }
            if (heroSubtitle && content.subheading) {
                heroSubtitle.innerHTML = content.subheading.replace(/ · /g, '<br>');
            }
        }
    } catch (error) {
        console.error('加载首页内容失败:', error);
    }
}

// 加载首页统计数据
async function loadHomeStats() {
    try {
        const content = await window.DataService.loadContent('home-stats');
        if (content && content.heading) {
            const parts = content.heading.split('·');
            const statNumbers = document.querySelectorAll('.stat-number');
            const statLabels = document.querySelectorAll('.stat-label');

            if (parts.length >= 3 && statNumbers.length >= 3) {
                statNumbers[0].textContent = parts[0].trim();
                statNumbers[1].textContent = parts[1].trim();
                statNumbers[2].textContent = parts[2].trim();
            }
        }
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 加载精选作品
async function loadFeaturedWorks() {
    const worksContainer = document.querySelector('.works-grid, .featured-grid');
    if (!worksContainer) return;

    try {
        worksContainer.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';

        const works = await window.DataService.loadWorks();

        if (works.length === 0) {
            worksContainer.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);">暂无作品</p>';
            return;
        }

        // 只显示前4个作为精选
        const featured = works.slice(0, 4);
        worksContainer.innerHTML = featured.map(window.DataService.renderWorkCard).join('');

        console.log(`已加载 ${featured.length} 个精选作品`);
    } catch (error) {
        console.error('加载作品失败:', error);
        worksContainer.innerHTML = '<p style="text-align:center;padding:40px;color:var(--danger);">作品加载失败</p>';
    }
}

// 加载最新文章
async function loadLatestArticles() {
    const articlesContainer = document.querySelector('.posts-grid, .blog-grid, .articles-grid, .latest-posts');
    if (!articlesContainer) return;

    try {
        articlesContainer.innerHTML = '<p style="text-align:center;padding:40px;">加载中...</p>';

        const articles = await window.DataService.loadArticles();

        if (articles.length === 0) {
            articlesContainer.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray);">暂无文章</p>';
            return;
        }

        // 只显示前3个
        const latest = articles.slice(0, 3);
        articlesContainer.innerHTML = latest.map(window.DataService.renderArticleCard).join('');

        console.log(`已加载 ${latest.length} 篇最新文章`);
    } catch (error) {
        console.error('加载文章失败:', error);
        articlesContainer.innerHTML = '<p style="text-align:center;padding:40px;color:var(--danger);">文章加载失败</p>';
    }
}

// 数字动画效果
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(el => {
        const target = el.textContent;
        const isPercent = target.includes('%');
        const isPlus = target.includes('+');
        const num = parseInt(target.replace(/[^0-9]/g, ''));

        if (isNaN(num)) return;

        let current = 0;
        const increment = num / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= num) {
                current = num;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current) + (isPlus ? '+' : '') + (isPercent ? '%' : '');
        }, 30);
    });
}

// 页面加载完成后执行动画
window.addEventListener('load', () => {
    setTimeout(animateNumbers, 500);
});
