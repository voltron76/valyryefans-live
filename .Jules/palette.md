## 2025-02-26 - [Dynamic ARIA labels for mixed content buttons]
**Learning:** When adding `aria-label` to buttons with mixed content (e.g., icons + dynamic text like counts), screen readers may double-read the content or miss the context. The dynamic text must be incorporated into the `aria-label` and the visual text hidden with `aria-hidden="true"`.
**Action:** Always incorporate dynamic text into the `aria-label` and hide visual text with `aria-hidden="true"`. Update both the `aria-label` and innerHTML (preserving `aria-hidden`) when states change dynamically.
