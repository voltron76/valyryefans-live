## 2026-07-06 - [Dynamic Accessibility Labels]
**Learning:** For dynamic content like "Likes" or "Comments" where an icon and number are displayed together, adding an `aria-label` to the button and wrapping the visual contents in `aria-hidden="true"` correctly announces the total state without double-reading text/icons.
**Action:** When updating post action buttons, always update the JS rendering logic along with the static HTML to keep `aria-labels` and `aria-hidden` tags synchronized with the state (e.g. `aria-label="Unlike post, 5 likes"`).
