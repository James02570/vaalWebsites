# Vaal Websites — Improved Source Code

## Project Structure

```
vaal_improved/
├── index.html              # Main shell (navbar, footer, login modal)
├── app.js                  # SPA router, page loader, form handler, toast
├── styles/
│   ├── main.css            # Global: reset, navbar, footer, modal, toast
│   ├── home.css            # Home page styles
│   ├── about.css           # About page styles
│   ├── products.css        # Products / pricing styles
│   └── partners.css        # Partners / alliance styles
├── pages/
│   ├── home.html           # Home page content
│   ├── about.html          # About page content
│   ├── products.html       # Pricing page content
│   └── partners.html       # Partners page content
└── assets/                 # Copy from your original project
    ├── icons/              # Social media icons
    ├── icons2/             # Tech icons
    ├── partnerIcons/       # Partner SVG icons
    ├── whyChooseIcons/     # Why-choose SVG icons
    └── pexels-madeon08-102061.jpg
```

## Setup

1. Copy your `assets/` folder from the original project into `vaal_improved/assets/`
2. Serve the project using a local server (required for fetch() to work):
   - VS Code: install "Live Server" extension, right-click index.html → Open with Live Server
   - Node: `npx serve .`
   - Python: `python -m http.server`
3. Open http://localhost:PORT in your browser

## What was improved

### Bugs fixed
- `loadPage()` now has try/catch error handling with a friendly error message
- Loading spinner shown while fetching pages
- `home.js` slider logic moved into `app.js` as `initHome()`, called after every page load
- Dead `#chatBot` route and broken `loadChatbotScript()` removed
- Inline `onclick="closeLogin()"` replaced with `addEventListener`
- Image paths changed from `/assets/` (absolute) to `assets/` (relative)
- Consultation form now has a real submit handler with success/error feedback
- Partner form now has a real submit handler with success/error feedback
- Stray Arabic word removed from "Built for Growth" card

### New features
- Loading spinner between page transitions
- Toast notification system (success/error messages)
- Mobile hamburger navigation menu
- Monthly/Annual billing toggle on products page
- Active nav link highlighting
- Footer copyright year auto-updates
- Smooth page fade transition

### Accessibility
- Login modal has `role="dialog"`, `aria-modal`, `aria-labelledby`
- Social links have `rel="noopener"` for security
- Form fields have proper `<label>` elements
- Buttons have `aria-label` where needed
- `aria-live="polite"` on `<main>` for screen readers

### Code quality
- Consistent 2-space indentation throughout
- CSS custom properties (variables) for colours, spacing, shadows
- No inline event handlers anywhere
- `clamp()` for responsive font sizes

## Connecting forms to a real backend

In `app.js`, find `initFormSubmit()` and replace the simulated delay with a real fetch:

```js
const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
if (!res.ok) throw new Error('Server error');
```
