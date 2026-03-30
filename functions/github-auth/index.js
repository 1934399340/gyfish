const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// GitHub OAuth配置
const GITHUB_CONFIG = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: 'https://gyfish-4gbxsy3dc619f1e8-1416769265.tcloudbaseapp.com/admin/secure-login.html'
};

exports.main = async (event, context) => {
  const { action, code } = event;
  
  try {
    switch (action) {
      case 'getAuthorizationUrl':
        // 生成GitHub授权URL
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CONFIG.clientId}&redirect_uri=${encodeURIComponent(GITHUB_CONFIG.redirectUri)}&scope=user:email`;
        return {
          success: true,
          authorizationUrl: authUrl
        };
        
      case 'handleCallback':
        // 处理GitHub回调
        if (!code) {
          return {
            success: false,
            error: '缺少授权码'
          };
        }
        
        // 用授权码换取access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
          client_id: GITHUB_CONFIG.clientId,
          client_secret: GITHUB_CONFIG.clientSecret,
          code: code,
          redirect_uri: GITHUB_CONFIG.redirectUri
        }, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
          return {
            success: false,
            error: '获取访问令牌失败'
          };
        }
        
        // 使用access token获取用户信息
        const userResponse = await axios.get('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        const userInfo = {
          id: userResponse.data.id,
          username: userResponse.data.login,
          email: userResponse.data.email,
          avatar: userResponse.data.avatar_url,
          name: userResponse.data.name || userResponse.data.login
        };
        
        // 验证是否为授权用户（这里可以根据需要添加白名单验证）
        const authorizedUsers = ['your-github-username']; // 替换为您的GitHub用户名
        if (!authorizedUsers.includes(userInfo.username)) {
          return {
            success: false,
            error: '未授权的用户'
          };
        }
        
        return {
          success: true,
          userInfo: userInfo,
          accessToken: accessToken
        };
        
      default:
        return {
          success: false,
          error: '未知的操作类型'
        };
    }
  } catch (error) {
    console.error('GitHub OAuth错误:', error);
    return {
      success: false,
      error: error.message || '认证过程出错'
    };
  }
};