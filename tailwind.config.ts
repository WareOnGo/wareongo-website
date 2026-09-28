
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: { DEFAULT: '20px', md: '32px' },
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			colors: {
				ui: {
					ink: 'rgb(var(--ui-ink-rgb) / <alpha-value>)',
					accent: 'rgb(var(--ui-accent-rgb) / <alpha-value>)',
					paper: 'rgb(var(--ui-paper-rgb) / <alpha-value>)',
					surface: 'rgb(var(--ui-surface-rgb) / <alpha-value>)',
					muted: 'rgb(var(--ui-muted-rgb) / <alpha-value>)',
					tint: 'rgb(var(--ui-tint-rgb) / <alpha-value>)',
					line: 'rgb(var(--ui-line-rgb) / <alpha-value>)',
					outline: 'rgb(var(--ui-outline-rgb) / <alpha-value>)',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom WareOnGo Colors
				wareongo: {
					blue: 'rgb(var(--ui-ink-rgb) / <alpha-value>)',
					green: '#3D5A4A',
					sienna: '#B3502D',
					purple: '#4A2E50',
					ivory: 'rgb(var(--ui-paper-rgb) / <alpha-value>)',
					// 7.49:1 on ivory and 8.09:1 on white. Keep readable text
					// opaque and keep the CMS palette in globals.css in sync.
					slate: 'rgb(var(--ui-muted-rgb) / <alpha-value>)',
					charcoal: '#343A40',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'var(--ui-control-radius)',
				sm: 'var(--ui-tag-radius)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'marquee': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'marquee': 'marquee 30s linear infinite'
			}
		}
	},
	plugins: [animate],
} satisfies Config;
