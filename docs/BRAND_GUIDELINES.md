# FlowSync Brand Guidelines

**Version 1.0** | November 2025

---

## Brand Identity

### Brand Name
**FlowSync**

### Tagline
**"Your rhythm. Your day. In sync."**

### Brand Essence
FlowSync helps people work smarter by aligning their tasks with their natural energy patterns. We embody calmness, confidence, and human-centered design.

---

## Voice & Tone

### Voice Traits
1. **Calm** - We never rush or pressure. We respect natural rhythms.
2. **Confident** - We're authoritative but not arrogant. We know what we're doing.
3. **Human-centered** - We speak to people, not users or metrics.

### Writing Guidelines

#### DO:
- Use short, clear, intentional sentences
- Focus on energy alignment, rhythm, and flow
- Maintain a warm, empathetic tone
- Speak directly: "You" not "Users"
- Be specific and actionable

#### DON'T:
- Use hype or urgency-based terms ("Act now!", "Limited time!")
- Overcomplicate explanations
- Use jargon or corporate speak
- Create artificial scarcity or FOMO
- Sound robotic or transactional

### Voice Examples

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Maximize your productivity NOW!" | "Work when you're at your best." |
| "Users can leverage our AI to optimize..." | "Our AI learns when you have the most energy." |
| "Don't miss out on this game-changing tool!" | "Find your natural rhythm." |
| "Increase output by 300%!" | "Do better work, not just more work." |
| "Our revolutionary platform..." | "A simple tool that works with you." |

---

## Color Palette

### Energy Gradient Palette

#### Primary Colors

**Electric Blue**
- Hex: `#2E7CFF`
- RGB: `rgb(46, 124, 255)`
- HSL: `hsl(217, 100%, 59%)`
- Usage: Primary actions, links, highlights
- Emotion: Energetic, focused, clear

**Purple Aura**
- Hex: `#A16CFF`
- RGB: `rgb(161, 108, 255)`
- HSL: `hsl(263, 100%, 71%)`
- Usage: Accents, special features, creativity
- Emotion: Creative, inspired, elevated

**Midnight Black**
- Hex: `#0B0F1A`
- RGB: `rgb(11, 15, 26)`
- HSL: `hsl(225, 45%, 7%)`
- Usage: Dark mode background, text
- Emotion: Calm, sophisticated, deep

**Light Glow**
- Hex: `#EAF2FF`
- RGB: `rgb(234, 242, 255)`
- HSL: `hsl(217, 100%, 97%)`
- Usage: Light backgrounds, subtle highlights
- Emotion: Clean, airy, peaceful

### Gradients

**Primary Gradient**
- Start: Electric Blue `#2E7CFF`
- End: Purple Aura `#A16CFF`
- Direction: 135deg (diagonal)
- Usage: Buttons, headers, accents, logo

```css
background: linear-gradient(135deg, #2E7CFF 0%, #A16CFF 100%);
```

### Color Usage Rules

1. **Ratio**: 60% neutral (Light Glow/Midnight Black), 30% Electric Blue, 10% Purple Aura
2. **Contrast**: Always ensure WCAG AA contrast (4.5:1 for text)
3. **Gradients**: Use sparingly for emphasis, not everywhere
4. **Accessibility**: Test colors in both light and dark modes

---

## Logo

### The Flow Loop

**Concept**: A smooth, circular, slightly asymmetric loop symbolizing:
- Energy cycles throughout the day
- Natural rhythm and flow
- Continuous improvement
- The connection between energy and productivity

**Style**:
- Soft, rounded edges (no sharp corners)
- Gradient from Electric Blue to Purple Aura
- Subtle glow effect (Light Glow)
- Smooth, organic shape (not perfectly circular)

**Animation**:
- Slow pulse loop (6-second duration)
- Gentle rotation and scale
- Easing: `ease-in-out`
- Opacity: 0.8 to 1.0

### Logo Variations

1. **Icon Only**: Flow Loop symbol
2. **Wordmark**: Flow Loop + "FlowSync" text
3. **Full Logo**: Flow Loop + "FlowSync" + tagline

### Logo Usage

#### Clear Space
- Maintain minimum clear space of logo height × 0.5 on all sides
- Never place logo on busy backgrounds
- Ensure sufficient contrast

#### Minimum Sizes
- Digital: 32px height (icon), 120px width (full logo)
- Print: 0.5 inches height (icon), 2 inches width (full logo)

