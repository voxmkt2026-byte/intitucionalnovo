[CmdletBinding()]
param(
    [ValidateSet('Workspace', 'Global', 'Both')]
    [string]$Scope = 'Workspace',

    [string]$RepositoryRoot = '',

    [string]$SourceRoot = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
}

if ([string]::IsNullOrWhiteSpace($SourceRoot)) {
    $SourceRoot = Join-Path $env:USERPROFILE '.codex\skills'
}

$skillNames = @(
    'frontend-design',
    'ui-ux-pro-max',
    'gsap-core',
    'gsap-timeline',
    'gsap-scrolltrigger',
    'threejs-webgl',
    'scroll-experience',
    'web3d-integration-patterns'
)

$targets = @()

if ($Scope -in @('Workspace', 'Both')) {
    $targets += [PSCustomObject]@{
        Label = 'Codex + Antigravity (workspace)'
        Path = Join-Path $RepositoryRoot '.agents\skills'
    }
    $targets += [PSCustomObject]@{
        Label = 'Claude Code (workspace)'
        Path = Join-Path $RepositoryRoot '.claude\skills'
    }
}

if ($Scope -in @('Global', 'Both')) {
    $targets += [PSCustomObject]@{
        Label = 'Codex (global)'
        Path = Join-Path $env:USERPROFILE '.agents\skills'
    }
    $targets += [PSCustomObject]@{
        Label = 'Claude Code (global)'
        Path = Join-Path $env:USERPROFILE '.claude\skills'
    }
    $targets += [PSCustomObject]@{
        Label = 'Antigravity IDE (global)'
        Path = Join-Path $env:USERPROFILE '.gemini\config\skills'
    }
    $targets += [PSCustomObject]@{
        Label = 'Antigravity CLI (global)'
        Path = Join-Path $env:USERPROFILE '.gemini\antigravity-cli\skills'
    }
}

foreach ($skillName in $skillNames) {
    $sourcePath = Join-Path $SourceRoot $skillName
    $manifestPath = Join-Path $sourcePath 'SKILL.md'

    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
        throw "Skill '$skillName' não encontrada em '$sourcePath' ou sem SKILL.md."
    }
}

foreach ($target in $targets) {
    New-Item -ItemType Directory -Path $target.Path -Force | Out-Null

    foreach ($skillName in $skillNames) {
        $sourcePath = Join-Path $SourceRoot $skillName
        $destinationPath = Join-Path $target.Path $skillName

        New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null
        Get-ChildItem -LiteralPath $sourcePath -Force |
            Copy-Item -Destination $destinationPath -Recurse -Force

        $installedManifest = Join-Path $destinationPath 'SKILL.md'
        if (-not (Test-Path -LiteralPath $installedManifest -PathType Leaf)) {
            throw "Falha ao validar '$skillName' em '$destinationPath'."
        }
    }

    Write-Host "OK  $($target.Label): $($target.Path)" -ForegroundColor Green
}

Write-Host "`n$($skillNames.Count) skills instaladas e validadas em $($targets.Count) destino(s)." -ForegroundColor Cyan
Write-Host 'Reabra a sessão da IA ou use /skills para atualizar a descoberta, quando disponível.'
