-- 用户账户表
CREATE TABLE IF NOT EXISTS admin_account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化管理员账户
INSERT INTO admin_account (username, password) VALUES ('admin', 'admin');

-- 联系消息表
CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 内容管理表
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    heading TEXT,
    subheading TEXT,
    content TEXT,
    excerpt TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    video_url TEXT,
    tools TEXT,
    duration TEXT,
    client TEXT,
    featured INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    author TEXT DEFAULT '李桂宇',
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初始化首页内容
INSERT OR REPLACE INTO content (page, title, description, heading, subheading, content, excerpt) VALUES
('home-hero', '首页英雄区域', '首页主标题区域内容', '你好，我是李桂宇', '全栈视频创作者 · 专注于内容创作与视觉表达', '', ''),
('home-stats', '首页统计数据', '作品数、粉丝数、经验等', '150+', '作品产出·50W+·粉丝关注·3年·创作经验', '', ''),
('about-bio', '个人简介', '关于页面个人简介', '林小北', '全栈视频创作者 · 内容创作者', '', '');
