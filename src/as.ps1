# Skrypt kopiuje wszystkie pliki z folderu 'src' i jego podfolderów
# do folderu 'purefiles' (bez zachowania struktury folderów).

# Ustaw ścieżki do folderów
$SourceFolder = "D:\jacolos-repos\beerspots-frontend\src\app"  # Zmień na odpowiednią ścieżkę
$DestinationFolder = "D:\jacolos-repos\beerspots-frontend\src\purefiles"  # Zmień na odpowiednią ścieżkę

# Utwórz folder docelowy, jeśli nie istnieje
if (-not (Test-Path -Path $DestinationFolder)) {
    New-Item -ItemType Directory -Path $DestinationFolder
}

# Pobierz wszystkie pliki z folderu źródłowego i jego podfolderów
$Files = Get-ChildItem -Path $SourceFolder -Recurse -File

# Kopiuj pliki do folderu docelowego
foreach ($File in $Files) {
    $DestinationPath = Join-Path -Path $DestinationFolder -ChildPath $File.Name
    Copy-Item -Path $File.FullName -Destination $DestinationPath -Force
}

Write-Host "Wszystkie pliki zostały skopiowane do folderu 'purefiles'."