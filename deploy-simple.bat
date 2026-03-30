@echo off
cls
echo ========================================
echo CloudBase一键部署脚本
echo 环境ID: gyfish-4gbxsy3dc619f1e8
echo ========================================
echo.

echo 正在检查配置文件...
if not exist "cloudbaserc.json" (
    echo 错误: 找不到配置文件
    pause
    exit /b 1
)

echo 配置文件检查通过 ✓
echo.

echo 正在部署网站到CloudBase...
echo 请稍候，这可能需要1-2分钟...
echo.

cloudbase framework deploy

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 🎉 部署成功！
    echo ========================================
    echo.
    echo 请在CloudBase控制台查看分配的访问域名
    echo 然后访问该域名测试网站是否正常运行
    echo.
    echo 控制台地址: https://console.cloud.tencent.com/tcb/env/overview?envId=gyfish-4gbxsy3dc619f1e8
) else (
    echo.
    echo ❌ 部署失败
    echo 请检查:
    echo 1. 是否已完成微信扫码登录
    echo 2. 网络连接是否正常
    echo 3. 环境ID是否正确
)

echo.
pause