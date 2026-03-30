# Supabase 邮箱确认脚本
# 使用 Service Role 密钥确认用户邮箱，无需邮件验证
# 运行方法: 在 PowerShell 中执行: .\confirm-email.ps1

# 读取配置文件
$configPath = ".\config.json"
if (-not (Test-Path $configPath)) {
    Write-Host "错误: 找不到 config.json 文件" -ForegroundColor Red
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json

# 验证必要的配置
if (-not $config.supabaseUrl) {
    Write-Host "错误: config.json 中缺少 supabaseUrl 配置" -ForegroundColor Red
    exit 1
}

if (-not $config.supabaseServiceKey) {
    Write-Host "错误: config.json 中缺少 supabaseServiceKey 配置" -ForegroundColor Red
    exit 1
    Write-Host "提示: 请在 Supabase 控制台 Settings -> API 中获取 service_role 密钥" -ForegroundColor Yellow
}

# Supabase API 配置
$supabaseUrl = $config.supabaseUrl
$serviceKey = $config.supabaseServiceKey

# 设置请求头
$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
}

# 函数：获取所有用户
function Get-AllUsers {
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/admin/users" -Method Get -Headers $headers
        return $response.users
    }
    catch {
        Write-Host "获取用户列表失败: $_" -ForegroundColor Red
        return @()
    }
}

# 函数：确认用户邮箱
function Confirm-UserEmail {
    param(
        [Parameter(Mandatory=$true)]
        [string]$userId,
        
        [Parameter(Mandatory=$true)]
        [string]$userEmail
    )
    
    try {
        # 设置 email_confirmed_at 为当前时间
        $body = @{
            email_confirmed_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.ffffffZ")
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/admin/users/$userId" -Method Put -Headers $headers -Body $body
        
        Write-Host "✓ 邮箱已确认: $userEmail" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ 确认邮箱失败 ($userEmail): $_" -ForegroundColor Red
        return $false
    }
}

# 主程序
Write-Host "======= Supabase 邮箱确认工具 =======" -ForegroundColor Cyan
Write-Host "Supabase URL: $supabaseUrl" -ForegroundColor Gray
Write-Host "当前时间: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# 获取所有用户
Write-Host "正在获取用户列表..." -ForegroundColor Yellow
$users = Get-AllUsers

if ($users.Count -eq 0) {
    Write-Host "未找到任何用户" -ForegroundColor Yellow
    exit 0
}

Write-Host "找到 $($users.Count) 个用户" -ForegroundColor Green
Write-Host ""

# 查找需要确认邮箱的用户
$unconfirmedUsers = @()
$confirmedUsers = @()

foreach ($user in $users) {
    if (-not $user.email_confirmed_at -or $user.email_confirmed_at -eq "") {
        $unconfirmedUsers += $user
    } else {
        $confirmedUsers += $user
    }
}

# 显示统计信息
Write-Host "统计信息:" -ForegroundColor Cyan
Write-Host "  已确认邮箱: $($confirmedUsers.Count) 个用户" -ForegroundColor Green
Write-Host "  未确认邮箱: $($unconfirmedUsers.Count) 个用户" -ForegroundColor Yellow
Write-Host ""

if ($unconfirmedUsers.Count -eq 0) {
    Write-Host "所有用户的邮箱都已确认，无需操作。" -ForegroundColor Green
    exit 0
}

# 显示未确认的用户列表
Write-Host "未确认邮箱的用户列表:" -ForegroundColor Yellow
$index = 0
foreach ($user in $unconfirmedUsers) {
    $index++
    Write-Host "  $index. $($user.email) (ID: $($user.id))" -ForegroundColor Gray
}
Write-Host ""

# 询问用户要确认哪些邮箱
Write-Host "请选择操作:" -ForegroundColor Cyan
Write-Host "  1. 确认所有未确认的邮箱" -ForegroundColor White
Write-Host "  2. 只确认特定的邮箱 (例如: admin@creatorhub.com)" -ForegroundColor White
Write-Host "  3. 退出" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请输入选项 (1-3)"

switch ($choice) {
    "1" {
        # 确认所有未确认的邮箱
        Write-Host "正在确认所有未确认的邮箱..." -ForegroundColor Yellow
        $successCount = 0
        $failCount = 0
        
        foreach ($user in $unconfirmedUsers) {
            if (Confirm-UserEmail -userId $user.id -userEmail $user.email) {
                $successCount++
            } else {
                $failCount++
            }
            
            # 短暂暂停，避免请求过快
            Start-Sleep -Milliseconds 200
        }
        
        Write-Host ""
        Write-Host "操作完成:" -ForegroundColor Cyan
        Write-Host "  成功确认: $successCount 个邮箱" -ForegroundColor Green
        Write-Host "  失败: $failCount 个邮箱" -ForegroundColor Red
    }
    
    "2" {
        # 确认特定邮箱
        $targetEmail = Read-Host "请输入要确认的邮箱地址 (例如: admin@creatorhub.com)"
        
        $targetUser = $unconfirmedUsers | Where-Object { $_.email -eq $targetEmail }
        
        if ($targetUser) {
            Write-Host "正在确认邮箱: $targetEmail" -ForegroundColor Yellow
            if (Confirm-UserEmail -userId $targetUser.id -userEmail $targetUser.email) {
                Write-Host "✓ 邮箱确认成功!" -ForegroundColor Green
            } else {
                Write-Host "✗ 邮箱确认失败" -ForegroundColor Red
            }
        } else {
            Write-Host "未找到邮箱为 '$targetEmail' 的未确认用户" -ForegroundColor Yellow
            Write-Host "当前未确认用户列表:" -ForegroundColor Gray
            foreach ($user in $unconfirmedUsers) {
                Write-Host "  - $($user.email)" -ForegroundColor Gray
            }
        }
    }
    
    "3" {
        Write-Host "已退出" -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host "无效选项，已退出" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "======= 操作完成 =======" -ForegroundColor Cyan
Write-Host "现在可以使用邮箱和密码登录后台管理系统。" -ForegroundColor Green
Write-Host "测试账户: admin@creatorhub.com / TempPassword123!" -ForegroundColor Green