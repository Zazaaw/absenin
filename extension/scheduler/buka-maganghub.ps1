# Dijalankan Task Scheduler pada jam pengingat.
# Membuka Chrome ke halaman Riwayat MagangHub dan membawa jendela Chrome ke depan.
# Setelah Chrome terbuka, ekstensi Sawit Diary yang melanjutkan pengingat.

$url = "https://monev.maganghub.kemnaker.go.id/dashboard/riwayat#sawit"

function Find-Chrome {
    $candidates = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"
    )
    foreach ($k in $candidates) {
        try { $p = (Get-ItemProperty -Path $k -ErrorAction Stop).'(default)'; if ($p -and (Test-Path $p)) { return $p } } catch {}
    }
    foreach ($p in @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
                     "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
                     "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")) {
        if (Test-Path $p) { return $p }
    }
    return "chrome.exe"
}

$chrome = Find-Chrome
Start-Process -FilePath $chrome -ArgumentList $url

Start-Sleep -Seconds 3

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class SawitWin32 {
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
}
"@

$win = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($win) {
    $h = $win.MainWindowHandle
    if ([SawitWin32]::IsIconic($h)) { [void][SawitWin32]::ShowWindow($h, 9) }   # 9 = SW_RESTORE
    [void][SawitWin32]::SetForegroundWindow($h)
}
