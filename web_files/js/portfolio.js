// 作品集页面动态数据加载
document.addEventListener('DOMContentLoaded', async function() {
    console.log('作品集页面初始化...');
    
    // 初始化数据服务
    const dataService = new FrontendDataService();
    
    // 加载所有作品
    await loadAllPortfolio(dataService);
    
    // 更新统计数据
    await updatePortfolioStats(dataService);
    
    // 设置事件监听器
    setupPortfolioEventListeners(dataService);
});

// 加载所有作品
async function loadAllPortfolio(dataService) {
    try {
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (!portfolioGrid) {
            console.error('找不到作品网格容器');
            return;
        }
        
        // 显示加载状态
        portfolioGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">正在加载作品...</div>';
        showLoadingIndicator(true);
        
        // 获取所有作品
        const allWorks = await dataService.getPortfolio('all', null, 50);
        
        // 清空容器
        portfolioGrid.innerHTML = '';
        
        if (allWorks.length === 0) {
            portfolioGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px;"><p>暂无作品，请稍后再来</p></div>';
            return;
        }
        
        // 渲染作品到网格
        renderPortfolioGrid(allWorks, portfolioGrid, dataService);
        
        // 初始化过滤和排序
        initFilterAndSort(allWorks, portfolioGrid, dataService);
        
        console.log(`成功加载 ${allWorks.length} 个作品`);
    } catch (error) {
        console.error('加载作品失败:', error);
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '<div class="error" style="grid-column: 1/-1; text-align: center; padding: 40px;">作品加载失败，请刷新页面重试</div>';
        }
    } finally {
        showLoadingIndicator(false);
    }
}

// 渲染作品网格
function renderPortfolioGrid(works, container, dataService) {
    works.forEach((work, index) => {
        const workCard = createPortfolioCard(work, dataService, index);
        container.appendChild(workCard);
        
        // 添加动画延迟
        workCard.style.animationDelay = `${index * 0.05}s`;
    });
}

