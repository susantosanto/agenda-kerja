$ErrorActionPreference = 'Continue'
Write-Host "Starting prisma generate..."
Set-Location 'D:\project\todolist'
node_modules\.bin\prisma.cmd generate
Write-Host "Done. Exit code: $LASTEXITCODE"