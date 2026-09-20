Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "INNOVEXA - AI-Powered Mobile Urban Intelligence Platform" -ForegroundColor White
Write-Host "Problem Statement 26124 (BEL / Smart Automation / SIH 2025)" -ForegroundColor Cyan
Write-Host "========================================================================="
Write-Host ""

$BackendJob = Start-Process python -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000" -PassThru
Write-Host "Started FastAPI Backend on http://127.0.0.1:8000 (PID: $($BackendJob.Id))" -ForegroundColor Green

Set-Location frontend
$FrontendJob = Start-Process python -ArgumentList "-m", "http.server", "8080" -PassThru
Write-Host "Started Frontend Web Server on http://127.0.0.1:8080 (PID: $($FrontendJob.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:8080"

Write-Host ""
Write-Host "INNOVEXA Urban Intelligence Platform is live!" -ForegroundColor Cyan
Write-Host "  - Command Center UI:  http://127.0.0.1:8080" -ForegroundColor White
Write-Host "  - OpenAPI / Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press enter to terminate servers..."
Read-Host
Stop-Process -Id $BackendJob.Id -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendJob.Id -ErrorAction SilentlyContinue
