Add-Type -AssemblyName System.Drawing

function Create-AppIcon {
    param (
        [int]$size,
        [string]$outputPath
    )
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Dark Indigo Background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(79, 70, 229),
        [System.Drawing.Color]::FromArgb(15, 23, 42),
        45.0
    )
    $g.FillRectangle($brush, $rect)

    # Glowing ring
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(129, 140, 248), ($size * 0.04))
    $pad = [int]($size * 0.12)
    $g.DrawEllipse($ringPen, $pad, $pad, ($size - 2 * $pad), ($size - 2 * $pad))

    # Bold White Checkmark
    $checkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, ($size * 0.08))
    $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $p1 = New-Object System.Drawing.PointF(($size * 0.28), ($size * 0.52))
    $p2 = New-Object System.Drawing.PointF(($size * 0.44), ($size * 0.68))
    $p3 = New-Object System.Drawing.PointF(($size * 0.72), ($size * 0.36))

    $points = [System.Drawing.PointF[]]@($p1, $p2, $p3)
    $g.DrawLines($checkPen, $points)

    # Emerald indicator
    $emeraldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 211, 153))
    $g.FillEllipse($emeraldBrush, [int]($size * 0.68), [int]($size * 0.20), [int]($size * 0.12), [int]($size * 0.12))

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$iconDir = "C:\Users\HP\Downloads\TO-DO\public\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

Create-AppIcon 192 "$iconDir\icon-192.png"
Create-AppIcon 512 "$iconDir\icon-512.png"
Copy-Item "$iconDir\icon-192.png" "C:\Users\HP\Downloads\TO-DO\public\favicon.ico" -Force
Write-Host "Icons generated successfully!"
