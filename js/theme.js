// ============================================================
// ValyryesFans — Theme Manager
// ============================================================

const STORAGE_KEY = 'vf-theme';

let currentTheme = localStorage.getItem(STORAGE_KEY) || 'dark';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  // Update meta theme-color for mobile browser chrome
  const mc = document.querySelector('meta[name="theme-color"]');
  if (mc) mc.setAttribute('content', theme === 'dark' ? '#09090f' : '#fdf5f8');
}

export function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  return next;
}

export function getTheme() {
  return currentTheme;
}

// Apply saved theme immediately on import
applyTheme(currentTheme);
