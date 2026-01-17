/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'menu-base': '#4b1b63ef',
                'menu-item': '#330941ff',
                'neon-green': '#39ff14',
                'neon-pink': '#d900d9',
                'neon-cyan': '#00e5ff',
                'neon-purple': '#b878ccff',
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                monoton: ['Monoton', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
