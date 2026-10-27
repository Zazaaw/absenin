# Pasang Task Scheduler "SawitDiary-MagangHub".
# Jalan Senin sampai Jumat pada jam yang ditentukan, membuka Chrome ke MagangHub.
# Cara pakai: klik kanan file ini > Run with PowerShell. Atau dari PowerShell:
#   .\pasang-task.ps1 -Jam "16:00"

param(
    [string]$Jam = "16:00"
)

$taskName = "SawitDiary-MagangHub"
$script = Join-Path $PSScriptRoot "buka-maganghub.ps1"
if (-not (Test-Path $script)) { Write-Host "buka-maganghub.ps1 tidak ditemukan di $PSScriptRoot"; exit 1 }

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At $Jam
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 2)

try { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop } catch {}
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
    -Description "Sawit Diary: buka Chrome ke MagangHub pada jam pengingat (Senin-Jumat)." | Out-Null

Write-Host ""
Write-Host "Task '$taskName' terpasang. Jalan Senin-Jumat jam $Jam."
Write-Host "Kalau jam pengingat di ekstensi diubah, jalankan lagi: .\pasang-task.ps1 -Jam ""HH:mm"""
Write-Host "Untuk melepas: .\hapus-task.ps1"
Write-Host ""
if ($Host.Name -eq "ConsoleHost") { Read-Host "Tekan Enter untuk menutup" | Out-Null }
