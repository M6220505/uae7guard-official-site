#!/bin/bash

# Script to update all section components to use client-side localization

FILES=(
  "components/sections/Hero.tsx"
  "components/sections/SecurityScanner.tsx"
  "components/sections/AIScamDetection.tsx"
  "components/sections/WalletMonitoring.tsx"
  "components/sections/MultiChainSupport.tsx"
  "components/sections/SecureEscrow.tsx"
  "components/sections/NFTRiskAnalysis.tsx"
  "components/sections/ServiceModules.tsx"
  "components/sections/TechnicalArchitecture.tsx"
  "components/sections/Footer.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."

    # Replace the import statement
    sed -i '' "s/import { useTranslations } from 'next-intl';/import { useLanguage } from '@\/lib\/language-context';/g" "$file"

    # Replace the hook usage with proper destructuring
    sed -i '' "s/const t = useTranslations('[^']*');/const { t } = useLanguage();/g" "$file"

    echo "✓ Updated $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo ""
echo "All files updated successfully!"
