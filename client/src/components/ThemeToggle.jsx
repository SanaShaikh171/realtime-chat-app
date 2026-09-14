import { useTheme } from '../context/ThemeContext';
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {' '}
      {theme === 'light' ? '🌙' : '☀️'}{' '}
    </button>
  );
}
export default ThemeToggle;
