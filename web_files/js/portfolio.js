// 作品集页面动态数据加载 - 支持展开/折叠详情
document.addEventListener('DOMContentLoaded', async function() {
    console.log('作品集页面初始化...');

    // 加载所有作品
    await loadAllPortfolio();

    // 设置事件监听器
    setupPortfolioEventListeners();
});

// 加载所有作品
async function loadAllPortfolio() {
    try {
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (!portfolioGrid) {
            console.error('找不到作品网格容器');
            return;
        }

        // 显示加载状态
        portfolioGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">正在加载作品...</div>';

        // 获取所有作品
        const allWorks = await window.DataService.loadWorks();

        // 清空容器
        portfolioGrid.innerHTML = '';

        if (allWorks.length === 0) {
            portfolioGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>暂无作品</p></div>';
            return;
        }

        // 渲染作品到网格
        renderPortfolioGrid(allWorks);

        console.log(`成功加载 ${allWorks.length} 个作品`);
    } catch (error) {
        console.error('加载作品失败:', error);
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px;">作品加载失败</div>';
        }
    }
}

// 渲染作品网格 - 支持展开/折叠
function renderPortfolioGrid(works) {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    const categoryNames = window.DataService.CATEGORY_NAMES;

    works.forEach((work, index) => {
        const isLargeCard = index === 0;
        const cardClass = isLargeCard ? 'work-card work-card-large' : 'work-card';

        const article = document.createElement('article');
        article.className = 'masonry-item';
        article.dataset.id = work.id;
        article.dataset.category = work.category || 'video';

        article.innerHTML = `
            <div class="${cardClass}">
                <div class="work-image-wrapper">
                    <img src="${work.image_url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80'}"
                         alt="${work.title}" loading="lazy">
                    <div class="work-gradient"></div>
                    ${work.featured ? '<div class="work-badge">精选</div>' : ''}
                </div>
                <div class="work-content">
                    <div class="work-meta">
                        <span class="work-category ${work.category}">${categoryNames[work.category] || '作品'}</span>
                        <span class="work-year">${new Date(work.created_at).getFullYear() || '2024'}</span>
                    </div>
                    <h3 class="work-title">${work.title}</h3>
                    <p class="work-desc">${work.description || ''}</p>
                    <div class="work-stats">
                        <span class="work-views">👁 ${work.views || 0}</span>
                        <span class="work-likes">❤️ ${work.likes || 0}</span>
                    </div>
                    <div class="work-actions">
                        <button class="work-btn toggle-details" data-id="${work.id}">
                            <span class="btn-text">展开详情</span>
                            <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <!-- 可展开的详情区域 -->
                <div class="work-details expandable" data-id="${work.id}">
                    <div class="work-details-content">
                        ${work.content ? `<div class="detail-section">
                            <h4>作品介绍</h4>
                            <p>${work.content}</p>
                        </div>` : ''}
                        ${work.tools ? `<div class="detail-section">
                            <h4>使用工具</h4>
                            <div class="tool-tags">${work.tools.split(',').map(t => `<span class="tool-tag">${t.trim()}</span>`).join('')}</div>
                        </div>` : ''}
                        ${work.duration ? `<div class="detail-section">
                            <h4>制作周期</h4>
                            <p>${work.duration}</p>
                        </div>` : ''}
                        ${work.client ? `<div class="detail-section">
                            <h4>客户</h4>
                            <p>${work.client}</p>
                        </div>` : ''}
                        ${work.video_url ? `<div class="detail-section">
                            <h4>视频链接</h4>
                            <a href="${work.video_url}" target="_blank" class="video-link">观看完整视频 →</a>
                        </div>` : ''}
                        <div class="detail-meta">
                            <span>发布时间: ${new Date(work.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        portfolioGrid.appendChild(article);
    });

    // 添加展开/折叠事件
    addExpandListeners();
}

// 添加展开/折叠事件监听
function addExpandListeners() {
    document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', function() {
            const workId = this.getAttribute('data-id');
            const detailsEl = document.querySelector(`.work-details[data-id="${workId}"]`);
            const btnText = this.querySelector('.btn-text');
            const btnArrow = this.querySelector('.btn-arrow');

            if (detailsEl.classList.contains('expanded')) {
                // 折叠
                detailsEl.classList.remove('expanded');
                btnText.textContent = '展开详情';
                btnArrow.style.transform = 'rotate(0deg)';
            } else {
                // 展开
                detailsEl.classList.add('expanded');
                btnText.textContent = '收起详情';
                btnArrow.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// 根据ID获取作品
async function getWorkById(id) {
    try {
        const response = await fetch(`${window.DataService.API_BASE || ''}/api/works?id=${id}`);
        const result = await response.json();
        return result.success ? result.work : null;
    } catch (error) {
        console.error('获取作品详情失败:', error);
        return null;
    }
}

// 设置其他事件监听器
function setupPortfolioEventListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const filter = this.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const portfolioGrid = document.getElementById('portfolioGrid');
            if (!portfolioGrid) return;

            portfolioGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">加载中...</div>';

            const works = await window.DataService.loadWorks(filter === 'all' ? null : filter);

            portfolioGrid.innerHTML = '';

            if (works.length === 0) {
                portfolioGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>暂无作品</p></div>';
                return;
            }

            renderPortfolioGrid(works);
        });
    });
}
