#!/bin/bash

# Checklist de vérification pour la fonctionnalité d'Avatar Upload

echo "========================================="
echo "Avatar Upload Feature - Verification Check"
echo "========================================="
echo ""

FAILED=0
PASSED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
  fi
}

# 1. Frontend Files Check
echo "1️⃣  Frontend Files"
echo "---"

test -f "AutoDrive-Frontend/app/profile/ProfileClient.tsx"
check_status "ProfileClient.tsx exists"

test -f "AutoDrive-Frontend/app/components/AvatarUpload.tsx"
check_status "AvatarUpload.tsx exists"

test -f "AutoDrive-Frontend/app/components/AvatarDisplay.tsx"
check_status "AvatarDisplay.tsx exists"

test -f "AutoDrive-Frontend/app/hooks/useAvatarUpload.ts"
check_status "useAvatarUpload.ts exists"

test -f "AutoDrive-Frontend/app/lib/avatarUtils.ts"
check_status "avatarUtils.ts exists"

echo ""

# 2. Backend Files Check
echo "2️⃣  Backend Files"
echo "---"

test -f "AutoDrive-Backend/src/users/users.controller.ts"
check_status "users.controller.ts exists"

test -f "AutoDrive-Backend/src/users/users.service.ts"
check_status "users.service.ts exists"

test -f "AutoDrive-Backend/src/users/schemas/user.schema.ts"
check_status "user.schema.ts exists"

echo ""

# 3. Code Quality Check
echo "3️⃣  Code Quality"
echo "---"

# Check if ProfileClient imports AvatarUpload
grep -q "AvatarUpload" AutoDrive-Frontend/app/profile/ProfileClient.tsx
check_status "ProfileClient imports AvatarUpload"

# Check if AvatarUpload imports useAvatarUpload
grep -q "useAvatarUpload" AutoDrive-Frontend/app/components/AvatarUpload.tsx
check_status "AvatarUpload imports useAvatarUpload hook"

# Check if users.controller has uploadAvatar endpoint
grep -q "@Post('avatar')" AutoDrive-Backend/src/users/users.controller.ts
check_status "Backend has POST /users/avatar endpoint"

# Check if user schema has avatarUrl field
grep -q "avatarUrl" AutoDrive-Backend/src/users/schemas/user.schema.ts
check_status "User schema has avatarUrl field"

# Check if user schema has avatarPath field
grep -q "avatarPath" AutoDrive-Backend/src/users/schemas/user.schema.ts
check_status "User schema has avatarPath field"

echo ""

# 4. Backend Dependencies Check
echo "4️⃣  Backend Dependencies"
echo "---"

grep -q "@nestjs/platform-express" AutoDrive-Backend/package.json
check_status "platform-express package installed"

grep -q "multer" AutoDrive-Backend/package.json
check_status "multer package installed"

grep -q "@supabase/supabase-js" AutoDrive-Backend/package.json
check_status "supabase-js package installed"

echo ""

# 5. Documentation Check
echo "5️⃣  Documentation"
echo "---"

test -f "AutoDrive-Frontend/AVATAR_FEATURE.md"
check_status "AVATAR_FEATURE.md exists"

test -f "AutoDrive-Backend/AVATAR_SETUP.md"
check_status "AVATAR_SETUP.md exists"

echo ""

# 6. Configuration Check
echo "6️⃣  Configuration"
echo "---"

test -f "AutoDrive-Frontend/.env.local"
if [ $? -eq 0 ]; then
  echo -e "${YELLOW}⚠${NC}  .env.local exists (verify NEXT_PUBLIC_API_BASE)"
else
  echo -e "${RED}✗${NC} .env.local missing (create with NEXT_PUBLIC_API_BASE)"
fi

test -f "AutoDrive-Backend/.env"
if [ $? -eq 0 ]; then
  echo -e "${YELLOW}⚠${NC}  .env exists (verify Supabase credentials)"
else
  echo -e "${RED}✗${NC} .env missing (create with Supabase credentials)"
fi

echo ""

# Summary
echo "========================================="
echo "Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "========================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Review output above.${NC}"
  exit 1
fi