// 创建作品卡片DOM元素
function createPortfolioCard(work, dataService, index = 0) {
    const article = document.createElement('article');
    article.className = 'masonry-item';
    article.dataset.id = work.id;
    article.dataset.category = work.category;
    article.dataset.date = work.created_at ? work.created_at.substring(0, 7) : '2024-01';
    
    // 根据是否为精选作品决定卡片大小
    const isLargeCard = work.featured || index === 0;
    const cardClass = isLargeCard ? 'work-card-large' : 'work-card';
    
    const categoryLabels = {
        video: '视频创作',
        photo: '摄影作品',
        brand: '品牌案例'
    };
    
    const categoryIcons = {
        video: '🎬',
        photo: '📷',
        brand: '🏢'
    };
    
    article.innerHTML = `
        <div class="${cardClass}">
            <div class="work-image-wrapper">
                <img src="${work.cover_url || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80'}" 
                     alt="${work.title}" loading="lazy">
                ${work.featured ? '<div class="work-badge">精选</div>' : ''}
                <div class="work-gradient"></div>
            </div>
            <div class="work-content">
                <div class="work-meta">
                    <span class="work-category ${work.category}" style="color: ${
                        work.category === 'video' ? '#818cf8' : 
                        work.category === 'photo' ? '#22c55e' : 
                        '#f59e0b'
                    }">
                        ${categoryIcons[work.category] || '✦'} ${categoryLabels[work.category] || '作品'}
                    </span>
                    <span class="work-year">${work.year || work.created_at?.substring(0, 4) || '2024'}</span>
                </div>
                <h3 class="work-title">${work.title}</h3>
                <p class="work-desc">${work.description || ''}</p>
                <div class="work-stats">
                    <span class="work-views">👁 ${dataService.formatNumber(work.views || 0)}</span>
                    <span class="work-likes">❤️ ${dataService.formatNumber(work.likes || 0)}</span>
                </div>
                <button class="work-btn view-work-details" data-id="${work.id}">
                    <span>查看详情</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return article;
}

// 初始化过滤和排序
function initFilterAndSort(allWorks, container, dataService) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    // 更新过滤按钮计数
    updateFilterCounts(allWorks);
    
    // 过滤功能
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // 更新激活状态
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 过滤作品
            const filteredWorks = filter === 'all' 
                ? allWorks 
                : allWorks.filter(work => work.category === filter);
            
            // 清空并重新渲染
            container.innerHTML = '';
            renderPortfolioGrid(filteredWorks, container, dataService);
            
            // 添加查看详情事件
            addWorkDetailListeners(dataService);
        });
    });
    
    // 排序功能
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            
            // 获取当前显示的作品（基于过滤）
            let worksToSort = currentFilter === 'all' 
                ? [...allWorks] 
                : allWorks.filter(work => work.category === currentFilter);
            
            // 应用排序
            worksToSort.sort((a, b) => {
                switch(sortValue) {
                    case 'latest':
                        return new Date(b.created_at || b.year) - new Date(a.created_at || a.year);
                    case 'oldest':
                        return new Date(a.created_at || a.year) - new Date(b.created_at || b.year);
                    case 'popular':
                        return (b.views || 0) - (a.views || 0);
                    default:
                        return 0;
                }
            });
            
            // 清空并重新渲染
            container.innerHTML = '';
            renderPortfolioGrid(worksToSort, container, dataService);
            
            // 添加查看详情事件
            addWorkDetailListeners(dataService);
        });
    }
}

// 更新过滤按钮计数
function updateFilterCounts(allWorks) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        let count;
        
        if (filter === 'all') {
            count = allWorks.length;
        } else {
            count = allWorks.filter(work => work.category === filter).length;
        }
        
        // 更新计数显示
        const countSpan = btn.querySelector('.filter-count');
        if (countSpan) {
            countSpan.textContent = count;
        }
    });
}

// 更新作品集统计数据
async function updatePortfolioStats(dataService) {
    try {
        const allWorks = await dataService.getPortfolio('all', null, 100);
        
        // 按类别统计
        const videoCount = allWorks.filter(w => w.category === 'video').length;
        const photoCount = allWorks.filter(w => w.category === 'photo').length;
        const brandCount = allWorks.filter(w => w.category === 'brand').length;
        
        // 更新计数显示（如果有动画）
        updateAnimatedCounts(videoCount, photoCount, brandCount);
        
        // 更新成就部分
        updateAchievementStats(allWorks);
        
    } catch (error) {
        console.error('更新统计数据失败:', error);
    }
}

// 更新动画计数
function updateAnimatedCounts(videoCount, photoCount, brandCount) {
    const countElements = document.querySelectorAll('.count-num');
    
    if (countElements.length >= 3) {
        animateCount(countElements[0], videoCount || 18);
        animateCount(countElements[1], photoCount || 20);
        animateCount(countElements[2], brandCount || 10);
    }
}

// 动画计数效果
function animateCount(element, target) {
    const currentTarget = parseInt(element.dataset.target) || 0;
    // 如果目标值已经设置且与当前相同，不重新动画
    if (currentTarget === target) return;
    
    element.dataset.target = target;
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 40);
}

// 更新成就统计
function updateAchievementStats(allWorks) {
    // 这里可以添加更多统计逻辑
    // 例如：总浏览量、总点赞数、合作客户数等
    const totalViews = allWorks.reduce((sum, work) => sum + (work.views || 0), 0);
    const totalLikes = allWorks.reduce((sum, work) => sum + (work.likes || 0), 0);
    
    console.log(`总浏览量: ${totalViews}, 总点赞数: ${totalLikes}`);
}

// 添加作品详情事件监听
function addWorkDetailListeners(dataService) {
    document.querySelectorAll('.view-work-details').forEach(button => {
        button.addEventListener('click', async function() {
            const workId = this.getAttribute('data-id');
            if (!workId) return;
            
            // 增加浏览量
            await dataService.incrementViews(workId);
            
            // 获取作品详情
            const work = await dataService.getPortfolioItem(workId);
            if (work) {
                showWorkModal(work, dataService);
            } else {
                alert('无法加载作品详情，请稍后重试');
            }
        });
    });
}

// 显示作品模态框
function showWorkModal(work, dataService) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    
    if (!modalOverlay || !modalContent) {
        // 如果模态框元素不存在，使用index.js中的方法
        const event = new CustomEvent('showWorkModal', { detail: { work, dataService } });
        document.dispatchEvent(event);
        return;
    }
    
    const categoryLabels = {
        video: '视频创作',
        photo: '摄影作品',
        brand: '品牌案例'
    };
    
    modalContent.innerHTML = `
        <div class="modal-work">
            <div class="modal-work-image">
                <img src="${work.cover_url}" alt="${work.title}">
            </div>
            <div class="modal-work-content">
                <div class="modal-work-header">
                    <span class="modal-work-category ${work.category}">${categoryLabels[work.category] || '作品'}</span>
                    <h2 class="modal-work-title">${work.title}</h2>
                    <p class="modal-work-desc">${work.description}</p>
                </div>
                <div class="modal-work-info">
                    <div class="info-item">
                        <div class="info-label">客户</div>
                        <div class="info-value">${work.client || '个人项目'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">年份</div>
                        <div class="info-value">${work.year || '2024'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">浏览量</div>
                        <div class="info-value">${dataService.formatNumber(work.views || 0)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">点赞数</div>
                        <div class="info-value">${dataService.formatNumber(work.likes || 0)}</div>
                    </div>
                </div>
                ${work.details ? `
                <div class="modal-work-details">
                    <h3>作品详情</h3>
                    <p>${work.details}</p>
                </div>
                ` : ''}
                <div class="modal-work-actions">
                    <button class="btn btn-like" data-id="${work.id}">
                        <span>点赞 (${dataService.formatNumber(work.likes || 0)})</span>
                    </button>
                    <button class="btn btn-close-modal">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 显示模态框
    modalOverlay.classList.add('active');
    
    // 添加事件监听
    const likeBtn = modalContent.querySelector('.btn-like');
    const closeBtn = modalContent.querySelector('.btn-close-modal');
    const modalClose = document.getElementById('modalClose');
    
    // 点赞功能
    likeBtn.addEventListener('click', async () => {
        const result = await dataService.incrementLikes(work.id);
        if (result.success) {
            likeBtn.innerHTML = `<span>点赞 (${dataService.formatNumber(result.likes)})</span>`;
            likeBtn.classList.add('liked');
            
            // 更新页面上的点赞数
            const workCard = document.querySelector(`.masonry-item[data-id="${work.id}"] .work-likes`);
            if (workCard) {
                workCard.textContent = `❤️ ${dataService.formatNumber(result.likes)}`;
            }
        }
    });
    
    // 关闭模态框
    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };
    
    closeBtn.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 显示/隐藏加载指示器
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.style.display = show ? 'none' : 'flex';
    }
}

// 设置其他事件监听器
function setupPortfolioEventListeners(dataService) {
    // 加载更多按钮
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            // 这里可以实现分页加载更多作品
            // 目前一次性加载所有作品，所以此按钮暂时禁用
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<span>已加载全部作品</span>';
        });
    }
    
    console.log('作品集页面事件监听器已设置');
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .loading {
        color: #94a3b8;
        font-size: 1rem;
        text-align: center;
    }
    
    .error {
        color: #ef4444;
        font-size: 1rem;
        text-align: center;
        background: rgba(239, 68, 68, 0.1);
        padding: 20px;
        border-radius: 12px;
    }
    
    .empty-state {
        color: #94a3b8;
        font-size: 1.1rem;
        text-align: center;
    }
    
    .hidden {
        display: none;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .masonry-item {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
    }
`;
document.head.appendChild(style);