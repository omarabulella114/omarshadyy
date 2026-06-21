Add-Type -AssemblyName System.Drawing

$sourceFile = "d:\omar\omarshady\public\hero.jpeg"
$ogFile = "d:\omar\omarshady\src\app\opengraph-image.jpg"
$iconFile = "d:\omar\omarshady\src\app\icon.png"
$faviconFile = "d:\omar\omarshady\src\app\favicon.ico"

# Delete default Vercel favicon
if (Test-Path $faviconFile) {
    Remove-Item $faviconFile -Force
}

$image = [System.Drawing.Image]::FromFile($sourceFile)

# Create 1200x630 OpenGraph Image (Standard WhatsApp/Twitter size)
$bmpOg = New-Object System.Drawing.Bitmap 1200, 630
$gOg = [System.Drawing.Graphics]::FromImage($bmpOg)
$gOg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
# Calculate crop to avoid stretching
$ratioX = 1200 / $image.Width
$ratioY = 630 / $image.Height
$ratio = [math]::Max($ratioX, $ratioY)
$newWidth = [int]($image.Width * $ratio)
$newHeight = [int]($image.Height * $ratio)
$posX = [int]((1200 - $newWidth) / 2)
$posY = [int]((630 - $newHeight) / 2)

$gOg.DrawImage($image, $posX, $posY, $newWidth, $newHeight)
$bmpOg.Save($ogFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Create 64x64 Icon
$bmpIcon = New-Object System.Drawing.Bitmap 64, 64
$gIcon = [System.Drawing.Graphics]::FromImage($bmpIcon)
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$ratioIcon = [math]::Max(64 / $image.Width, 64 / $image.Height)
$wIcon = [int]($image.Width * $ratioIcon)
$hIcon = [int]($image.Height * $ratioIcon)
$xIcon = [int]((64 - $wIcon) / 2)
$yIcon = [int]((64 - $hIcon) / 2)

$gIcon.DrawImage($image, $xIcon, $yIcon, $wIcon, $hIcon)
$bmpIcon.Save($iconFile, [System.Drawing.Imaging.ImageFormat]::Png)

$gOg.Dispose()
$bmpOg.Dispose()
$gIcon.Dispose()
$bmpIcon.Dispose()
$image.Dispose()

Write-Host "Images successfully generated!"
