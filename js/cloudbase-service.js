/**
 * CloudBase 服务层
 * 提供认证、数据库和存储功能
 */

class CloudBaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.config = {
            envId: 'gyfish-4gbxsy3dc619f1e8',
            appAccessToken: '' // 将在初始化时获取
        };
        this.currentUser = null;
        this.authStateChangedCallbacks = [];
    }

    /**
     * 初始化 CloudBase
     */
    async init() {
        if (this.app) {
            return;
        }

        try {
            // 动态加载 CloudBase SDK
            if (!window.cloudbase) {
                await this.loadSDK();
            }

            this.app = cloudbase.init({
                env: this.config.envId,
                region: 'ap-guangzhou'
            });

            this.auth = this.app.auth();
            this.db = this.app.database();

            console.log('CloudBase 初始化成功');
            console.log('环境ID:', this.config.envId);

            // 监听登录状态
            this.setupAuthStateListener();

        } catch (error) {
            console.error('CloudBase 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 加载 CloudBase SDK
     */
    async loadSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://img.jsdelivr.net/npm/@cloudbase/js-sdk@2.4.1/dist/cloudbase.full.js';
            script.onload = () => {
                console.log('CloudBase SDK 加载成功');
                resolve();
            };
            script.onerror = (error) => {
                console.error('CloudBase SDK 加载失败:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 设置登录状态监听器
     */
    setupAuthStateListener() {
        // CloudBase 没有内置的 authStateChange，我们需要手动实现
        // 可以通过定期检查登录状态来实现
        setInterval(async () => {
            try {
                const beforeUser = this.currentUser;
                const authState = await this.getAuthState();
                const afterUser = authState ? authState.user : null;

                if (beforeUser !== afterUser) {
                    this.currentUser = afterUser;
                    this.authStateChangedCallbacks.forEach(callback => {
                        callback(afterUser);
                    });
                }
            } catch (error) {
                // 忽略错误，避免频繁的错误日志
            }
        }, 1000);
    }

    /**
     * 注册状态变化监听器
     */
    onAuthStateChanged(callback) {
        this.authStateChangedCallbacks.push(callback);
    }

    /**
     * 获取登录状态
     */
    async getAuthState() {
        try {
            const authState = await this.auth.getAuthState();
            return authState;
        } catch (error) {
            console.error('获取登录状态失败:', error);
            return null;
        }
    }

    /**
     * 检查是否已登录
     */
    async isLoggedIn() {
        const authState = await this.getAuthState();
        return !!authState;
    }

    /**
     * 获取当前用户
     */
    async getCurrentUser() {
        const authState = await this.getAuthState();
        if (authState && authState.user) {
            this.currentUser = authState.user;
            return authState.user;
        }
        return null;
    }

    /**
     * 邮箱登录
     */
    async signInWithEmail(email, password) {
        try {
            const result = await this.auth.signInByEmail(email, password);
            if (result.code) {
                throw new Error(result.message || '登录失败');
            }
            const user = await this.getCurrentUser();
            console.log('邮箱登录成功:', user);
            return { success: true, user };
        } catch (error) {
            console.error('邮箱登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 匿名登录
     */
    async signInAnonymously() {
        try {
            const result = await this.auth.anonymousAuth().signIn();
            if (result.code) {
                throw new Error(result.message || '匿名登录失败');
            }
            const user = await this.getCurrentUser();
            console.log('匿名登录成功:', user);
            return { success: true, user };
        } catch (error) {
            console.error('匿名登录失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 登出
     */
    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            console.log('登出成功');
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 发送密码重置邮件
     */
    async sendPasswordResetEmail(email) {
        try {
            const result = await this.auth.sendPasswordResetEmail(email);
            if (result.code) {
                throw new Error(result.message || '发送失败');
            }
            console.log('密码重置邮件已发送');
            return { success: true };
        } catch (error) {
            console.error('发送密码重置邮件失败:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== 数据库操作 ====================

    /**
     * 获取集合引用
     */
    collection(name) {
        if (!this.db) {
            throw new Error('CloudBase 未初始化');
        }
        return this.db.collection(name);
    }

    /**
     * 查询单个文档
     */
    async getDoc(collectionName, docId) {
        try {
            const res = await this.collection(collectionName).doc(docId).get();
            return { success: true, data: res.data };
        } catch (error) {
            console.error('获取文档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 查询集合中的多个文档
     */
    async query(collectionName, where = {}, orderBy = null, limit = 100) {
        try {
            let query = this.collection(collectionName).where(where);

            if (orderBy) {
                query = query.orderBy(orderBy.field, orderBy.order);
            }

            query = query.limit(limit);

            const res = await query.get();
            return { success: true, data: res.data };
        } catch (error) {
            console.error('查询失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 添加文档
     */
    async addDoc(collectionName, data) {
        try {
            const res = await this.collection(collectionName).add({
                data: {
                    ...data,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            return { success: true, id: res.id };
        } catch (error) {
            console.error('添加文档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 更新文档
     */
    async updateDoc(collectionName, docId, data) {
        try {
            const res = await this.collection(collectionName).doc(docId).update({
                data: {
                    ...data,
                    updated_at: new Date()
                }
            });
            return { success: true, updated: res.updated };
        } catch (error) {
            console.error('更新文档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 删除文档
     */
    async deleteDoc(collectionName, docId) {
        try {
            const res = await this.collection(collectionName).doc(docId).remove();
            return { success: true, deleted: res.deleted };
        } catch (error) {
            console.error('删除文档失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 统计文档数量
     */
    async count(collectionName, where = {}) {
        try {
            const res = await this.collection(collectionName).where(where).count();
            return { success: true, total: res.total };
        } catch (error) {
            console.error('统计失败:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== 文件存储操作 ====================

    /**
     * 上传文件
     */
    async uploadFile(cloudPath, filePath) {
        try {
            const uploadTask = this.app.uploadFile({
                cloudPath,
                filePath
            });

            return new Promise((resolve, reject) => {
                uploadTask.on('progress', (snapshot) => {
                    console.log('上传进度:', snapshot.loaded / snapshot.total);
                });

                uploadTask.then(result => {
                    console.log('上传成功:', result);
                    resolve({ success: true, fileID: result.fileID });
                }).catch(error => {
                    console.error('上传失败:', error);
                    reject({ success: false, error: error.message });
                });
            });
        } catch (error) {
            console.error('上传文件失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取文件下载链接
     */
    async getDownloadUrl(filePath) {
        try {
            const res = await this.app.getTempFileURL({
                fileList: [filePath]
            });

            if (res.fileList && res.fileList[0]) {
                return { success: true, url: res.fileList[0].tempFileURL };
            }

            throw new Error('获取下载链接失败');
        } catch (error) {
            console.error('获取下载链接失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 删除文件
     */
    async deleteFile(filePath) {
        try {
            await this.app.deleteFile({
                fileList: [filePath]
            });
            return { success: true };
        } catch (error) {
            console.error('删除文件失败:', error);
            return { success: false, error: error.message };
        }
    }

    // ==================== 管理员相关 ====================

    /**
     * 检查是否为管理员
     */
    async isAdmin() {
        const user = await this.getCurrentUser();
        if (!user) return false;

        // 查询用户角色
        const result = await this.query('users', { 
            openid: user.openid || user.uid,
            role: 'admin'
        });

        return result.success && result.data && result.data.length > 0;
    }

    /**
     * 获取管理员列表
     */
    async getAdmins() {
        return await this.query('users', { role: 'admin' });
    }

    /**
     * 添加管理员
     */
    async addAdmin(openid, email) {
        return await this.addDoc('users', {
            openid,
            email,
            role: 'admin',
            created_at: new Date()
        });
    }
}

// 创建全局实例
window.CloudBaseService = CloudBaseService;
window.cloudbaseService = new CloudBaseService();