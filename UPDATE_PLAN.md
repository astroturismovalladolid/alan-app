# Dependency Update Plan

## Priority 1: Security Fixes (Do Now)

### Safe automatic fixes
```bash
npm audit fix
```

This will fix:
- @babel/runtime
- brace-expansion
- tmp

### Next.js Security Update (Manual)
```bash
npm install next@15.5.6
npm test
npm run build
```

**Risk**: Low - patch version update
**Benefit**: Fixes 3 security vulnerabilities

## Priority 2: Minor/Patch Updates (Safe to do)

### Radix UI Components (24 packages)
```bash
npm update @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip
```

**Risk**: Very Low - all minor/patch versions
**Benefit**: Bug fixes and improvements

### Genkit AI
```bash
npm update @genkit-ai/google-genai @genkit-ai/next genkit genkit-cli
```

**Risk**: Low - minor version update (1.20.0 → 1.22.0)
**Benefit**: Latest AI features and fixes

### Other Safe Updates
```bash
npm update dotenv @types/node @types/react @types/react-dom
```

## Priority 3: Major Updates (Review Carefully)

### ⚠️ @hookform/resolvers (4.1.3 → 5.2.2)
**Breaking Change**: May require code updates
**Action**: Test form validation thoroughly after update

### ⚠️ date-fns (3.6.0 → 4.1.0)
**Breaking Change**: API changes in v4
**Action**: Review changelog, may affect date formatting

### ⚠️ @types/react (18.3.18 → 19.2.4)
**Breaking Change**: React 19 types
**Action**: Skip for now, wait until React 19 is stable

## Recommended Immediate Actions

1. **Run security fixes first:**
   ```bash
   npm audit fix
   npm install next@15.5.6
   npm test
   npm run build
   git add package*.json
   git commit -m "chore: update dependencies for security fixes"
   ```

2. **Update Radix UI & Genkit (low risk):**
   ```bash
   npm update @radix-ui/react-* @genkit-ai/* genkit genkit-cli
   npm test
   npm run build
   ```

3. **Skip major updates for now** - these can break things:
   - @hookform/resolvers 5.x
   - date-fns 4.x
   - React 19 types

## Validation Checklist

After any updates, run:
- [ ] `npm test` - All 41 tests pass
- [ ] `npm run build` - Build succeeds
- [ ] Manual testing of:
  - [ ] Login/Auth flow
  - [ ] Upload observation form
  - [ ] Image detail pages
  - [ ] Forum pages
  - [ ] AI analysis features

## Notes

- Current test suite (41 tests) will catch most breaking changes
- All updates should be done in a separate branch
- Test thoroughly before merging to main
