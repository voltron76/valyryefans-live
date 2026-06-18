## 2024-06-18 - Added ARIA labels to icon-only close buttons
**Learning:** Found a widespread pattern across the application where "✕" (close) and SVG icon-only buttons lacked ARIA labels, rendering them opaque to screen readers.
**Action:** Always verify that buttons containing only icons or visual symbols include `aria-label` or `aria-labelledby` attributes to ensure functional accessibility for all interactions.
