## 2026-06-24 - [ARIA Labels for Mixed Content Buttons]
**Learning:** Screen readers handle mixed content buttons (icon + dynamic text like counts) poorly without explicit guidance. They may miss the dynamic text or read the content redundantly.
**Action:** When adding `aria-label` to buttons with mixed content, always incorporate the dynamic text into the `aria-label` string (e.g., "Like post, 10 likes") and hide the visual text spans with `aria-hidden="true"`.
