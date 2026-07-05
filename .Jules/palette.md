## 2024-05-18 - [Unified ARIA labels for dynamic badges]
**Learning:** When adding `aria-label` to buttons with mixed content (e.g., icons + dynamic text like notification counts), the dynamic text must be incorporated into the unified `aria-label` and the visual text (including badges) hidden with `aria-hidden="true"` to prevent screen readers from missing or double-reading the content.
**Action:** Always wrap visual notification counts and their accompanying icons/labels in `aria-hidden="true"` when providing a top-level comprehensive `aria-label`.
