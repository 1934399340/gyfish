document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const RATE_LIMIT_KEY = 'contact_form_last_submit';
    const RATE_LIMIT_SECONDS = 60;
    const API_BASE = '';

    function getLastSubmitTime() {
        const lastTime = localStorage.getItem(RATE_LIMIT_KEY);
        return lastTime ? parseInt(lastTime) : 0;
    }

    function setLastSubmitTime(time) {
        localStorage.setItem(RATE_LIMIT_KEY, time.toString());
    }

    function getRemainingSeconds() {
        const lastTime = getLastSubmitTime();
        if (!lastTime) return 0;
        const elapsed = Math.floor(Date.now() / 1000) - lastTime;
        return Math.max(0, RATE_LIMIT_SECONDS - elapsed);
    }

    function updateButtonState(button, remainingSeconds) {
        if (remainingSeconds > 0) {
            button.disabled = true;
            button.classList.add('btn-disabled');
            button.textContent = `${remainingSeconds}秒后可再次发送`;
        } else {
            button.disabled = false;
            button.classList.remove('btn-disabled');
            button.textContent = '发送消息';
        }
    }

    function initRateLimit() {
        if (!contactForm) return;
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const remainingSeconds = getRemainingSeconds();
        updateButtonState(submitBtn, remainingSeconds);

        if (remainingSeconds > 0) {
            const interval = setInterval(() => {
                const secs = getRemainingSeconds();
                updateButtonState(submitBtn, secs);
                if (secs <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }
    }

    if (contactForm) {
        initRateLimit();

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const remainingSeconds = getRemainingSeconds();

            if (remainingSeconds > 0) {
                alert(`发送太频繁了，请在 ${remainingSeconds} 秒后重试！`);
                return;
            }

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                alert('请填写完整信息！');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('请输入有效的邮箱地址！');
                return;
            }

            if (message.length < 10) {
                alert('留言内容至少需要10个字符！');
                return;
            }

            const originalText = submitBtn.textContent;
            submitBtn.textContent = '发送中...';
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-disabled');

            try {
                // 1. 保存消息到数据库
                const response = await fetch(`${API_BASE}/api/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        subject: subject,
                        message: message
                    })
                });

                const result = await response.json();

                if (result.success) {
                    setLastSubmitTime(Math.floor(Date.now() / 1000));

                    // 2. 打开邮件客户端发送邮件（确保邮件能收到）
                    const subjectMap = {
                        'video': '视频创作合作',
                        'photo': '摄影服务',
                        'copy': '文案策划',
                        'other': '其他咨询'
                    };
                    const subjectText = subjectMap[subject] || subject;

                    const mailtoLink = `mailto:1934399340@qq.com?subject=${encodeURIComponent('[' + subjectText + ' - CreatorHub] 来自 ' + name)}&body=${encodeURIComponent('姓名: ' + name + '\n邮箱: ' + email + '\n主题: ' + subjectText + '\n\n' + message)}`;

                    // 打开邮件客户端
                    window.location.href = mailtoLink;

                    alert('✅ 消息已保存！如果邮件客户端没有打开，请手动发送邮件到 1934399340@qq.com');
                    contactForm.reset();
                } else {
                    throw new Error(result.error || '发送失败');
                }

            } catch (error) {
                console.error('发送失败:', error);

                // 如果API失败，使用邮件作为备用
                const subjectMap = {
                    'video': '视频创作合作',
                    'photo': '摄影服务',
                    'copy': '文案策划',
                    'other': '其他咨询'
                };
                const subjectText = subjectMap[subject] || subject;

                const mailtoLink = `mailto:1934399340@qq.com?subject=${encodeURIComponent('[' + subjectText + ' - CreatorHub] 来自 ' + name)}&body=${encodeURIComponent('姓名: ' + name + '\n邮箱: ' + email + '\n主题: ' + subjectText + '\n\n' + message)}`;
                window.location.href = mailtoLink;

                alert('⚠️ 正在打开邮件客户端，请完成发送邮件到 1934399340@qq.com');
            } finally {
                submitBtn.textContent = originalText;
                updateButtonState(submitBtn, RATE_LIMIT_SECONDS);

                const interval = setInterval(() => {
                    const secs = getRemainingSeconds();
                    updateButtonState(submitBtn, secs);
                    if (secs <= 0) {
                        clearInterval(interval);
                    }
                }, 1000);
            }
        });
    }

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});
