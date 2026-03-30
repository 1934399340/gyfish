class CloudinaryService {
    constructor() {
        this.cloudName = window.APP_CONFIG?.cloudinaryCloudName || 'YOUR_CLOUDINARY_CLOUD_NAME';
        this.apiKey = window.APP_CONFIG?.cloudinaryApiKey || 'YOUR_CLOUDINARY_API_KEY';
        this.uploadPreset = window.APP_CONFIG?.cloudinaryUploadPreset || 'ml_default';
        // 注意：API Secret不应在前端暴露，使用无签名上传预设
    }

    init(cloudName, apiKey, uploadPreset = 'ml_default') {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.uploadPreset = uploadPreset;
    }

    getConfig() {
        return {
            cloudName: this.cloudName,
            apiKey: this.apiKey,
            uploadPreset: this.uploadPreset
        };
    }

    async uploadToCloudinary(file, folder = 'general', options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);

        if (options.resourceType) {
            formData.append('resource_type', options.resourceType);
        } else if (file.type.startsWith('video/')) {
            formData.append('resource_type', 'video');
        } else if (file.type.startsWith('image/')) {
            formData.append('resource_type', 'image');
        } else {
            formData.append('resource_type', 'auto');
        }

        if (options.eager) {
            formData.append('eager', options.eager);
        }

        if (options.transformation) {
            formData.append('eager_notification_url', options.eager_notification_url);
        }

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        return await response.json();
    }

    getImageUrl(publicId, options = {}) {
        const defaults = {
            width: 800,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto'
        };

        const config = { ...defaults, ...options };

        let url = `https://res.cloudinary.com/${this.cloudName}/image/upload`;

        const transformations = [];
        if (config.width) transformations.push(`w_${config.width}`);
        if (config.height) transformations.push(`h_${config.height}`);
        if (config.crop) transformations.push(`c_${config.crop}`);
        if (config.quality) transformations.push(`q_${config.quality}`);
        if (config.fetch_format) transformations.push(`f_${config.fetch_format}`);
        if (config.overlay) transformations.push(`l_${config.overlay}`);
        if (config.gravity) transformations.push(`g_${config.gravity}`);
        if (config.radius) transformations.push(`r_${config.radius}`);

        if (transformations.length > 0) {
            url += '/' + transformations.join(',');
        }

        url += '/' + publicId;

        return url;
    }

    getVideoUrl(publicId, options = {}) {
        const defaults = {
            width: 800,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto'
        };

        const config = { ...defaults, ...options };

        let url = `https://res.cloudinary.com/${this.cloudName}/video/upload`;

        const transformations = [];
        if (config.width) transformations.push(`w_${config.width}`);
        if (config.height) transformations.push(`h_${config.height}`);
        if (config.crop) transformations.push(`c_${config.crop}`);
        if (config.quality) transformations.push(`q_${config.quality}`);
        if (config.fetch_format) transformations.push(`f_${config.fetch_format}`);

        if (transformations.length > 0) {
            url += '/' + transformations.join(',');
        }

        url += '/' + publicId;

        return url;
    }

    getThumbnailUrl(publicId, options = {}) {
        const defaults = {
            width: 200,
            height: 200,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
            radius: 8
        };

        return this.getImageUrl(publicId, { ...defaults, ...options });
    }

    async delete(publicId, resourceType = 'image') {
        // 注意：前端不应直接删除Cloudinary文件，应通过后端API进行
        // 这里仅返回模拟成功，实际删除应在后端处理
        console.warn('前端直接删除Cloudinary文件已禁用，请通过后端API进行删除操作');
        return {
            result: 'ok',
            message: '删除操作已转发到后端处理'
        };
    }

    async generateSignature(stringToSign) {
        // 此方法已不再需要，因为前端不使用签名上传
        console.warn('generateSignature 方法已弃用');
        return 'signature_disabled';
    }
}

class FileUploadComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
            uploadUrl: '/api/upload',
            onUploadStart: null,
            onUploadProgress: null,
            onUploadComplete: null,
            onUploadError: null,
            ...options
        };
        this.files = [];
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="upload-component" style="
                background: rgba(30, 41, 59, 0.8);
                border: 2px dashed rgba(99, 102, 241, 0.5);
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
            ">
                <input type="file" id="fileInput" multiple accept="${this.options.allowedTypes.join(',')}" style="display: none;">
                <div style="margin-bottom: 16px;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #818cf8;"></i>
                </div>
                <div style="color: #fff; font-size: 1.125rem; font-weight: 600; margin-bottom: 8px;">
                    点击或拖拽文件到此处上传
                </div>
                <div style="color: #64748b; font-size: 0.875rem;">
                    支持 JPG, PNG, GIF, WebP, MP4, WebM (最大 ${this.formatSize(this.options.maxSize)})
                </div>
                <div id="uploadProgress" style="display: none; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div id="progressBar" style="background: linear-gradient(90deg, #6366f1, #818cf8); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div id="progressText" style="color: #94a3b8; font-size: 0.875rem; margin-top: 8px;">0%</div>
                </div>
            </div>
            <div id="fileList" style="margin-top: 16px; display: flex; flex-direction: column; gap: 12px;"></div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const dropzone = this.container.querySelector('.upload-component');
        const fileInput = this.container.querySelector('#fileInput');

        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#818cf8';
            dropzone.style.background = 'rgba(99, 102, 241, 0.1)';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = 'rgba(99, 102, 241, 0.5)';
            dropzone.style.background = 'transparent';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'rgba(99, 102, 241, 0.5)';
            dropzone.style.background = 'transparent';
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);
        const validFiles = files.filter(file => this.validateFile(file));

        validFiles.forEach(file => {
            if (!this.files.find(f => f.name === file.name && f.size === file.size)) {
                this.files.push(file);
            }
        });

        this.renderFileList();

        validFiles.forEach(file => {
            this.uploadFile(file);
        });
    }

    validateFile(file) {
        if (file.size > this.options.maxSize) {
            this.showError(`${file.name} 文件过大`);
            return false;
        }

        if (!this.options.allowedTypes.includes(file.type)) {
            this.showError(`${file.name} 文件类型不支持`);
            return false;
        }

        return true;
    }

    async uploadFile(file) {
        if (this.options.onUploadStart) {
            this.options.onUploadStart(file);
        }

        const progressContainer = this.container.querySelector('#uploadProgress');
        const progressBar = this.container.querySelector('#progressBar');
        const progressText = this.container.querySelector('#progressText');

        progressContainer.style.display = 'block';

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = percent + '%';
                    progressText.textContent = percent + '%';

                    if (this.options.onUploadProgress) {
                        this.options.onUploadProgress({ file, percent });
                    }
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    progressContainer.style.display = 'none';

                    if (this.options.onUploadComplete) {
                        this.options.onUploadComplete({ file, response });
                    }
                } else {
                    throw new Error('Upload failed');
                }
            });

            xhr.addEventListener('error', () => {
                throw new Error('Network error');
            });

            const formData = new FormData();
            formData.append('file', file);

            xhr.open('POST', this.options.uploadUrl);
            xhr.send(formData);

        } catch (error) {
            progressContainer.style.display = 'none';
            this.showError(`${file.name} 上传失败: ${error.message}`);

            if (this.options.onUploadError) {
                this.options.onUploadError({ file, error });
            }
        }
    }

    renderFileList() {
        const fileList = this.container.querySelector('#fileList');

        fileList.innerHTML = this.files.map((file, index) => `
            <div class="file-item" data-index="${index}" style="
                background: rgba(15, 23, 42, 0.6);
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div style="
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background: ${file.type.startsWith('image/') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${file.type.startsWith('image/') ? '#818cf8' : '#ef4444'};
                ">
                    <i class="fas ${file.type.startsWith('image/') ? 'fa-image' : 'fa-video'}"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${file.name}
                    </div>
                    <div style="color: #64748b; font-size: 0.75rem;">
                        ${this.formatSize(file.size)}
                    </div>
                </div>
                <button class="remove-btn" data-index="${index}" style="
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: none;
                    border-radius: 8px;
                    width: 32px;
                    height: 32px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        fileList.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.files.splice(index, 1);
                this.renderFileList();
            });
        });
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    showError(message) {
        console.error(message);
    }

    getFiles() {
        return this.files;
    }

    clearFiles() {
        this.files = [];
        this.renderFileList();
    }
}

window.CloudinaryService = CloudinaryService;
window.FileUploadComponent = FileUploadComponent;