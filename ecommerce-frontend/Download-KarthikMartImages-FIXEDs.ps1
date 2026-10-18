# Karthik Mart bulk product image helper
# Run from: E:\Intellij\ecommerce-frontend
# Downloads candidate images from Wikimedia Commons into public\images.
# Writes image-attribution.csv and product-images.sql for review.
# It does NOT change your database automatically.

$ErrorActionPreference = "Stop"
$apiBase = "http://localhost:5454/api/products"
$commonsApi = "https://commons.wikimedia.org/w/api.php"
$imageDir = Join-Path (Get-Location) "public\images"
$manifestPath = Join-Path (Get-Location) "image-attribution.csv"
$sqlPath = Join-Path (Get-Location) "product-images.sql"

if (-not (Test-Path (Join-Path (Get-Location) "package.json"))) {
    throw "Open PowerShell in your ecommerce-frontend folder first."
}
if (-not (Test-Path $imageDir)) {
    New-Item -ItemType Directory -Path $imageDir -Force | Out-Null
}

Write-Host "Reading products from $apiBase ..."
$products = Invoke-RestMethod -Uri $apiBase -Method Get
if (-not $products -or @($products).Count -eq 0) {
    throw "No products returned. Check that Spring Boot is running on port 5454."
}

$manifest = [System.Collections.Generic.List[object]]::new()
$sqlRows = [System.Collections.Generic.List[string]]::new()
$sqlRows.Add("-- Review this file before running it in MySQL.")
$sqlRows.Add("-- It replaces image rows only for products listed below.")
$sqlRows.Add("USE Ecommercevendor;")
$sqlRows.Add("")

foreach ($p in @($products)) {
    $id = [int]$p.id
    $title = [string]$p.title
    if ([string]::IsNullOrWhiteSpace($title)) { continue }

    $terms = @($title -split '\s+' | Where-Object { $_.Length -gt 2 })
    $query = (($terms | Select-Object -First 5) -join ' ')
    $params = @{
        action = "query"
        generator = "search"
        gsrsearch = "filetype:bitmap $query"
        gsrnamespace = 6
        gsrlimit = 8
        prop = "imageinfo"
        iiprop = "url|extmetadata"
        iiurlwidth = 800
        format = "json"
        origin = "*"
    }
    $queryString = ($params.GetEnumerator() | ForEach-Object {
        [uri]::EscapeDataString([string]$_.Key) + "=" +
        [uri]::EscapeDataString([string]$_.Value)
    }) -join "&"

    $found = $null
    try {
        $response = Invoke-RestMethod -Uri "$commonsApi`?$queryString" -Method Get -Headers @{
            "User-Agent" = "KarthikMartLocalImageHelper/1.0 (local development)"
        }
        $pages = @()
        if ($response.query -and $response.query.pages) {
            $pages = @($response.query.pages.PSObject.Properties | ForEach-Object { $_.Value })
        }

        $meaningful = @($terms | Where-Object { $_.Length -ge 4 } | ForEach-Object { $_.ToLowerInvariant() })
        foreach ($candidate in $pages) {
            $fileTitle = ([string]$candidate.title).ToLowerInvariant()
            $matched = $false
            foreach ($term in $meaningful) {
                if ($fileTitle.Contains($term)) { $matched = $true; break }
            }
            if ($matched -and $candidate.imageinfo -and $candidate.imageinfo[0].thumburl) {
                $found = $candidate
                break
            }
        }
    } catch {
        Write-Warning "Commons search failed for product ${id} (${title}): $($_.Exception.Message)"
    }

    if (-not $found) {
        Write-Warning "No filename-matching candidate found for product ${id}: ${title}. Skipped."
        continue
    }

    $info = $found.imageinfo[0]
    $ext = [IO.Path]::GetExtension(([uri]$info.thumburl).AbsolutePath).ToLowerInvariant()
    if ($ext -notin @(".jpg", ".jpeg", ".png", ".webp")) { $ext = ".jpg" }
    $safe = ($title -replace '[^A-Za-z0-9]+', '-').Trim('-').ToLowerInvariant()
    $fileName = "$id-$safe$ext"
    $destination = Join-Path $imageDir $fileName

    try {
        Invoke-WebRequest -Uri $info.thumburl -OutFile $destination -Headers @{
            "User-Agent" = "KarthikMartLocalImageHelper/1.0 (local development)"
        }
        if ((Get-Item $destination).Length -lt 1000) {
            Remove-Item $destination -Force
            Write-Warning "Downloaded file too small; skipped product ${id}."
            continue
        }
    } catch {
        Write-Warning "Download failed for product ${id} (${title}): $($_.Exception.Message)"
        if (Test-Path $destination) { Remove-Item $destination -Force }
        continue
    }

    $localPath = "/images/$fileName"
    $license = ""
    $artist = ""
    $credit = ""
    $licenseUrl = ""
    $descriptionUrl = [string]$info.descriptionurl
    if ($info.extmetadata) {
        if ($info.extmetadata.LicenseShortName) { $license = [string]$info.extmetadata.LicenseShortName.value }
        if ($info.extmetadata.Artist) { $artist = ([string]$info.extmetadata.Artist.value -replace '<[^>]+>', '') }
        if ($info.extmetadata.Credit) { $credit = ([string]$info.extmetadata.Credit.value -replace '<[^>]+>', '') }
        if ($info.extmetadata.LicenseUrl) { $licenseUrl = [string]$info.extmetadata.LicenseUrl.value }
    }

    $manifest.Add([pscustomobject]@{
        ProductId = $id
        ProductTitle = $title
        LocalPath = $localPath
        CommonsFile = [string]$found.title
        License = $license
        Artist = $artist
        Credit = $credit
        LicenseUrl = $licenseUrl
        SourcePage = $descriptionUrl
        ReviewBeforeUse = "YES - confirm image is the correct product and follow license terms"
    })

    $escapedPath = $localPath.Replace("'", "''")
    $sqlRows.Add("DELETE FROM product_images WHERE product_id = $id;")
    $sqlRows.Add("INSERT INTO product_images (product_id, image_url) VALUES ($id, '$escapedPath');")
    $sqlRows.Add("")
    Write-Host "Downloaded candidate: $title -> $localPath"
    Start-Sleep -Milliseconds 250
}

$manifest | Export-Csv -Path $manifestPath -NoTypeInformation -Encoding UTF8
$sqlRows | Set-Content -Path $sqlPath -Encoding UTF8
Write-Host ""
Write-Host "Finished. Candidate images downloaded: $($manifest.Count)"
Write-Host "Images folder: $imageDir"
Write-Host "Review list: $manifestPath"
Write-Host "SQL file (NOT executed): $sqlPath"
Write-Host "IMPORTANT: Verify each image before using it. The script does not update MySQL."
