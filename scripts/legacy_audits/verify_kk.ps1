$koPath = "src/lib/translations/ko.ts"
$kkPath = "src/lib/translations/kk.ts"

# Use UTF8 explicitly for both reading
$koContent = Get-Content $koPath -Raw -Encoding UTF8
$kkContent = Get-Content $kkPath -Raw -Encoding UTF8

# Extract keys using regex
$keyRegex = '["''](.+?)["'']\s*:'
$koKeys = [regex]::Matches($koContent, $keyRegex) | ForEach-Object { $_.Groups[1].Value }
$kkKeys = [regex]::Matches($kkContent, $keyRegex) | ForEach-Object { $_.Groups[1].Value }

# Filter out common names if they were captured by accident (unlikely but good to check)
$koKeys = $koKeys | Where-Object { $_ -notmatch '^\d+$' }
$kkKeys = $kkKeys | Where-Object { $_ -notmatch '^\d+$' }

Write-Host "Korean keys found: $($koKeys.Count)"
Write-Host "Kazakh keys found: $($kkKeys.Count)"

$missingInKk = $koKeys | Where-Object { $kkKeys -notcontains $_ }
$extraInKk = $kkKeys | Where-Object { $koKeys -notcontains $_ }

if ($missingInKk.Count -gt 0) {
    Write-Host "--- Missing in Kazakh ($($missingInKk.Count)) ---" -ForegroundColor Red
    $missingInKk | ForEach-Object { Write-Host $_ }
}

if ($extraInKk.Count -gt 0) {
    Write-Host "--- Extra in Kazakh ($($extraInKk.Count)) ---" -ForegroundColor Yellow
    $extraInKk | ForEach-Object { Write-Host $_ }
}

if ($missingInKk.Count -eq 0 -and $extraInKk.Count -eq 0) {
    Write-Host "SUCCESS: Keys match perfectly!" -ForegroundColor Green
} else {
    Write-Host "FAILED: $($missingInKk.Count) missing, $($extraInKk.Count) extra." -ForegroundColor Red
}

# Check for Korean characters in values in kk.ts
$koreanRegex = '[\uac00-\ud7af]'
$lines = $kkContent -split "`n"
$koreanFound = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match ':\s*["'']') {
        # Split by the first colon that is followed by the value
        $valueStart = $line.IndexOf(':') + 1
        if ($valueStart -gt 0) {
            $value = $line.Substring($valueStart)
            if ($value -match $koreanRegex) {
                # Ignore if the "Korean" character is just after the key definition but part of the key itself 
                # (handled by regex)
                Write-Host "Line $($i + 1): Found Korean in value -> $($line.Trim())" -ForegroundColor Red
                $koreanFound = $true
            }
        }
    }
}

if (-not $koreanFound) {
    Write-Host "SUCCESS: No Korean characters found in values!" -ForegroundColor Green
}
