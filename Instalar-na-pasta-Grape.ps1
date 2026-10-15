# Instala o projeto no caminho solicitado, sem sobrescrever uma pasta existente.
[CmdletBinding()]
param([string]$Destino = 'C:\Users\Perinha\Desktop\Grape\Tecnologia\grape-site-oficial')
$ErrorActionPreference = 'Stop'
$Origem = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\')
$DestinoCompleto = [System.IO.Path]::GetFullPath($Destino).TrimEnd('\')
if ($Origem -eq $DestinoCompleto) {
    Write-Host 'O projeto ja esta na pasta desejada. Abra index.html para visualizar.'
    exit 0
}
if (Test-Path -LiteralPath $DestinoCompleto) {
    if (-not (Test-Path -LiteralPath $DestinoCompleto -PathType Container)) {
        throw 'O destino existe, mas nao e uma pasta. Nada foi alterado.'
    }
    if (@(Get-ChildItem -LiteralPath $DestinoCompleto -Force).Count -gt 0) {
        throw 'A pasta de destino ja possui arquivos. Nada foi sobrescrito. Compare os projetos antes de copiar.'
    }
}
$Itens = @('index.html', 'assets', 'scripts', 'docs', 'package.json', '.gitignore', 'README.md', 'Instalar-na-pasta-Grape.ps1')
foreach ($Item in $Itens) {
    if (-not (Test-Path -LiteralPath (Join-Path $Origem $Item))) {
        throw "Arquivo ausente no pacote: $Item. Extraia o ZIP inteiro antes de instalar."
    }
}
New-Item -ItemType Directory -Path $DestinoCompleto -Force | Out-Null
foreach ($Item in $Itens) {
    Copy-Item -LiteralPath (Join-Path $Origem $Item) -Destination $DestinoCompleto -Recurse
}
Write-Host "Projeto copiado para: $DestinoCompleto"
Write-Host 'Abra index.html no navegador ou abra esta pasta no VS Code.'
