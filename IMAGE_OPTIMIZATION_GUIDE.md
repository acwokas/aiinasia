# Image Optimization Guide

## Current Issue
Your site has **2,793 KiB of wasted image bandwidth**, causing slow page loads and poor LCP scores.

## Critical Action Required: Optimize Logo Files

The static logos in `src/assets/` need to be **manually optimized** as they're bundled during build:

### Files to Optimize

| File | Current | Displayed As | Target Size | Savings |
|------|---------|--------------|-------------|---------|
| `businessinabyte-logo.png` | 1379x674 (401KB) | 220x107px | 440x214 WebP | ~350KB |
| `promptandgo-logo.png` | 1920x1080 (183KB) | 350x100px | 700x200 WebP | ~150KB |
| `aiinasia-logo.png` | 1312x736 (121KB) | 171x96px | 342x192 WebP | ~100KB |
| `myofferclub-logo.png` | 1312x736 (101KB) | 136x76px | 272x152 WebP | ~80KB |
| `aiacademy-logo.png` | 1312x736 (88KB) | 136x76px | 272x152 WebP | ~70KB |

**Total Potential Savings: ~750KB**

### Step-by-Step Process

#### Option 1: Using Squoosh (Recommended)
1. Go to [squoosh.app](https://squoosh.app)
2. Upload each PNG file
3. Set compression to WebP
4. Resize to target dimensions (see table above)
5. Set quality to 85
6. Download optimized file
7. **Save with `.webp` extension**
8. Replace original file in `src/assets/`

#### Option 2: Using ImageOptim / TinyPNG
1. Visit [tinypng.com](https://tinypng.com) or use ImageOptim app
2. Upload PNG files
3. Download compressed versions
4. Use an image editor to resize to target dimensions
5. Convert to WebP format
6. Replace files in `src/assets/`

#### Option 3: Using CLI Tools
```bash
# Install sharp-cli
npm install -g sharp-cli

# Optimize each logo (example for businessinabyte)
sharp -i src/assets/businessinabyte-logo.png \
  -o src/assets/businessinabyte-logo.webp \
  --resize 440 214 \
  --webp "{quality: 85}"

# Repeat for other logos with their respective dimensions
```

### After Optimization
1. Update imports to use `.webp` extensions
2. Keep original PNGs as fallback if needed
3. Test on different devices

## Code Changes Already Applied

✅ **Article images** now use optimized URLs with:
- Proper srcset for responsive loading
- WebP format conversion
- Appropriate sizing based on display context
- Lazy loading (except hero images)

✅ **Trending article images** optimized with proper dimensions

✅ **All image components** now include:
- Explicit width/height attributes
- Responsive srcset
- Proper sizes attribute
- Lazy loading strategy

## Expected Results After Logo Optimization

- **Performance score**: Should increase to 90+ (currently 80)
- **LCP improvement**: ~1-1.5s faster
- **Total bandwidth saved**: ~750KB on initial page load
- **Mobile experience**: Significantly faster load times

## Additional Recommendations

### For Future Uploads
1. Always resize images before upload
2. Use WebP/AVIF formats
3. Target max width: 1920px for hero images, 800px for thumbnails
4. Keep quality at 80-85%

### Automated Solutions
Consider adding a build-time optimization:
```bash
npm install -D vite-plugin-imagemin
```

Then configure in `vite.config.ts` to automatically optimize images during build.
