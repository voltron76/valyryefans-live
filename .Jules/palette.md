## 2026-07-02 - [Mixed Content Buttons]
**Learning:** Buttons with mixed content (e.g., icons + dynamic text like counts) cause screen readers to miss or double-read content if not handled carefully.
**Action:** When adding `aria-label` to buttons with mixed content, the dynamic text must be incorporated into the `aria-label` and the visual text hidden with `aria-hidden="true"`.