#### Don'ts
- ❌ Don't change colors (except white for dark backgrounds)
- ❌ Don't rotate or skew
- ❌ Don't add effects (we have our own)
- ❌ Don't place on low-contrast backgrounds
- ❌ Don't stretch or compress

---

## Typography

### Font Families

**Primary**: Inter (from Google Fonts)
- Used for: Body text, UI elements
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Features: Enable ligatures (`rlig`, `calt`)

**Display**: Inter
- Used for: Headings, hero text
- Weights: 600 (Semibold), 700 (Bold), 800 (Extrabold)

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero H1 | 48px / 3rem | 800 | 1.1 |
| H1 | 36px / 2.25rem | 700 | 1.2 |
| H2 | 30px / 1.875rem | 700 | 1.3 |
| H3 | 24px / 1.5rem | 600 | 1.4 |
| H4 | 20px / 1.25rem | 600 | 1.4 |
| Body Large | 18px / 1.125rem | 400 | 1.6 |
| Body | 16px / 1rem | 400 | 1.6 |
| Body Small | 14px / 0.875rem | 400 | 1.5 |
| Caption | 12px / 0.75rem | 500 | 1.4 |

### Typography Rules

1. **Hierarchy**: Clear visual distinction between levels
2. **Readability**: Never below 14px for body text
3. **Line Length**: 60-75 characters per line optimal
4. **Spacing**: Use consistent vertical rhythm (multiples of 4px)

---

## UI Style

### Aesthetic Principles

1. **Minimal**: Remove everything unnecessary. Less is more.
2. **Elegant**: Refined details. Smooth transitions. Intentional spacing.
3. **Futuristic**: Modern gradients. Subtle glows. Clean geometry.
4. **Calming**: Soft shadows. Breathable layouts. No harsh contrasts.

### Component Patterns

#### Cards
```css
border-radius: 12px; /* 0.75rem */
box-shadow:
  0 2px 8px -2px hsla(217, 100%, 59%, 0.08),
  0 4px 16px -4px hsla(217, 100%, 59%, 0.06);
padding: 24px; /* 1.5rem */
background: white;
```

Features:
- Rounded corners (12px border radius)
- Soft shadows with brand color tint
- Generous padding for breathability
- Subtle hover states

#### Buttons

**Primary (Gradient)**
```css
background: linear-gradient(135deg, #2E7CFF 0%, #A16CFF 100%);
border-radius: 8px;
padding: 12px 24px;
color: white;
transition: all 0.3s ease;
```

Hover: Reverse gradient direction

**Secondary**
```css
background: hsl(217, 100%, 97%); /* Light Glow */
color: hsl(217, 100%, 59%); /* Electric Blue */
border: 1px solid hsl(217, 100%, 59%);
```

**Ghost**
```css
background: transparent;
color: hsl(217, 100%, 59%);
hover: background: hsl(217, 100%, 97%);
```

#### Input Fields
```css
border: 1px solid hsl(217, 50%, 90%);
border-radius: 8px;
padding: 12px 16px;
background: white;
focus: border-color: hsl(217, 100%, 59%);
focus: box-shadow: 0 0 0 3px hsla(217, 100%, 59%, 0.1);
```

### Animations

**Philosophy**: Smooth, subtle, meaningful

**Duration**:
- Micro-interactions: 200ms
- Transitions: 300ms
- Emphasis: 400-600ms
- Ambient: 4-8 seconds

**Easing**:
- Enter: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Exit: `cubic-bezier(0.4, 0, 1, 1)` (ease-in)
- Emphasis: `cubic-bezier(0.4, 0, 0.6, 1)` (ease-in-out)

**Examples**:
- Gradient pulse: 8 seconds, ease infinite
- Flow loop: 6 seconds, ease-in-out infinite
- Card hover: 300ms, ease-out
- Button press: 200ms, ease-in

### Spacing System

Based on 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, icons |
| sm | 8px | Related elements |
| md | 16px | Default spacing |
| lg | 24px | Section padding |
| xl | 32px | Component margins |
| 2xl | 48px | Large sections |
| 3xl | 64px | Page sections |

### Shadows

**Soft Shadow** (default for cards)
```css
box-shadow:
  0 2px 8px -2px hsla(217, 100%, 59%, 0.08),
  0 4px 16px -4px hsla(217, 100%, 59%, 0.06);
```

