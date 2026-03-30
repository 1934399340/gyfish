class SupabaseService {
    constructor() {
        this.supabase = null;
        this.config = {
            supabaseUrl: window.APP_CONFIG?.supabaseUrl || 'YOUR_SUPABASE_URL',
            supabaseAnonKey: window.APP_CONFIG?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY'
        };
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    async init(supabaseUrl, supabaseAnonKey) {
        if (supabaseUrl && supabaseAnonKey) {
            this.config.supabaseUrl = supabaseUrl;
            this.config.supabaseAnonKey = supabaseAnonKey;
        }

        for (let i = 0; i < this.maxRetries; i++) {
            try {
                if (typeof window.supabase === 'undefined') {
                    throw new Error('Supabase SDK 未加载');
                }

                if (typeof window.supabase.createClient === 'undefined') {
                    throw new Error('Supabase createClient 未定义');
                }

                this.supabase = window.supabase.createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
                const { data, error } = await this.supabase.auth.getSession();

                if (error) {
                    throw new Error(`认证会话获取失败: ${error.message}`);
                }

                console.log('Supabase 服务初始化成功');
                return true;
            } catch (error) {
                console.warn(`Supabase 初始化尝试 ${i + 1}/${this.maxRetries} 失败:`, error.message);
                
                if (i < this.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
                } else {
                    console.error('Supabase 初始化失败，所有重试均已尝试');
                    return false;
                }
            }
        }
        return false;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            const initialized = await this.init();
            if (!initialized) {
                throw new Error('Supabase 服务未初始化，请检查网络连接和配置');
            }
        }
        return true;
    }

    async signIn(email, password) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signUp(email, password, metadata) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        await this.ensureInitialized();
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async getSession() {
        await this.ensureInitialized();
        const { data: { session } } = await this.supabase.auth.getSession();
        return session;
    }

    async getCurrentUser() {
        await this.ensureInitialized();
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }

    onAuthStateChange(callback) {
        if (!this.supabase) {
            this.init().catch(err => console.error('初始化失败:', err));
        }
        return this.supabase?.auth?.onAuthStateChange?.(callback) || (() => {});
    }
}

class MediaService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = null;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            await this.supabaseService.ensureInitialized();
            this.supabase = this.supabaseService.supabase;
            if (!this.supabase) {
                throw new Error('Supabase 客户端未初始化，无法访问媒体服务');
            }
        }
        return true;
    }

    async getAll(type = null, limit = 50) {
        await this.ensureInitialized();
        let query = this.supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getById(id) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('media')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async upload(file, folder = 'general') {
        await this.ensureInitialized();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await this.supabase.storage
            .from('media')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = this.supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        const type = file.type.startsWith('image/') ? 'image' :
                     file.type.startsWith('video/') ? 'video' : 'document';

        const { data: media, error: dbError } = await this.supabase
            .from('media')
            .insert({
                name: file.name,
                url: publicUrl,
                type,
                size: file.size,
                folder,
                metadata: {
                    original_name: file.name,
                    mime_type: file.type
                }
            })
            .select()
            .single();

        if (dbError) throw dbError;
        return media;
    }

    async delete(id) {
        await this.ensureInitialized();
        const { error } = await this.supabase
            .from('media')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
}

class PortfolioService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = null;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            await this.supabaseService.ensureInitialized();
            this.supabase = this.supabaseService.supabase;
            if (!this.supabase) {
                throw new Error('Supabase 客户端未初始化，无法访问作品集服务');
            }
        }
        return true;
    }

    async getAll(category = null, featured = null) {
        await this.ensureInitialized();
        let query = this.supabase
            .from('portfolio')
            .select('*')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (featured !== null) {
            query = query.eq('featured', featured);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getById(id) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('portfolio')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async create(item) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('portfolio')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id, item) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('portfolio')
            .update(item)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id) {
        await this.ensureInitialized();
        const { error } = await this.supabase
            .from('portfolio')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    async incrementViews(id) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase.rpc('increment_portfolio_views', { row_id: id });
        if (error) {
            const { data: item } = await this.supabase
                .from('portfolio')
                .select('views')
                .eq('id', id)
                .single();

            if (item) {
                await this.update(id, { views: (item.views || 0) + 1 });
            }
        }
        return data;
    }

    async incrementLikes(id) {
        await this.ensureInitialized();
        const { data: item } = await this.supabase
            .from('portfolio')
            .select('likes')
            .eq('id', id)
            .single();

        if (item) {
            await this.update(id, { likes: (item.likes || 0) + 1 });
        }
        return item;
    }
}

class PostsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = null;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            await this.supabaseService.ensureInitialized();
            this.supabase = this.supabaseService.supabase;
            if (!this.supabase) {
                throw new Error('Supabase 客户端未初始化，无法访问文章服务');
            }
        }
        return true;
    }

    async getAll(category = null, published = null) {
        await this.ensureInitialized();
        let query = this.supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (published !== null) {
            query = query.eq('published', published);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async getById(id) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async create(item) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('posts')
            .insert(item)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id, item) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('posts')
            .update(item)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id) {
        await this.ensureInitialized();
        const { error } = await this.supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    async publish(id) {
        await this.ensureInitialized();
        return this.update(id, {
            published: true,
            published_at: new Date().toISOString()
        });
    }

    async unpublish(id) {
        await this.ensureInitialized();
        return this.update(id, {
            published: false,
            published_at: null
        });
    }
}

class SettingsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = null;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            await this.supabaseService.ensureInitialized();
            this.supabase = this.supabaseService.supabase;
            if (!this.supabase) {
                throw new Error('Supabase 客户端未初始化，无法访问设置服务');
            }
        }
        return true;
    }

    async get(key = 'general') {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('settings')
            .select('*')
            .eq('id', key)
            .single();

        if (error) throw error;
        return data;
    }

    async update(key, settings) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('settings')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', key)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

class AnalyticsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = null;
    }

    async ensureInitialized() {
        if (!this.supabase) {
            await this.supabaseService.ensureInitialized();
            this.supabase = this.supabaseService.supabase;
            if (!this.supabase) {
                throw new Error('Supabase 客户端未初始化，无法访问分析服务');
            }
        }
        return true;
    }

    async track(eventType, eventData = {}) {
        try {
            await this.ensureInitialized();
            const { error } = await this.supabase
                .from('analytics')
                .insert({
                    event_type: eventType,
                    event_data: eventData,
                    user_agent: navigator.userAgent
                });

            if (error) console.error('Analytics track error:', error);
        } catch (error) {
            console.warn('Analytics track 失败:', error.message);
        }
    }

    async getRecent(limit = 100) {
        await this.ensureInitialized();
        const { data, error } = await this.supabase
            .from('analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    async getStats(days = 7) {
        await this.ensureInitialized();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await this.supabase
            .from('analytics')
            .select('event_type, created_at')
            .gte('created_at', startDate.toISOString());

        if (error) throw error;

        const stats = {};
        data.forEach(item => {
            if (!stats[item.event_type]) {
                stats[item.event_type] = 0;
            }
            stats[item.event_type]++;
        });

        return stats;
    }
}

window.SupabaseService = SupabaseService;
window.MediaService = MediaService;
window.PortfolioService = PortfolioService;
window.PostsService = PostsService;
window.SettingsService = SettingsService;
window.AnalyticsService = AnalyticsService;