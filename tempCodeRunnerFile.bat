@echo off
echo Starting debug compilation...
pdflatex -interaction=nonstopmode -file-line-error presentation_type.tex > compile_log.txt
echo Compilation complete. Checking for errors...
findstr "error" compile_log.txt
echo Done. See compile_log.txt for full details.
pause
