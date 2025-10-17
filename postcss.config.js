export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Add specific browser support to fix CSS compatibility errors
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'Chrome >= 54',
        'ChromeAndroid >= 54',
        'Firefox >= 60',
        'Safari >= 12',
        'Edge >= 79',
        'Samsung >= 6.0'
      ],
      // Add specific CSS properties that need prefixes
      grid: 'autoplace',
      flexbox: 'no-2009'
    },
  },
}
