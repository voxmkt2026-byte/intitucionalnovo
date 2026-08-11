$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvDir = Join-Path $ProjectDir ".venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$ReadyFile = Join-Path $VenvDir ".wpp-enricher-ready"

Set-Location -LiteralPath $ProjectDir

try {
    if (-not (Test-Path -LiteralPath $PythonExe)) {
        Write-Host "Preparando o programa pela primeira vez..." -ForegroundColor Cyan

        $PythonCommand = Get-Command py -ErrorAction SilentlyContinue
        if ($null -ne $PythonCommand) {
            & py -3 -m venv $VenvDir
        }
        else {
            $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
            if ($null -eq $PythonCommand) {
                throw "Python 3 nao foi encontrado. Instale em https://www.python.org/downloads/ e marque 'Add Python to PATH'."
            }
            & python -m venv $VenvDir
        }

        if ($LASTEXITCODE -ne 0) {
            throw "Nao foi possivel criar o ambiente Python."
        }
    }

    if (-not (Test-Path -LiteralPath $ReadyFile)) {
        Write-Host "Instalando dependencias (isso ocorre somente na primeira vez)..." -ForegroundColor Cyan
        & $PythonExe -m pip install --disable-pip-version-check --upgrade pip
        if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar o pip." }

        & $PythonExe -m pip install --disable-pip-version-check -r (Join-Path $ProjectDir "requirements.txt")
        if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependencias." }

        New-Item -ItemType File -Path $ReadyFile -Force | Out-Null
    }

    & $PythonExe (Join-Path $ProjectDir "main.py")
    exit $LASTEXITCODE
}
catch {
    Write-Host "" 
    Write-Host ("ERRO: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
