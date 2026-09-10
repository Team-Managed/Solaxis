#!/usr/bin/env bash
# ==============================================================================
# Solaxis CLI Installer for macOS and Linux
#
# Quick Install via Web:
#   curl -fsSL https://solaxis.run/install.sh | bash
#   or
#   curl -fsSL http://localhost:3000/install.sh | bash
#
# Local Repository Install:
#   ./install.sh
# ==============================================================================

set -e

# Terminal colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}${BOLD}   ____        _             _     ${NC}"
echo -e "${CYAN}${BOLD}  / ___|  ___ | | __ ___  _ (_)___ ${NC}"
echo -e "${CYAN}${BOLD}  \___ \ / _ \| |/ _\` \ \/ /| / __|${NC}"
echo -e "${CYAN}${BOLD}   ___) | (_) | | (_| |>  < | \__ \\${NC}"
echo -e "${CYAN}${BOLD}  |____/ \___/|_|\__,_/_/\_\|_|___/${NC}"
echo -e "  ${GRAY}Serverless Web3 Micro-Instances on Solana & MagicBlock ER${NC}"
echo ""

# ------------------------------------------------------------------------------
# 1. Pre-flight Check: Node.js
# ------------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}✖ Error: Node.js is required but was not found on your system.${NC}"
  echo -e "Please install Node.js (v20.x or higher recommended) using your package manager:"
  echo -e "  • macOS (Homebrew): ${CYAN}brew install node${NC}"
  echo -e "  • Linux (Ubuntu/Debian): ${CYAN}curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs${NC}"
  echo -e "  • Or using nvm: ${CYAN}nvm install 20 && nvm use 20${NC}"
  echo -e "Then re-run this installation script."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${YELLOW}⚠ Warning: Node.js version $NODE_VERSION detected. Solaxis recommends Node.js >= 20.x (minimum 18.x).${NC}"
fi

# ------------------------------------------------------------------------------
# 2. Setup Directories
# ------------------------------------------------------------------------------
SOLAXIS_HOME="${SOLAXIS_HOME:-$HOME/.solaxis}"
SOLAXIS_BIN_DIR="$SOLAXIS_HOME/bin"
mkdir -p "$SOLAXIS_BIN_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"
IS_LOCAL=0

# Detect if run from inside an existing Solaxis monorepo checkout
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/cli/package.json" ]; then
  IS_LOCAL=1
  REPO_DIR="$SCRIPT_DIR"
elif [ -f "$(pwd)/cli/package.json" ]; then
  IS_LOCAL=1
  REPO_DIR="$(pwd)"
fi

# ------------------------------------------------------------------------------
# 3. Build / Fetch Solaxis CLI
# ------------------------------------------------------------------------------
if [ "$IS_LOCAL" -eq 1 ]; then
  echo -e "${GREEN}==>${NC} Installing from local repository: ${GRAY}$REPO_DIR${NC}"
  
  if [ ! -f "$REPO_DIR/cli/dist/bin/solaxis.js" ]; then
    echo -e "${GREEN}==>${NC} Building Solaxis packages..."
    if command -v pnpm >/dev/null 2>&1; then
      (cd "$REPO_DIR" && pnpm build)
    elif command -v npm >/dev/null 2>&1; then
      (cd "$REPO_DIR" && npx -y pnpm build)
    fi
  fi
  CLI_ENTRY="$REPO_DIR/cli/dist/bin/solaxis.js"
