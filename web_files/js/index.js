// 首页数据加载和交互
document.addEventListener('DOMContentLoaded', function() {
    console.log('首页数据加载初始化...');
    
    // 初始化数据服务
    const dataService = new FrontendDataService();
    
    // 加载精选作品
    loadFeaturedWorks(dataService);
    
    // 加载最新文章
    loadLatestPosts(dataService);
    
    // 加载网站设置（用于页脚等）
    loadSiteSettings(dataService);
    
    // 设置事件监听器
    setupEventListeners(dataService);
});

// 加载精选作品
async function loadFeaturedWorks(dataService) {
    try {
        const worksContainer = document.querySelector('.works-grid');
        if (!worksContainer) {
            console.log('未找到作品展示容器，跳过加载');
            return;
        }
        
        // 显示加载状态
        worksContainer.innerHTML = '<div class="loading">正在加载作品...</div>';
        
        // 获取精选作品
        const works = await dataService.getPortfolio(null, true, 4);
        
        // 清空容器
        worksContainer.innerHTML = '';
        
        // 渲染作品卡片
        works.forEach(work => {
            const cardHtml = dataService.renderPortfolioCard(work);
            worksContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        // 添加查看详情事件
        addWorkDetailListeners(dataService);
        
        console.log(`成功加载 ${works.length} 个精选作品`);
    } catch (error) {
        console.error('加载精选作品失败:', error);
        // 显示错误信息
        const worksContainer = document.querySelector('.works-grid');
        if (worksContainer) {
            worksContainer.innerHTML = '<div class="error">作品加载失败，请刷新页面重试</div>';
        }
    }
}

// 加载最新文章
async function loadLatestPosts(dataService) {
    try {
        const postsContainer = document.querySelector('.posts-grid, .blog-grid, .articles-grid');
        if (!postsContainer) {
            console.log('未找到文章展示容器，跳过加载');
            return;
        }
        
        // 显示加载状态
        postsContainer.innerHTML = '<div class="loading">正在加载文章...</div>';
        
        // 获取最新文章
        const posts = await dataService.getPosts(null, true, 3);
        
        // 清空容器
        postsContainer.innerHTML = '';
        
        // 渲染文章卡片
        posts.forEach(post => {
            const cardHtml = dataService.renderPostCard(post);
            postsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        // 添加阅读全文事件
        addPostReadListeners(dataService);
        
        console.log(`成功加载 ${posts.length} 篇最新文章`);
    } catch (error) {
        console.error('加载最新文章失败:', error);
        // 显示错误信息
        const postsContainer = document.querySelector('.posts-grid, .blog-grid, .articles-grid');
        if (postsContainer) {
            postsContainer.innerHTML = '<div class="error">文章加载失败，请刷新页面重试</div>';
        }
    }
}

// 加载网站设置
async function loadSiteSettings(dataService) {
    try {
        const settings = await dataService.getSettings();
        
        // 更新网站标题和描述（如果不同）
        updateSiteInfo(settings);
        
        // 更新社交媒体链接
        updateSocialLinks(settings);
        
        console.log('网站设置加载成功');
    } catch (error) {
        console.error('加载网站设置失败:', error);
    }
}

// 更新网站信息
function updateSiteInfo(settings) {
    // 更新标题（如果当前是默认标题）
    const pageTitle = document.querySelector('title');
    const siteTitle = document.querySelector('.site-title, .logo-text');
    const heroTitle = document.querySelector('.hero-title .highlight');
    
    if (settings.site_title && settings.site_title !== 'CreatorHub') {
        if (pageTitle && pageTitle.textContent.includes('CreatorHub')) {
            pageTitle.textContent = pageTitle.textContent.replace('CreatorHub', settings.site_title);
        }
        if (siteTitle) {
            siteTitle.textContent = settings.site_title;
        }
    }
    
    // 更新英雄部分的名称
    if (settings.site_title && heroTitle) {
        heroTitle.textContent = settings.site_title;
    }
}

// 更新社交媒体链接
function updateSocialLinks(settings) {
    if (!settings.social) return;
    
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        const title = link.getAttribute('title');
        if (title) {
            let url = '';
            
            switch(title) {
                case '微信':
                    // 微信不直接跳转链接
                    break;
                case '微博':
                    url = settings.social.weibo;
                    break;
                case 'B站':
                    url = settings.social.bilibili;
                    break;
                case '抖音':
                    url = settings.social.douyin;
                    break;
                case '小红书':
                    url = settings.social.xiaohongshu;
                    break;
            }
            
            if (url && url !== '#' && !url.includes('xxx')) {
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        }
    });
}

// 添加作品详情事件监听
function addWorkDetailListeners(dataService) {
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', async function() {
            const workId = this.getAttribute('data-id');
            if (!workId) return;
            
            // 增加浏览量
            await dataService.incrementViews(workId);
            
            // 获取作品详情
            const work = await dataService.getPortfolioItem(workId);
            if (work) {
                showWorkModal(work);
            } else {
                alert('无法加载作品详情，请稍后重试');
            }
        });
    });
}

