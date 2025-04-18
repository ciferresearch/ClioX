# Typography Guide

This document outlines the typography system used in the ClioX landing page. Following these guidelines will ensure visual consistency throughout the application.

## Font Families

```jsx
// Sans-serif (headings, navigation, buttons)
<element className="font-sans">IBM Plex Sans</element>

// Serif (body text, paragraphs)
<element className="font-serif">Libre Baskerville</element>
```

## Heading Hierarchy

Use these heading styles consistently to maintain proper document hierarchy:

```jsx
// Main page heading (use only once per page, typically in hero section)
<h1 className="text-4xl md:text-5xl font-bold font-sans">Page Title</h1>

// Section headings
<h2 className="text-3xl font-bold font-sans">Section Title</h2>

// Subsection headings
<h3 className="text-2xl font-bold font-sans">Subsection Title</h3>

// Card or component headings
<h4 className="text-xl font-bold font-sans">Component Title</h4>
```

## Body Text

```jsx
// Primary body text
<p className="text-lg font-normal font-serif text-black/80">Primary body text</p>

// Secondary/smaller body text
<p className="text-base font-normal font-serif text-black/80">Secondary body text</p>

// Small text (captions, notes, etc.)
<span className="text-sm font-normal font-serif text-black/70">Small text</span>
```

## Navigation & UI Elements

```jsx
// Navigation items
<span className="font-sans text-base font-bold">Nav Item</span>

// Button text
<span className="font-sans text-base font-bold">Button Text</span>

// Small UI elements
<span className="text-sm font-medium font-sans">UI Element</span>
```

## Font Sizes Reference

| Tailwind Class | Font Size | Use Case |
|----------------|-----------|----------|
| `text-sm`      | 14px      | Small text, captions, footnotes |
| `text-base`    | 16px      | Default text, navigation, buttons |
| `text-lg`      | 18px      | Primary body text |
| `text-xl`      | 20px      | Component headings, important text |
| `text-2xl`     | 24px      | Subsection headings, card titles |
| `text-3xl`     | 30px      | Section headings |
| `text-4xl`     | 36px      | Page headings (mobile) |
| `text-5xl`     | 48px      | Page headings (desktop) |

## Font Weights

| Tailwind Class | Weight | Use Case |
|----------------|--------|----------|
| `font-normal`  | 400    | Body text, paragraphs |
| `font-medium`  | 500    | Slightly emphasized text |
| `font-semibold`| 600    | Medium emphasis, subheadings |
| `font-bold`    | 700    | Headings, navigation, buttons |

## Text Colors

```jsx
// Default text (80% black)
<p className="text-black/80">Default text</p>

// Secondary text (70% black)
<p className="text-black/70">Secondary text</p>

// Subtle text (60% black)
<p className="text-black/60">Subtle text</p>

// Blue accent text
<p className="text-blue-600">Accent text</p>
```

## Responsive Typography

- Use responsive classes (`md:`, `lg:`, etc.) to adjust font sizes for different screen sizes
- For major headings, use larger text on desktop and smaller on mobile
  ```jsx
  <h1 className="text-4xl md:text-5xl">Responsive heading</h1>
  ```

## Letter Spacing & Tracking

Most text elements use slight negative tracking for a tighter, more polished look:
```jsx
<element className="tracking-[-0.019em]">Slightly tighter text</element>
```

## Line Height

- For most text: `leading-normal` (1.5)
- For headings with multiple lines: `leading-tight` (1.25)

## Examples of Complete Components

### Page Section Title
```jsx
<h2 className="text-4xl font-bold mb-4 font-sans">Section Title</h2>
<p className="text-lg font-serif text-black/80 mb-16">
  Section description that provides context.
</p>
```

### Card Component
```jsx
<div className="bg-white p-6 rounded-lg shadow-sm">
  <h3 className="text-2xl font-bold font-sans mb-4">Card Title</h3>
  <p className="text-base font-normal font-serif text-gray-600">
    Card description or content.
  </p>
</div>
``` 