#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Bitaigen 部署修复脚本
# 运行方式: chmod +x fix-deploy.sh && ./fix-deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e
echo "═══════════════════════════════════════════════"
echo "  Bitaigen 生产部署修复脚本"
echo "═══════════════════════════════════════════════"
echo ""

# ── 第 1 步：删除重复文件 ─────────────────────────────────
echo "🔧 步骤 1/6: 删除重复文件..."

# 删除 components 下的重复 Layout（保留 layouts 目录下的）
if [ -f "src/components/Layout.astro" ]; then
  rm "src/components/Layout.astro"
  echo "  ✅ 删除 src/components/Layout.astro（保留 src/layouts/Layout.astro）"
fi

# 删除旧版工具文件（保留 coinInfo.ts 和 priceService.ts）
if [ -f "src/utils/coin-info.ts" ]; then
  rm "src/utils/coin-info.ts"
  echo "  ✅ 删除 src/utils/coin-info.ts（保留 coinInfo.ts）"
fi

if [ -f "src/utils/price-service.ts" ]; then
  rm "src/utils/price-service.ts"
  echo "  ✅ 删除 src/utils/price-service.ts（保留 priceService.ts）"
fi

# 删除重复的 API 文件
if [ -f "src/pages/api/prices-api.ts" ]; then
  rm "src/pages/api/prices-api.ts"
  echo "  ✅ 删除 src/pages/api/prices-api.ts（保留 prices.json.ts）"
fi

echo ""

# ── 第 2 步：移动错误放置的文件 ──────────────────────────
echo "🔧 步骤 2/6: 修复文件路径..."

# 移动币种详情页从 api/ 到 coin/
if [ -f "src/pages/api/[symbol].astro" ]; then
  mkdir -p src/pages/coin
  rm "src/pages/api/[symbol].astro"
  echo "  ✅ 删除 src/pages/api/[symbol].astro（将被新版替换到 coin/）"
fi

echo ""

# ── 第 3 步：复制修复后的文件 ─────────────────────────────
echo "🔧 步骤 3/6: 复制修复后的文件..."

# 注意：此脚本假设 fixed-files/ 目录在同级
FIXED_DIR="fixed-files"

if [ -d "$FIXED_DIR" ]; then
  # Ghost 工具（加强版错误处理）
  cp "$FIXED_DIR/src/utils/ghost.ts" src/utils/ghost.ts
  echo "  ✅ src/utils/ghost.ts（加强版错误处理）"

  # Archives 页面（SSR，容错）
  cp "$FIXED_DIR/src/pages/archives/[...page].astro" "src/pages/archives/[...page].astro"
  echo "  ✅ src/pages/archives/[...page].astro"

  cp "$FIXED_DIR/src/pages/archives/[slug].astro" "src/pages/archives/[slug].astro"
  echo "  ✅ src/pages/archives/[slug].astro"

  # 币种详情页（新路径）
  mkdir -p src/pages/coin
  cp "$FIXED_DIR/src/pages/coin/[symbol].astro" "src/pages/coin/[symbol].astro"
  echo "  ✅ src/pages/coin/[symbol].astro（新路径）"

  # API 端点
  cp "$FIXED_DIR/src/pages/api/prices.json.ts" src/pages/api/prices.json.ts
  echo "  ✅ src/pages/api/prices.json.ts"

  # Vercel 配置
  cp "$FIXED_DIR/vercel.json" vercel.json
  echo "  ✅ vercel.json"
else
  echo "  ⚠️ fixed-files/ 目录不存在，请手动复制修复文件"
fi

echo ""

# ── 第 4 步：创建 .env 文件 ──────────────────────────────
echo "🔧 步骤 4/6: 检查环境变量..."

if [ ! -f ".env" ]; then
  cat > .env << 'EOF'
# Ghost CMS API
GHOST_URL=https://coin.ghost.io
GHOST_CONTENT_KEY=9269336edff13b5664c35c8706
EOF
  echo "  ✅ 创建 .env 文件（本地开发用）"
else
  echo "  ℹ️  .env 已存在，请确保包含 GHOST_URL 和 GHOST_CONTENT_KEY"
fi

# 确保 .env 在 .gitignore 中
if [ -f ".gitignore" ]; then
  if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo "  ✅ 已将 .env 添加到 .gitignore"
  fi
fi

echo ""

# ── 第 5 步：验证关键文件 ─────────────────────────────────
echo "🔧 步骤 5/6: 验证文件结构..."

# 检查不应存在的文件
ERRORS=0
for f in "src/components/Layout.astro" "src/utils/coin-info.ts" "src/utils/price-service.ts" "src/pages/api/prices-api.ts" "src/pages/api/[symbol].astro"; do
  if [ -f "$f" ]; then
    echo "  ❌ 发现应删除的文件: $f"
    ERRORS=$((ERRORS + 1))
  fi
done

# 检查必须存在的文件
for f in "src/layouts/Layout.astro" "src/utils/coinInfo.ts" "src/utils/priceService.ts" "src/utils/ghost.ts" "src/pages/api/prices.json.ts" "astro.config.ts" "package.json"; do
  if [ ! -f "$f" ]; then
    echo "  ❌ 缺少必要文件: $f"
    ERRORS=$((ERRORS + 1))
  else
    echo "  ✅ $f"
  fi
done

echo ""

# ── 第 6 步：尝试构建 ────────────────────────────────────
echo "🔧 步骤 6/6: 准备构建..."

if [ $ERRORS -gt 0 ]; then
  echo "  ⚠️ 发现 $ERRORS 个问题，请先手动修复后再构建"
else
  echo "  ✅ 所有文件检查通过"
  echo ""
  echo "  现在可以执行构建测试:"
  echo "    npm run build"
  echo ""
  echo "  或直接推送到 Git 触发 Vercel 部署:"
  echo "    git add ."
  echo '    git commit -m "fix: resolve deployment issues"'
  echo "    git push origin main"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  ⚠️ 重要：Vercel 环境变量配置"
echo "═══════════════════════════════════════════════"
echo ""
echo "  请在 Vercel Dashboard → Settings → Environment Variables 中添加："
echo ""
echo "  GHOST_URL = https://coin.ghost.io"
echo "  GHOST_CONTENT_KEY = 9269336edff13b5664c35c8706"
echo ""
echo "  适用环境: Production + Preview + Development"
echo ""
echo "═══════════════════════════════════════════════"
echo "  修复完成！"
echo "═══════════════════════════════════════════════"