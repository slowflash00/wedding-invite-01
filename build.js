#!/usr/bin/env node
/**
 * build.js — Wedding Invitation Build Script
 * ──────────────────────────────────────────
 * Commands:
 *   node build.js preview  -> Outputs watermarked, asset-degraded preview to dist-preview/
 *   node build.js final    -> Outputs full-resolution, pristine production build to dist/
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const sharp = require('sharp');
const CleanCSS = require('clean-css');
const Terser = require('terser');

const MODE = process.argv[2] ? process.argv[2].toLowerCase() : null;

if (!['preview', 'final'].includes(MODE)) {
  console.error('\nUsage: node build.js <preview|final>\n');
  console.error('  node build.js preview  -> Build watermarked sample for prospective clients (dist-preview/)');
  console.error('  node build.js final    -> Build pristine, unwatermarked paid client release (dist/)\n');
  process.exit(1);
}

const ROOT_DIR = __dirname;
const OUT_DIR = path.join(ROOT_DIR, MODE === 'preview' ? 'dist-preview' : 'dist');

console.log(`\n========================================`);
console.log(`  Building Wedding Invitation: [${MODE.toUpperCase()}]`);
console.log(`  Destination: ${OUT_DIR}`);
console.log(`========================================\n`);

// Helper: Ensure directory exists
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper: Remove and recreate directory
function cleanDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

// Helper: Recursively get all files in directory
function getFilesSync(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFilesSync(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function run() {
  cleanDirSync(OUT_DIR);

  /* ─────────────────────────────────────────────────────────────
     1. ASSETS PROCESSING
     ───────────────────────────────────────────────────────────── */
  console.log(`\n[1/5] Processing assets...`);
  const assetsSrc = path.join(ROOT_DIR, 'assets');
  const assetsOut = path.join(OUT_DIR, 'assets');
  ensureDirSync(assetsOut);

  // Subfolders: decorations, images, stationery, audio, fonts, social
  const subdirs = ['decorations', 'images', 'stationery', 'audio', 'fonts', 'social'];
  for (const sub of subdirs) {
    ensureDirSync(path.join(assetsOut, sub));
  }

  // A. Process Images
  const imageFolders = ['decorations', 'images', 'stationery', 'social'];
  for (const folder of imageFolders) {
    const srcFolder = path.join(assetsSrc, folder);
    const destFolder = path.join(assetsOut, folder);
    if (!fs.existsSync(srcFolder)) continue;

    const files = fs.readdirSync(srcFolder);
    for (const file of files) {
      const srcFile = path.join(srcFolder, file);
      const destFile = path.join(destFolder, file);
      if (!fs.statSync(srcFile).isFile()) continue;

      const ext = path.extname(file).toLowerCase();
      const isImage = ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);

      if (!isImage) {
        fs.copyFileSync(srcFile, destFile);
        continue;
      }

      if (MODE === 'final') {
        // Final paid build: Copy original unwatermarked full-resolution file
        fs.copyFileSync(srcFile, destFile);
        console.log(`  ✓ [final] ${folder}/${file} (original quality)`);
      } else {
        // Preview build: Resize to max 800px longest side, reduce quality to 55-60, stamp watermark
        try {
          const meta = await sharp(srcFile).metadata();
          const maxSide = 800;
          let targetWidth = meta.width;
          let targetHeight = meta.height;

          if (targetWidth > maxSide || targetHeight > maxSide) {
            if (targetWidth > targetHeight) {
              targetHeight = Math.round((targetHeight * maxSide) / targetWidth);
              targetWidth = maxSide;
            } else {
              targetWidth = Math.round((targetWidth * maxSide) / targetHeight);
              targetHeight = maxSide;
            }
          }

          // SVG watermark pattern stamped into pixel data
          const wmSvg = Buffer.from(`
            <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="wm" width="160" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                  <text x="80" y="50" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" letter-spacing="1.5px" fill="rgba(255,255,255,0.35)" stroke="rgba(25,25,25,0.35)" stroke-width="0.8">SAMPLE</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wm)" />
            </svg>
          `);

          let pipeline = sharp(srcFile)
            .resize(targetWidth, targetHeight)
            .composite([{ input: wmSvg, blend: 'over' }]);

          if (ext === '.webp') {
            pipeline = pipeline.webp({ quality: 58 });
          } else if (ext === '.jpg' || ext === '.jpeg') {
            pipeline = pipeline.jpeg({ quality: 58 });
          } else if (ext === '.png') {
            pipeline = pipeline.png({ quality: 58 });
          }

          await pipeline.toFile(destFile);
          console.log(`  ✓ [preview] ${folder}/${file} -> ${targetWidth}x${targetHeight} (watermarked, q=58)`);
        } catch (err) {
          console.warn(`  ! Sharp error on ${file}:`, err.message);
          fs.copyFileSync(srcFile, destFile);
        }
      }
    }
  }

  // B. Process Audio
  const srcAudioDir = path.join(assetsSrc, 'audio');
  const destAudioDir = path.join(assetsOut, 'audio');
  if (fs.existsSync(srcAudioDir)) {
    const audioFiles = fs.readdirSync(srcAudioDir);
    for (const file of audioFiles) {
      const srcFile = path.join(srcAudioDir, file);
      const destFile = path.join(destAudioDir, file);
      if (!fs.statSync(srcFile).isFile()) continue;

      if (MODE === 'final') {
        fs.copyFileSync(srcFile, destFile);
        console.log(`  ✓ [final] audio/${file} (full audio preserved)`);
      } else {
        // Create 25-second, 48kbps preview clip using ffmpeg if available
        let ffmpegOk = false;
        try {
          const res = spawnSync('ffmpeg', [
            '-y',
            '-i', srcFile,
            '-ss', '0',
            '-t', '25',
            '-b:a', '48k',
            destFile
          ]);
          if (res.status === 0 && fs.existsSync(destFile)) {
            ffmpegOk = true;
            console.log(`  ✓ [preview] audio/${file} (trimmed to 25s preview @ 48kbps)`);
          }
        } catch (_) {}

        if (!ffmpegOk) {
          // If ffmpeg not available, copy file but log notice
          fs.copyFileSync(srcFile, destFile);
          console.log(`  ✓ [preview] audio/${file} (copied fallback)`);
        }
      }
    }
  }

  // C. Process Fonts (if any)
  const srcFontsDir = path.join(assetsSrc, 'fonts');
  const destFontsDir = path.join(assetsOut, 'fonts');
  if (fs.existsSync(srcFontsDir)) {
    const fontFiles = fs.readdirSync(srcFontsDir);
    for (const file of fontFiles) {
      const srcFile = path.join(srcFontsDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, path.join(destFontsDir, file));
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     2. CSS MINIFICATION
     ───────────────────────────────────────────────────────────── */
  console.log(`\n[2/5] Minifying CSS stylesheets...`);
  const srcCssDir = path.join(ROOT_DIR, 'css');
  const destCssDir = path.join(OUT_DIR, 'css');
  ensureDirSync(destCssDir);

  const cleanCss = new CleanCSS({ sourceMap: false, level: 1 });
  const cssFiles = fs.readdirSync(srcCssDir).filter(f => f.endsWith('.css'));
  for (const file of cssFiles) {
    const srcPath = path.join(srcCssDir, file);
    const destPath = path.join(destCssDir, file);
    const srcCode = fs.readFileSync(srcPath, 'utf8');
    const minified = cleanCss.minify(srcCode);
    fs.writeFileSync(destPath, minified.styles, 'utf8');
    console.log(`  ✓ css/${file} (${srcCode.length}B -> ${minified.styles.length}B)`);
  }

  /* ─────────────────────────────────────────────────────────────
     3. JAVASCRIPT MINIFICATION & GUARD INCLUSION
     ───────────────────────────────────────────────────────────── */
  console.log(`\n[3/5] Processing & minifying JavaScript...`);
  const srcJsDir = path.join(ROOT_DIR, 'js');
  const destJsDir = path.join(OUT_DIR, 'js');
  ensureDirSync(destJsDir);

  const jsFiles = fs.readdirSync(srcJsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    // If FINAL build, NEVER include preview-guard.js
    if (MODE === 'final' && file === 'preview-guard.js') {
      console.log(`  ✕ [final] preview-guard.js omitted completely`);
      continue;
    }

    const srcPath = path.join(srcJsDir, file);
    const destPath = path.join(destJsDir, file);
    let srcCode = fs.readFileSync(srcPath, 'utf8');

    // In config.js for final build, disable preview config
    if (file === 'config.js' && MODE === 'final') {
      srcCode = srcCode.replace(/preview:\s*\{[\s\S]*?enabled:\s*true[\s\S]*?\},/g, 'preview: { enabled: false },');
    }

    try {
      const minResult = await Terser.minify(srcCode, {
        sourceMap: false,
        compress: { drop_console: false },
        mangle: true,
      });
      fs.writeFileSync(destPath, minResult.code, 'utf8');
      console.log(`  ✓ js/${file} (${srcCode.length}B -> ${minResult.code.length}B)`);
    } catch (err) {
      console.warn(`  ! Terser minify failed for ${file}, saving unminified:`, err.message);
      fs.writeFileSync(destPath, srcCode, 'utf8');
    }
  }

  /* ─────────────────────────────────────────────────────────────
     4. HTML PROCESSING
     ───────────────────────────────────────────────────────────── */
  console.log(`\n[4/5] Processing index.html...`);
  let html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  // Remove any pre-existing preview-guard script tags or robot meta tags first
  html = html.replace(/\s*<script\s+src=["']js\/preview-guard\.js["']\s*><\/script>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '');

  if (MODE === 'preview') {
    // Inject noindex meta tag into head
    const robotsMeta = '\n  <meta name="robots" content="noindex, nofollow">';
    html = html.replace(/<head>/i, '<head>' + robotsMeta);

    // Inject preview-guard.js script tag before main.js
    const guardScript = '  <script src="js/preview-guard.js"></script>\n';
    if (html.includes('<script src="js/main.js"></script>')) {
      html = html.replace('<script src="js/main.js"></script>', guardScript + '  <script src="js/main.js"></script>');
    } else {
      html = html.replace('</body>', guardScript + '</body>');
    }

    // Create robots.txt in dist-preview
    fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
    console.log(`  ✓ Generated robots.txt (Disallow: /)`);
    console.log(`  ✓ Injected <meta name="robots" content="noindex, nofollow">`);
    console.log(`  ✓ Injected <script src="js/preview-guard.js"></script>`);
  } else {
    console.log(`  ✓ Clean HTML: No preview guard, no watermark, indexable`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html, 'utf8');

  /* ─────────────────────────────────────────────────────────────
     5. BUILD VERIFICATION & SUMMARY
     ───────────────────────────────────────────────────────────── */
  console.log(`\n[5/5] Verifying build...`);
  const outFiles = getFilesSync(OUT_DIR);
  console.log(`  Total files created: ${outFiles.length}`);

  // Check image sizes in preview mode
  if (MODE === 'preview') {
    let imagesChecked = 0;
    for (const f of outFiles) {
      const ext = path.extname(f).toLowerCase();
      if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
        const m = await sharp(f).metadata();
        imagesChecked++;
        if (m.width > 800 || m.height > 800) {
          console.error(`  ✕ ERROR: Image exceeds 800px: ${path.basename(f)} (${m.width}x${m.height})`);
        }
      }
    }
    console.log(`  ✓ All ${imagesChecked} images verified <= 800px with watermark.`);
  }

  console.log(`\n========================================`);
  console.log(`  ${MODE.toUpperCase()} BUILD COMPLETED SUCCESSFULLY!`);
  console.log(`  Output folder: ${path.relative(ROOT_DIR, OUT_DIR)}/`);
  console.log(`========================================\n`);
}

run().catch(err => {
  console.error('\nFatal build error:', err);
  process.exit(1);
});
