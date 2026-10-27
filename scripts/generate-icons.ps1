Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '..\apps\web\public\icons'
New-Item -ItemType Directory -Force -Path $iconDirectory | Out-Null
foreach ($size in @(192, 512)) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#3659db'))
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#6684ff'), ($size / 26))
  $graphics.DrawEllipse($pen, [single]($size * .09), [single]($size * .50), [single]($size * .30), [single]($size * .30))
  $graphics.DrawEllipse($pen, [single]($size * .62), [single]($size * .50), [single]($size * .30), [single]($size * .30))
  $points = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new($size * .24, $size * .65), [System.Drawing.PointF]::new($size * .43, $size * .30), [System.Drawing.PointF]::new($size * .58, $size * .65), [System.Drawing.PointF]::new($size * .24, $size * .65), [System.Drawing.PointF]::new($size * .68, $size * .30), [System.Drawing.PointF]::new($size * .77, $size * .65))
  $graphics.DrawLines($pen, $points)
  $bitmap.Save((Join-Path $iconDirectory "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
