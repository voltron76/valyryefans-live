## 2026-07-03 - ARIA labels on dynamic content
**Learning:** Carousel and story viewer navigation buttons were missing ARIA labels, creating accessibility gaps for screen readers navigating interactive gallery components.
**Action:** Added explicit 'aria-label' attributes ('Previous slide', 'Next slide', 'Previous story', 'Next story') to ensure icon-only navigation buttons are announced correctly by assistive technologies.
