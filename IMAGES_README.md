# Image Setup Instructions

The website redesign has been applied with placeholders. To obtain the full "Personal Brand" look, please replace the following images:

1. **Personal Photo**:
   - Rename your high-contrast black & white photo to `hero-image.jpg`.
   - Place it in the `public/` folder.
   - (The code currently uses a placeholder from Unsplash, you can update `app/page.tsx` line 67 to point to `/hero-image.jpg` once uploaded).

2. **Logo (Optional)**:
   - If you have a specific logo file, place it in `public/logo.png` or `public/logo.svg`.
   - Update `components/Header.tsx` to use an `<img>` tag instead of the text if desired.

## Current State
- The design uses a placeholder image that matches the "Dark Luxury" aesthetic.
- All animations and layout changes are active.
