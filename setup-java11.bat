@echo off
setlocal enabledelayedexpansion

:: Sprawdź czy skrypt jest uruchomiony jako administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Ten skrypt wymaga uprawnień administratora.
    echo Uruchom ponownie jako administrator.
    pause
    exit /b 1
)

:: Sprawdź czy Java 11 jest zainstalowana w typowych lokalizacjach
set "POSSIBLE_PATHS=C:\Program Files\Eclipse Adoptium\jdk-11 C:\Program Files\Java\jdk-11 C:\Program Files\AdoptOpenJDK\jdk-11"

for %%p in (%POSSIBLE_PATHS%) do (
    if exist "%%p\bin\java.exe" (
        set "JAVA_PATH=%%p"
        goto :found
    )
)

echo Nie znaleziono Java 11 w typowych lokalizacjach.
echo Podaj pełną ścieżkę do folderu Java 11 (np. C:\Program Files\Eclipse Adoptium\jdk-11):
set /p JAVA_PATH=

:found
:: Ustaw JAVA_HOME
setx JAVA_HOME "%JAVA_PATH%" /M
echo Ustawiono JAVA_HOME na: %JAVA_PATH%

:: Dodaj do PATH
set "PATH_TO_ADD=%JAVA_PATH%\bin"
set "CURRENT_PATH=!PATH!"

:: Sprawdź czy ścieżka już jest w PATH
echo !CURRENT_PATH! | find /i "%PATH_TO_ADD%" > nul
if errorlevel 1 (
    setx PATH "%PATH_TO_ADD%;%PATH%" /M
    echo Dodano %PATH_TO_ADD% do PATH
) else (
    echo Ścieżka już jest w PATH
)

echo.
echo Konfiguracja zakończona. Zmiany będą aktywne po ponownym uruchomieniu konsoli.
echo Aby sprawdzić konfigurację, uruchom check-java.bat
pause