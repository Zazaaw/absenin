# Melepas Task Scheduler "SawitDiary-MagangHub".
$taskName = "SawitDiary-MagangHub"
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
    Write-Host "Task '$taskName' dihapus."
} catch {
    Write-Host "Task '$taskName' tidak ditemukan. Tidak ada yang dihapus."
}
if ($Host.Name -eq "ConsoleHost") { Read-Host "Tekan Enter untuk menutup" | Out-Null }
