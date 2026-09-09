Read `00-product-map.md` before starting.
Also read `01-architecture-and-shared-contracts.md`.

Install the visual design foundation, color tokens, typography, and custom UI primitives for the Solaxis Web Console in `packages/app`. Leave route layouts and feature-specific components to units 06-09.

## Implementation

1. Configure Tailwind CSS in `packages/app` with CSS custom properties supporting a default-dark, high-contrast engineering aesthetic.
   - Configure Tailwind content paths to include `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`, and `lib/**/*.{ts,tsx}`.
   - Add `lucide-react` for icon primitives.
   - Define custom color tokens mapped to CSS variables: Deep Obsidian backgrounds, Dark Graphite panel cards, Solar Amber primary accents, Neon Emerald compute status, Cyber Crimson error states, and Muted Slate secondary text.
   - Configure typography using modern sans-serif fonts for interface text and monospace fonts (such as JetBrains Mono or Fira Code) for numbers, transaction hashes, timestamps, and log lines.
2. Create `packages/app/app/globals.css` defining the semantic CSS custom properties in HSL.
   - Define `--background` as `224 25% 4%` (ultra-dark obsidian).
   - Define `--foreground` as `210 20% 98%` (near-white crisp text).
   - Define `--card` as `224 22% 8%` and `--card-border` as `224 16% 16%`.
   - Define `--primary` as `38 96% 53%` (solar amber) with high-contrast text contrast.
   - Define `--success` as `152 76% 50%` (neon emerald) for active rollup compute and completed states.
   - Define `--destructive` as `0 84% 60%` (cyber crimson) for failures and validation alerts.
   - Define `--muted` as `224 14% 14%` and `--muted-foreground` as `220 12% 65%`.
   - Define glow utilities and glassmorphic surface styles with backdrop blur and subtle 1px borders.
3. Create `packages/app/lib/utils.ts` exporting the standard `cn()` utility combining `clsx` and `tailwind-merge`.
   - Enforce using `cn()` in all product primitives to prevent class conflicts.
4. Create custom UI primitives from scratch in `packages/app/components/ui/` using Tailwind utility classes and CSS variables without third-party component wrappers:
   - Create `button.tsx` supporting variants: `default` (solar amber fill with dark text and subtle glow), `secondary` (dark slate outline with hover highlight), `ghost`, `destructive`, and sizes: `sm`, `default`, `lg`, `icon`.
   - Create `card.tsx` supporting `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` with dark graphite surface and glass border.
   - Create `input.tsx` and `slider.tsx` with high-contrast focus rings, dark backgrounds, and monospace numeral formatting.
   - Create `badge.tsx` supporting status variants: `default`, `secondary`, `success` (neon emerald outline with subtle glow), `warning` (solar amber), and `destructive`.
   - Create `skeleton.tsx` with smooth pulse animation matching dark card surfaces.
   - Create `sheet.tsx` for slide-out detail inspection panels with dark backdrop overlay.
   - Create `tooltip.tsx` with accessible hover explanations and compact styling.
5. Create Solaxis-specific telemetry and indicator primitives in `packages/app/components/solaxis/`:
   - Create `status-badge.tsx` mapping the six `TaskStatus` states to human-readable labels, distinct icon shapes (circle, spinner, checkmark, triangle alert), and semantic badge styles.
   - Create `pulse-indicator.tsx` rendering an animated radar pulse dot for active Ephemeral Rollup execution states.
   - Create `latency-counter.tsx` displaying millisecond durations with tabular numerals, color transitions based on threshold (<10ms emerald, <100ms amber, >500ms crimson), and millisecond suffix.
6. Create `packages/app/components/solaxis/console-state.tsx` providing shared state treatments for empty, loading, error, and disconnected wallet scenarios.
   - Implement layout-matched skeletons rather than centered spinners for data-dense cards.
   - Provide actionable recovery messages and buttons for disconnected or low-balance wallet states.

## Scope Limits

- Do not implement route layouts, navigation headers, or wallet connection logic in this unit (reserved for Unit 06).
- Do not build the 4-stage visualizer, terminal, or benchmark cards in this unit (reserved for Units 07, 08, 09).
- Do not import third-party component libraries; all primitives must be custom-built with Tailwind CSS and CSS variables.
- Do not encode on-chain transaction submission logic inside UI primitives.

## Notes

- Keep all color tokens semantic so theme adjustments never require editing component markup.
- Ensure high contrast ratios across all text and border elements to satisfy accessibility guidelines.
- Use tabular numerals (`font-mono tabular-nums`) for all numeric counters, timers, and balances.
- Depends on: 00, 01. Required before: 06, 07, 08, 09.

## Check When Done

- Tailwind configuration is active in `packages/app` with all semantic color tokens and font definitions.
- Custom primitives in `packages/app/components/ui/` render dark aesthetics without white flashes or style glitches.
- `status-badge.tsx` visually distinguishes all six task states with distinct shapes and colors.
- `cn()` utility resolves conflicting Tailwind classes predictably.
- Running `pnpm --filter app build` passes typecheck and compilation.