else
  echo -e "${GREEN}==>${NC} Downloading Solaxis CLI from GitHub..."
  SOLAXIS_REPO="$SOLAXIS_HOME/repo"
  
  if ! command -v git >/dev/null 2>&1; then
    echo -e "${RED}✖ Error: git is required to download Solaxis.${NC}"
    exit 1
  fi

  if [ -d "$SOLAXIS_REPO/.git" ]; then
    echo -e "${GRAY}Updating existing checkout at $SOLAXIS_REPO...${NC}"
    (cd "$SOLAXIS_REPO" && git pull --quiet)
  else
    git clone --depth 1 https://github.com/Team-Managed/Solaxis.git "$SOLAXIS_REPO" --quiet
  fi

  echo -e "${GREEN}==>${NC} Building Solaxis distribution..."
  if command -v pnpm >/dev/null 2>&1; then
    (cd "$SOLAXIS_REPO" && pnpm install --frozen-lockfile=false && pnpm build)
  else
    (cd "$SOLAXIS_REPO" && npx -y pnpm install --frozen-lockfile=false && npx -y pnpm build)
  fi
  CLI_ENTRY="$SOLAXIS_REPO/cli/dist/bin/solaxis.js"
fi

if [ ! -f "$CLI_ENTRY" ]; then
  echo -e "${RED}✖ Build failed: $CLI_ENTRY not found.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 4. Create Executable Wrapper
# ------------------------------------------------------------------------------
WRAPPER_PATH="$SOLAXIS_BIN_DIR/solaxis"

cat > "$WRAPPER_PATH" <<EOF
#!/usr/bin/env bash
exec node "$CLI_ENTRY" "\$@"
EOF

chmod +x "$WRAPPER_PATH"
echo -e "${GREEN}==>${NC} Created launcher at ${CYAN}$WRAPPER_PATH${NC}"

# ------------------------------------------------------------------------------
# 5. Add to PATH
# ------------------------------------------------------------------------------
PATH_ADDED=0
CURRENT_SHELL="$(basename "${SHELL:-/bin/bash}")"
TARGET_RC=""

if [ "$CURRENT_SHELL" = "zsh" ]; then
  TARGET_RC="$HOME/.zshrc"
elif [ "$CURRENT_SHELL" = "bash" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    TARGET_RC="$HOME/.bash_profile"
    [ ! -f "$TARGET_RC" ] && TARGET_RC="$HOME/.bashrc"
  else
    TARGET_RC="$HOME/.bashrc"
  fi
else
  TARGET_RC="$HOME/.profile"
fi

LINE_TO_ADD="export PATH=\"$SOLAXIS_BIN_DIR:\$PATH\""

if [[ ":$PATH:" != *":$SOLAXIS_BIN_DIR:"* ]]; then
  if [ -n "$TARGET_RC" ] && [ -f "$TARGET_RC" ]; then
    if ! grep -q "SOLAXIS_BIN_DIR\|.solaxis/bin" "$TARGET_RC" 2>/dev/null; then
      echo "" >> "$TARGET_RC"
      echo "# Solaxis CLI PATH" >> "$TARGET_RC"
      echo "$LINE_TO_ADD" >> "$TARGET_RC"
      PATH_ADDED=1
    fi
  elif [ -n "$TARGET_RC" ]; then
    echo "# Solaxis CLI PATH" > "$TARGET_RC"
    echo "$LINE_TO_ADD" >> "$TARGET_RC"
    PATH_ADDED=1
  fi
fi

# ------------------------------------------------------------------------------
# 6. Verification
# ------------------------------------------------------------------------------
INSTALLED_VER=$("$WRAPPER_PATH" --version 2>/dev/null || echo "0.1.0")

echo ""
echo -e "${GREEN}${BOLD}✓ Solaxis CLI v$INSTALLED_VER installed successfully!${NC}"
echo ""

if [ "$PATH_ADDED" -eq 1 ]; then
  echo -e "To activate ${CYAN}solaxis${NC} in your current terminal session, run:"
  echo -e "  ${BOLD}source $TARGET_RC${NC}"
  echo ""
fi

echo -e "Try running:"
echo -e "  ${CYAN}solaxis --help${NC}"
echo -e "  ${CYAN}solaxis new my-custom-engine${NC}"
echo -e "  ${CYAN}solaxis invoke my-custom-engine -i 50 --tee${NC}"
echo -e "  ${CYAN}solaxis vm${NC}"
echo ""