**Large Shadow** (elevated cards)
```css
box-shadow:
  0 4px 16px -4px hsla(217, 100%, 59%, 0.1),
  0 8px 24px -8px hsla(217, 100%, 59%, 0.08);
```

**Glow** (emphasis)
```css
box-shadow: 0 0 20px hsla(217, 100%, 59%, 0.3);
```

---

## UI Components

### Energy Arcs
Visual representation of daily rhythm:
- Use gradient colors for different energy levels
- Smooth, curved paths (no straight lines)
- Subtle animation on interaction

### Flow Block Indicators
- Circular progress rings with gradient
- Pulse animation during active session
- Color intensity matches energy level

### Mood Input
- Large, friendly text area
- Subtle gradient border on focus
- Real-time energy indicator

---

## Layouts

### Breathable Layout Principles

1. **White Space**: Generous spacing between elements (minimum 16px)
2. **Hierarchy**: Clear visual levels using size, weight, and color
3. **Alignment**: Consistent grid system (12-column)
4. **Rhythm**: Vertical spacing in multiples of 8px

### Grid System
- 12-column responsive grid
- Gutters: 24px (desktop), 16px (tablet), 12px (mobile)
- Max width: 1400px (container)
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## Photography & Imagery

### Style
- **Mood**: Calm, focused, aspirational
- **Lighting**: Natural, soft, airy
- **Colors**: Desaturated, blue/purple tints
- **Subjects**: People in flow state, minimal environments
- **Composition**: Breathable, negative space

### Don'ts
- ❌ Overly saturated colors
- ❌ Busy, cluttered scenes
- ❌ Stock photo clichés
- ❌ Harsh lighting or contrasts

---

## Iconography

### Style
- **Design**: Rounded, friendly, geometric
- **Stroke**: 2px, rounded caps
- **Size**: 16px, 20px, 24px (multiples of 4)
- **Color**: Match text color or use brand colors
- **Library**: Lucide Icons (consistent style)

### Usage
- Accompany text for clarity
- Use consistent size within context
- Align with baseline of text
- Don't use as decoration only

---

## Accessibility

### Color Contrast
- Text: Minimum 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1
- Test in both light and dark modes

### Focus States
- Visible focus indicator (2px solid, Electric Blue)
- Never remove focus styles
- Enhanced focus for keyboard navigation

### Motion
- Respect `prefers-reduced-motion`
- Provide alternative without animation
- Keep animations subtle and purposeful

### Text
- Minimum 16px for body text
- Line height: 1.5-1.6 for readability
- Avoid text in images
- Use semantic HTML

---

## Application Examples

### Dashboard
- Clean, card-based layout
- Gradient accents on active elements
- Soft shadows for depth
- Generous white space
- Consistent spacing (8px grid)

### Energy Map
- Gradient heat map (low → high energy)
- Smooth color transitions
- Interactive with subtle hover states
- Clear labels and legend

### Flow Timer
- Large, circular progress indicator
- Gradient border following progress
- Pulse animation during active state
- Minimal controls, maximum focus

---

## Brand Applications

### Web
- Favicon: Flow Loop icon
- Social share images: Logo + tagline on Light Glow background
- Loading screens: Pulsing Flow Loop

### Email
- Header: Full logo + tagline
- Accent color: Electric Blue
- CTA buttons: Gradient primary style

### Social Media
- Profile images: Flow Loop icon on gradient background
- Cover images: Minimal, gradient, tagline
- Posts: Calm, focused imagery with brand colors

---

## Review & Approval

All brand applications should be reviewed for:
1. **Voice**: Does it sound calm, confident, human-centered?
2. **Visual**: Does it use the Energy Gradient palette correctly?
3. **Accessibility**: Does it meet WCAG AA standards?
4. **Consistency**: Does it align with existing materials?

---

## Resources

### Design Files
- Logo files: `/frontend/src/components/brand/FlowLoopLogo.tsx`
- Color variables: `/frontend/src/app/globals.css`
- Tailwind config: `/frontend/tailwind.config.js`

### Tools
- Color contrast checker: https://webaim.org/resources/contrastchecker/
- Gradient generator: https://cssgradient.io/
- Font testing: https://fonts.google.com/specimen/Inter

---

## Version History

- **v1.0** (November 2025): Initial brand guidelines

---

**Questions?** Contact the design team for clarification or exceptions.

**FlowSync** - Your rhythm. Your day. In sync.
