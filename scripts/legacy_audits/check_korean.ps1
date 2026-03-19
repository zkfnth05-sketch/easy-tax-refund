$kkPath = "src/lib/translations/kk.ts"
$kkContent = Get-Content $kkPath -Encoding UTF8

$koreanRegex = '[\uac00-\ud7af]'
$issueFound = $false

for ($i = 0; $i -lt $kkContent.Length; $i++) {
    $line = $kkContent[$i]
    # Match the pattern: "key": "value",
    if ($line -match ':\s*["''](.*)["''],?\s*$') {
        $value = $matches[1]
        if ($value -match $koreanRegex) {
            $lineNumber = $i + 1
            Write-Host "ISSUE at Line $lineNumber : $line" -ForegroundColor Red
            $issueFound = $true
        }
    }
}

if (-not $issueFound) {
    Write-Host "SUCCESS: No Korean characters found in translation values!" -ForegroundColor Green
}
