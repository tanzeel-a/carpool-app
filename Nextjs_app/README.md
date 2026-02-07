# Carpool - Landing Page

A modern, responsive landing page for the Carpool app - connecting nearby travelers to share rides, split fares, and reduce carbon footprint.

## Overview

Carpool is an innovative ride-sharing platform that helps people at bus stops, train stations, or any location discover other travelers heading the same direction. Users can match instantly, share a cab or carpool, and split costs while reducing emissions.

**Tagline:** *Share the ride. Split the fare. Save the planet.*

## Features

### Hero Section
- Full-width hero with background image and gradient overlay
- Animated shiny gold heading text with CSS gradient animation
- Call-to-action buttons ("Find people nearby", "How it works")
- Key statistics display (50% less fare, 2x less emissions, 100m match radius)
- Tagline badge at bottom

### Scrolling Announcement Ticker
- Animated marquee banner announcing mobile app release
- Gold background with smooth infinite scroll animation
- Large, bold uppercase text
- Positioned between hero and story sections

### Story Section
- Dark themed section with mission statement
- "Get early access" call-to-action button
- Explains the core value proposition

### Responsive Header
- Desktop: Horizontal navigation with "Book a Ride" and "Login" links
- Mobile (< 768px): Hamburger menu with slide-in drawer navigation
- Smooth animations for menu open/close
- Overlay backdrop when mobile menu is open
- Animated hamburger icon transforms to X

### Footer
- Dark themed footer (#11100e) with city skyline image
- Image is grayscale with 30% opacity for text readability
- Three-column grid layout:
  - **Contact Us** - Phone numbers
  - **Write to Us** - Email address
  - **Creators** - Harish & Tanzeel
- Gold headings with white text for contrast
- Privacy and Terms links
- Copyright notice

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Fonts**: Sora (via next/font)

## Project Structure

```
landing/
├── public/
│   └── assets/
│       ├── bg_image.jpg          # Hero background image
│       └── footer_city.png       # Footer cityscape image (grayscale)
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main landing page component
│   │   ├── page.module.css       # Page styles with CSS variables
│   │   ├── layout.tsx            # Root layout with fonts
│   │   └── globals.css           # Global reset styles
│   └── components/
│       ├── Header.tsx            # Responsive header with mobile menu
│       └── Header.module.css     # Header and mobile nav styles
└── package.json
```

## Design System

### Colors (CSS Variables)
```css
--ivory: #f6f1ea;        /* Light background */
--ink: #11100e;          /* Primary dark color */
--muted: #6e6660;        /* Secondary text */
--gold: #d4af37;         /* Primary accent */
--gold-light: #f4d984;   /* Light gold for highlights */
```

### Typography
- **Headings**: Uppercase with wide letter-spacing
- **Body**: Clean, readable with 1.7 line-height
- **Hero H1**: Animated gold gradient with shine effect

### Animations
- `shine` - Moving gradient on hero heading
- `scroll` - Infinite horizontal scroll for ticker
- CSS transitions on buttons, links, and menu

## Responsive Breakpoints

| Breakpoint | Description |
|------------|-------------|
| > 900px | Full desktop layout |
| 600px - 900px | Tablet - adjusted spacing, 2-col footer |
| < 768px | Mobile menu activated |
| < 600px | Stacked layouts, single column |

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open in browser:**
[http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Key Components

### Header.tsx
Client component with useState for mobile menu toggle. Features:
- Hamburger button (hidden on desktop)
- Slide-in mobile navigation drawer
- Click-outside-to-close overlay

### page.tsx
Main landing page with sections:
- Hero with background, tint overlay, and copy
- Scrolling ticker announcement
- Story section
- Footer with cityscape

## Creators

Built with care by **Harish** and **Tanzeel**

## Contact

- **Phone**: +91 9161148033, +91 6386148537
- **Email**: tanzeel.ahmad@tifr.res.in

## Coming Soon

Mobile app for iOS & Android - Stay tuned for updates!

---

© 2026 Carpool. All rights reserved.
