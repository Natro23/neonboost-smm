/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#00BFFF',
					foreground: '#ffffff',
					50: '#e6f9ff',
					100: '#ccf3ff',
					200: '#99e7ff',
					300: '#66dbff',
					400: '#33cfff',
					500: '#00BFFF',
					600: '#0099cc',
					700: '#007399',
					800: '#004d66',
					900: '#002633',
				},
				accent: {
					DEFAULT: '#32CD32',
					foreground: '#ffffff',
					50: '#e6ffe6',
					100: '#ccffcc',
					200: '#99ff99',
					300: '#66ff66',
					400: '#33ff33',
					500: '#32CD32',
					600: '#28a428',
					700: '#1e7b1e',
					800: '#145214',
					900: '#0a290a',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				neon: {
					blue: '#00BFFF',
					green: '#32CD32',
					dark: '#0a0a0f',
					darker: '#050508',
				},
			},
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
				montserrat: ['Montserrat', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-blue-green': 'linear-gradient(135deg, #00BFFF 0%, #32CD32 100%)',
				'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
			},
			boxShadow: {
				'neon-blue': '0 0 15px rgba(0, 191, 255, 0.5)',
				'neon-green': '0 0 15px rgba(50, 205, 50, 0.5)',
				'neon-blue-lg': '0 0 30px rgba(0, 191, 255, 0.7)',
				'neon-green-lg': '0 0 30px rgba(50, 205, 50, 0.7)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 15px rgba(0, 191, 255, 0.5)' },
					'50%': { boxShadow: '0 0 30px rgba(0, 191, 255, 0.8)' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-up': 'slide-up 0.5s ease-out forwards',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
