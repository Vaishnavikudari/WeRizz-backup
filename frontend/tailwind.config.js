/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                seasons: ['"The Seasons"', '"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
                sans: ['"Montserrat"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                cursive: ['"The Seasons"', '"Cormorant Garamond"', 'Georgia', 'serif'],
                editorial: ['"The Seasons"', '"Cormorant Garamond"', '"Playfair Display"', 'serif'],
                serif: ['"The Seasons"', '"Cormorant Garamond"', '"Playfair Display"', 'serif'],
            },
            letterSpacing: {
                'delicious': '0.18em',
                'luxury': '0.24em',
            }
        },
    },
    plugins: [],
}
