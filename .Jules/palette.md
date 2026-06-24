## 2024-05-18 - Buttons with mixed content require dynamic ARIA labels
**Learning:** When adding `aria-label` to buttons with mixed content (e.g., icons + dynamic text like counts), the dynamic text must be incorporated into the `aria-label` and the visual text hidden with `aria-hidden="true"` to prevent screen readers from missing or double-reading the content.
**Action:** Use this pattern `aria-label="Like post. 5 likes"` on the button, and wrap the visual count in `aria-hidden="true"`.
