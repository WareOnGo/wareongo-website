# Local web fonts

These unmodified Google Fonts WOFF2 files replace the remote Google stylesheet.
`src/fonts.css` preserves its Unicode subsets and `font-display: swap`. Montserrat
uses one variable font per subset for weights 300–800.
Only the Montserrat Latin file is preloaded in `index.html`;
Vite fingerprints both references to the same asset, avoiding duplicate downloads.
Other subsets load only when text uses them.

The supplemental `montserrat-v31-normal-rupee.woff2` contains U+20B9 from the
Latin-ext face, with the same variable outlines and metrics. Price labels no
longer require the full extended face. The original Unicode coverage and license
remain available. Regenerate it with FontTools 4.61.1:

```sh
python3 -m fontTools.subset src/assets/fonts/montserrat-v31-normal-latin-ext.woff2 --unicodes=U+20B9 --flavor=woff2 --output-file=src/assets/fonts/montserrat-v31-normal-rupee.woff2
```

Downloaded on 2026-09-21 from the Google Fonts CSS API for:
`Montserrat:wght@300;400;500;600;700;800`.

The SIL Open Font License notice ships in `public/licenses/montserrat-OFL.txt`.
Retain it when updating the fonts.

| Local file | Original URL |
| --- | --- |
| `montserrat-v31-normal-cyrillic-ext.woff2` | [Google Fonts](https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WRhyyTh89ZNpQ.woff2) |
| `montserrat-v31-normal-cyrillic.woff2` | [Google Fonts](https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459W1hyyTh89ZNpQ.woff2) |
| `montserrat-v31-normal-vietnamese.woff2` | [Google Fonts](https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WZhyyTh89ZNpQ.woff2) |
| `montserrat-v31-normal-latin-ext.woff2` | [Google Fonts](https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WdhyyTh89ZNpQ.woff2) |
| `montserrat-v31-normal-latin.woff2` | [Google Fonts](https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2) |
