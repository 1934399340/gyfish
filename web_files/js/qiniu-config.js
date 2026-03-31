// 七牛云存储配置
const QINIU_CONFIG = {
    bucket: 'gyfish',
    // CDN域名（如果没有配置CDN，使用默认的七牛云域名）
    cdnDomain: 'gyfish.clouddn.com',
    // 上传服务器地址
    uploadUrl: 'https://upload.qiniup.com',
    // API基础地址（使用相对路径）
    apiBase: ''
};

// 生成上传凭证（调用Worker API）
async function getUploadToken(fileName) {
    try {
        const response = await fetch(`${QINIU_CONFIG.apiBase}/api/qiniu-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName })
        });

        const result = await response.json();

        if (result.success) {
            return {
                token: result.token,
                uploadUrl: result.uploadUrl,
                cdnDomain: result.cdnDomain
            };
        } else {
            throw new Error(result.error || '获取上传凭证失败');
        }
    } catch (error) {
        console.error('获取七牛云上传凭证失败:', error);
        throw error;
    }
}

// 获取资源URL
function getResourceUrl(key) {
    if (!key) return '';
    return `https://${QINIU_CONFIG.cdnDomain}/${key}`;
}

// 生成文件名
function generateFileName(originalName, prefix = '') {
    const ext = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
    return prefix + cleanName + '_' + timestamp + '_' + random + '.' + ext;
}

// 验证文件类型
function validateFile(file, allowedTypes) {
    const ext = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(ext);
}

// 图片文件类型
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

// 视频文件类型
const VIDEO_TYPES = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv'];

// 文档文件类型
const DOCUMENT_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

// 上传到七牛云
async function uploadToQiniu(file) {
    const fileName = generateFileName(file.name);
    const { token, uploadUrl, cdnDomain } = await getUploadToken(fileName);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('key', `uploads/${fileName}`);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.key) {
        return {
            success: true,
            key: result.key,
            url: `https://${cdnDomain}/${result.key}`
        };
    } else {
        throw new Error(result.error || '上传失败');
    }
}

export {
    QINIU_CONFIG,
    getUploadToken,
    getResourceUrl,
    generateFileName,
    validateFile,
    uploadToQiniu,
    IMAGE_TYPES,
    VIDEO_TYPES,
    DOCUMENT_TYPES
};
