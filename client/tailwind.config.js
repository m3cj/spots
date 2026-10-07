/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // hover: utilities only apply on devices with real hover (DESIGN-SYSTEM §9).
  future: { hoverOnlyWhenSupported: true },
  theme: {
    // Phones are the default; only md and lg scale up (DESIGN-SYSTEM §5.1).
    screens: { md: '768px', lg: '1024px' },
    // Closed palette so stock slate/gray/blue can't sneak in (DESIGN-SYSTEM §11).
    // Every token resolves through a CSS variable defined in index.css, so one class themes both modes.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      mithila: {
        bg: 'var(--bg-canvas)',
        canvas: 'var(--bg-canvas)',
        card: 'var(--surface-card)',
        pill: 'var(--surface-pill)',
        border: 'var(--border-subtle)',
        primary: 'var(--primary-kumkum)',
        primaryHover: 'var(--primary-kumkum-hover)',
        primaryActive: 'var(--primary-kumkum-active)',
        secondary: 'var(--secondary-amber)',
        text: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        muted: 'var(--text-tertiary)',
        scrim: 'var(--overlay-scrim)',
        onPrimary: 'var(--text-on-primary)',
      },
      state: {
        success: 'var(--state-success)',
        danger: 'var(--state-danger)',
        warning: 'var(--state-warning)',
      },
      medal: {
        gold: 'var(--medal-gold)',
        silver: 'var(--medal-silver)',
        bronze: 'var(--medal-bronze)',
      },
    },
    extend: {
      borderColor: { DEFAULT: 'var(--border-subtle)' },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        handwritten: ['Kalam', 'cursive'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        heritage: ['"Rozha One"', '"Playfair Display"', 'serif'],
      },
      // Type scale roles (DESIGN-SYSTEM §3.1). Phone/desktop sizes swap via --fs-* in index.css.
      fontSize: {
        display: ['var(--fs-display)', { lineHeight: '1.15', letterSpacing: '0', fontWeight: '700' }],
        'spot-name': ['var(--fs-spot-name)', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],
        section: ['var(--fs-section)', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        meta: ['12px', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],
        body: ['var(--fs-body)', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.45', letterSpacing: '0.01em', fontWeight: '400' }],
        tag: ['11px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '500' }],
        button: ['13px', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '600' }],
        editorial: ['var(--fs-editorial)', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '500' }],
        ceremonial: ['12px', { lineHeight: '1', letterSpacing: '0.04em', fontWeight: '400' }],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        nav: 'var(--shadow-nav)',
        'glow-red': 'var(--shadow-glow-red)',
      },
      zIndex: {
        card: 'var(--z-card)',
        sticky: 'var(--z-sticky)',
        nav: 'var(--z-nav)',
        fab: 'var(--z-fab)',
        scrim: 'var(--z-scrim)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
      // Layout metrics (DESIGN-SYSTEM §5.2–5.4): px-edge, pb-nav-total, w-sidebar, pb-safe.
      spacing: {
        edge: 'var(--edge-inset)',
        sidebar: 'var(--sidebar-w)',
        nav: 'var(--bottom-nav-h)',
        'nav-total': 'var(--bottom-nav-total)',
        safe: 'env(safe-area-inset-bottom, 0px)',
      },
      maxWidth: { content: 'var(--content-max)' },
      // Motion presets (DESIGN-SYSTEM §7.1) for CSS-driven transitions.
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.23, 1, 0.32, 1)',
        press: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: { settle: '220ms' },
    },
  },
  plugins: [],
};
