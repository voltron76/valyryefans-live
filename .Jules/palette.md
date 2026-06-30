## 2024-07-01 - [ARIA Labels for Mixed Content Buttons]
**Learning:** [When adding 'aria-label' to buttons with mixed content (e.g., icons + dynamic text like counts), the dynamic text must be incorporated into the 'aria-label' and the visual text hidden with 'aria-hidden="true"' to prevent screen readers from missing or double-reading the content.]
**Action:** [Always wrap internal contents with an aria-hidden span and update both the aria-label and the span content when dynamic data changes.]
