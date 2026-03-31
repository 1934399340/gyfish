@echo off
echo ========================================
echo CloudBase部署脚本
echo ========================================

echo 步骤1: 检查环境配置
if not exist "cloudbaserc.json" (
    echo 错误: 找不到cloudbaserc.json配置文件
    echo 请先配置环境ID
    pause
    exit /b 1
)

echo 步骤2: 检查登录状态
cloudbase login --check

if %errorlevel% neq 0 (
    echo 步骤3: 执行登录
    echo 请用微信扫描弹出的二维码完成登录
    cloudbase login
    if %errorlevel% neq 0 (
        echo 登录失败，请重试
        pause
        exit /b 1
    )
)

echo 步骤4: 开始部署
echo 正在部署网站文件到CloudBase...
cloudbase framework deploy

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 🎉 部署成功！
    echo ========================================
    echo 请在CloudBase控制台查看分配的访问域名
    echo 然后访问该域名测试网站是否正常运行
) else (
    echo.
    echo ❌ 部署失败，请检查错误信息
)

pause