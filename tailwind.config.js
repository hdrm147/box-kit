/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'bk-',
    content: [
        './resources/js/**/*.vue',
        './resources/js/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                'bk-primary': '#22c55e',
                'bk-secondary': '#0ea5e9',
                'bk-dark': '#0f172a',
                'bk-darker': '#020617',
                'bk-card': '#1e293b',
                'bk-border': '#334155',
                'bk-text': '#f1f5f9',
                'bk-muted': '#94a3b8',
            }
        },
    },
    plugins: [],
}
