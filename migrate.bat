@echo off
REM 从 basebiance.com 搬家到 bitaigen Sanity
REM 用法：
REM   migrate.bat          → 试迁 10 篇（默认）
REM   migrate.bat all      → 全量迁移
REM   migrate.bat dry      → 只解析不写入（调试）
REM   migrate.bat slug xxx → 单篇调试
REM   migrate.bat translate → 把已搬家 zh-CN 翻译成 4 种语言

chcp 65001 > nul
cd /d "%~dp0"

if "%1"=="all" (
    python -X utf8 -m pipeline.migrate_biyijia.migrate --all
) else if "%1"=="dry" (
    python -X utf8 -m pipeline.migrate_biyijia.migrate --limit 3 --dry-run
) else if "%1"=="slug" (
    python -X utf8 -m pipeline.migrate_biyijia.migrate --slug %2
) else if "%1"=="translate" (
    python -X utf8 -m pipeline.migrate_biyijia.translate --langs zh-TW,en,es,pt
) else if "%1"=="translate-slug" (
    python -X utf8 -m pipeline.migrate_biyijia.translate --slug %2 --langs zh-TW,en,es,pt
) else (
    python -X utf8 -m pipeline.migrate_biyijia.migrate --limit 10
)

pause