// 添加文章阅读事件监听
function addPostReadListeners(dataService) {
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-id');
            if (!postId) return;
            
            // 这里可以跳转到文章详情页或显示模态框
            // 暂时跳转到copywriting.html
            window.location.href = `copywriting.html?post=${postId}`;
        });
    });
}

// 显示作品模态框
function showWorkModal(work) {
    // 创建模态框HTML
    const modalHtml = `
        <div class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        ">
            <div class="modal-content" style="
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                border-radius: 24px;
                padding: 32px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                position: relative;
            ">
                <button class="modal-close" style="
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
                
                <div class="modal-header" style="margin-bottom: 24px;">
                    <span class="work-category" style="
                        display: inline-block;
                        background: rgba(99, 102, 241, 0.2);
                        color: #818cf8;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 0.875rem;
                        font-weight: 600;
                        margin-bottom: 16px;
                    ">${work.category === 'video' ? '🎬 视频' : work.category === 'photo' ? '📷 摄影' : '🏢 品牌'}</span>
                    <h2 style="color: #fff; font-size: 2rem; margin-bottom: 12px;">${work.title}</h2>
                    <p style="color: #94a3b8; font-size: 1rem;">${work.description}</p>
                </div>
                
                <div class="modal-body">
                    <div class="work-image" style="margin-bottom: 24px;">
                        <img src="${work.cover_url}" alt="${work.title}" style="
                            width: 100%;
                            border-radius: 16px;
                        ">
                    </div>
                    
                    <div class="work-info" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 16px;
                        margin-bottom: 24px;
                    ">
                        <div class="info-item" style="
                            background: rgba(255, 255, 255, 0.05);
                            padding: 16px;
                            border-radius: 12px;
                        ">
                            <div style="color: #94a3b8; font-size: 0.875rem;">客户</div>
                            <div style="color: #fff; font-weight: 600;">${work.client || '个人项目'}</div>
                        </div>
                        <div class="info-item">
                            <div style="color: #94a3b8; font-size: 0.875rem;">年份</div>
                            <div style="color: #fff; font-weight: 600;">${work.year || '2024'}</div>
                        </div>
                        <div class="info-item">
                            <div style="color: #94a3b8; font-size: 0.875rem;">浏览量</div>
                            <div style="color: #fff; font-weight: 600;">${dataService.formatNumber(work.views || 0)}</div>
                        </div>
                        <div class="info-item">
                            <div style="color: #94a3b8; font-size: 0.875rem;">点赞数</div>
                            <div style="color: #fff; font-weight: 600;">${dataService.formatNumber(work.likes || 0)}</div>
                        </div>
                    </div>
                    
                    ${work.details ? `
                    <div class="work-details" style="margin-bottom: 24px;">
                        <h3 style="color: #fff; font-size: 1.25rem; margin-bottom: 12px;">作品详情</h3>
                        <p style="color: #e2e8f0; line-height: 1.6;">${work.details}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="modal-footer" style="
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 24px;
                ">
                    <button class="btn-like" style="
                        background: rgba(239, 68, 68, 0.2);
                        color: #ef4444;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-heart"></i>
                        点赞 (${dataService.formatNumber(work.likes || 0)})
                    </button>
                    <button class="btn-close" style="
                        background: rgba(99, 102, 241, 0.2);
                        color: #818cf8;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                    ">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 添加事件监听
    const modal = document.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtn2 = modal.querySelector('.btn-close');
    const likeBtn = modal.querySelector('.btn-like');
    
    // 关闭模态框
    const closeModal = () => {
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    closeBtn2.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // 点赞功能
    likeBtn.addEventListener('click', async () => {
        const result = await dataService.incrementLikes(work.id);
        if (result.success) {
            likeBtn.innerHTML = `<i class="fas fa-heart"></i> 点赞 (${dataService.formatNumber(result.likes)})`;
            likeBtn.style.background = 'rgba(34, 197, 94, 0.2)';
            likeBtn.style.color = '#22c55e';
            
            // 更新页面上的点赞数
            const workCard = document.querySelector(`.work-card[data-id="${work.id}"] .work-stat:nth-child(2)`);
            if (workCard) {
                workCard.innerHTML = `<i class="fas fa-heart"></i> ${dataService.formatNumber(result.likes)}`;
            }
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 设置其他事件监听器
function setupEventListeners(dataService) {
    // 这里可以添加其他首页特定的事件监听器
    console.log('首页事件监听器已设置');
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .loading {
        text-align: center;
        padding: 40px;
        color: #94a3b8;
        font-size: 1rem;
    }
    
    .error {
        text-align: center;
        padding: 40px;
        color: #ef4444;
        font-size: 1rem;
        background: rgba(239, 68, 68, 0.1);
        border-radius: 12px;
    }
    
    .work-stats {
        display: flex;
        gap: 16px;
        margin-top: 8px;
        margin-bottom: 12px;
    }
    
    .work-stat {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #94a3b8;
        font-size: 0.875rem;
    }
    
    .work-stat i {
        font-size: 0.75rem;
    }
`;
document.head.appendChild(style);