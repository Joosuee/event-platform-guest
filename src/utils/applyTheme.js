// event.theme_json puede traer, por ejemplo:
// { "primaryColor": "#2f4b3c", "accentColor": "#b08d57", "backgroundColor": "#f6f3ea" }
// Si no viene nada, se usan los tokens por defecto definidos en tokens.css.
export function applyEventTheme(themeJson) {
  if (!themeJson) return;

  let theme = themeJson;
  if (typeof themeJson === 'string') {
    try {
      theme = JSON.parse(themeJson);
    } catch {
      return;
    }
  }

  const root = document.documentElement;
  const map = {
    primaryColor: '--color-primary',
    primaryColorDark: '--color-primary-dark',
    accentColor: '--color-accent',
    accentColorSoft: '--color-accent-soft',
    backgroundColor: '--color-bg',
  };

  Object.entries(map).forEach(([key, cssVar]) => {
    if (theme[key]) root.style.setProperty(cssVar, theme[key]);
  });
}
