// Run from the website root. Inputs are the original photo and its existing
// lossless desktop upscale; no image content or framing is changed here.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const mobileSource = process.argv[2] ?? '../hero-fullres.png';
const desktopSource = process.argv[3] ?? 'output/hero-upscale.local/hero-fullres-4x.png';
const temporary = mkdtempSync(path.join(tmpdir(), 'wareongo-hero-'));
const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`);
};

try {
  for (const [name, width, source] of [
    ['mobile', 960, mobileSource],
    ['1536', 1536, desktopSource],
    ['2560', 2560, desktopSource],
    ['3840', 3840, desktopSource],
  ]) {
    const resized = path.join(temporary, `${name}.png`);
    const asset = `src/assets/hero-image-${name}`;
    run('magick', [source, '-filter', 'Lanczos', '-resize', `${width}x`, '-strip', '-alpha', 'off', resized]);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', resized, '-frames:v', '1',
      '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', name === 'mobile' ? '30' : '28',
      '-cpu-used', '6', '-pix_fmt', 'yuv420p', '-y', `${asset}.avif`]);
    // A progressive fallback fills the whole frame in successive scans instead
    // of revealing the photo from top to bottom on a slow connection.
    run('magick', [resized, '-strip', '-quality', '72', '-interlace', 'Plane', `${asset}.jpg`]);
    for (const extension of ['avif', 'jpg']) {
      console.log(`${asset}.${extension}: ${statSync(`${asset}.${extension}`).size} bytes`);
    }
  }
  // Vite embeds this sub-4 KiB asset into the CSS, so the initial preview needs
  // no image request and also works before hydration or with JavaScript off.
  const preview = 'src/assets/hero-image-preview.webp';
  run('magick', [mobileSource, '-resize', '144x', '-strip', '-alpha', 'off',
    '-define', 'webp:method=6', '-quality', '30', preview]);
  if (statSync(preview).size >= 4096) throw new Error('Hero preview must stay below Vite’s 4 KiB inline limit');
  console.log(`${preview}: ${statSync(preview).size} bytes`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
