import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			display: [
  				'Montserrat',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			sans: [
  				'Inter',
  				'Montserrat',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Helvetica Neue',
  				'Arial',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'monospace'
  			]
  		},
  		colors: {
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
  			// ATP Tour Custom Colors
  			atp: {
  				navy: 'hsl(var(--atp-navy))',
  				'navy-dark': 'hsl(var(--atp-navy-dark))',
  				cyan: 'hsl(var(--atp-cyan))',
  				'cyan-light': 'hsl(var(--atp-cyan-light))',
  				'cyan-dark': 'hsl(var(--atp-cyan-dark))',
  				white: 'hsl(var(--atp-white))',
  				gray: 'hsl(var(--atp-gray))',
  				'gray-light': 'hsl(var(--atp-gray-light))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'slide-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'position-up': {
  				'0%': {
  					transform: 'translateY(0)',
  					backgroundColor: 'transparent'
  				},
  				'25%': {
  					transform: 'translateY(-4px)',
  					backgroundColor: 'hsl(142 76% 36% / 0.15)'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					backgroundColor: 'hsl(142 76% 36% / 0.08)'
  				}
  			},
  			'position-down': {
  				'0%': {
  					transform: 'translateY(0)',
  					backgroundColor: 'transparent'
  				},
  				'25%': {
  					transform: 'translateY(4px)',
  					backgroundColor: 'hsl(0 84% 60% / 0.15)'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					backgroundColor: 'hsl(0 84% 60% / 0.08)'
  				}
  			},
  			'highlight-pulse': {
  				'0%, 100%': {
  					boxShadow: 'inset 0 0 0 0 transparent'
  				},
  				'50%': {
  					boxShadow: 'inset 0 0 0 2px hsl(var(--primary) / 0.3)'
  				}
  			},
  			'number-pop': {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.2)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			'speed-line': {
  				'0%': {
  					transform: 'translateX(-100%) skewX(-15deg)',
  					opacity: '0'
  				},
  				'50%': {
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateX(100%) skewX(-15deg)',
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'slide-up': 'slide-up 0.4s ease-out',
  			'slide-down': 'slide-down 0.4s ease-out',
  			'position-up': 'position-up 0.6s ease-out forwards',
  			'position-down': 'position-down 0.6s ease-out forwards',
  			'highlight-pulse': 'highlight-pulse 1.5s ease-in-out',
  			'number-pop': 'number-pop 0.3s ease-out',
  			'speed-line': 'speed-line 2s ease-in-out infinite'
  		},
  		backgroundImage: {
  			'gradient-atp': 'linear-gradient(180deg, hsl(216 100% 8%) 0%, hsl(216 100% 5%) 100%)',
  			'gradient-cyan': 'linear-gradient(135deg, hsl(var(--atp-cyan)) 0%, hsl(var(--atp-cyan-light)) 100%)',
  			'gradient-elegant': 'linear-gradient(135deg, hsl(216 80% 14%) 0%, hsl(216 80% 10%) 100%)',
  			'gradient-glass': 'linear-gradient(135deg, hsl(216 80% 14% / 0.9) 0%, hsl(216 80% 10% / 0.85) 100%)',
  			'gradient-radial-glow': 'radial-gradient(ellipse at center, hsl(197 100% 47% / 0.15) 0%, transparent 70%)',
  			'gradient-diagonal': 'linear-gradient(-45deg, hsl(197 100% 47% / 0.1) 0%, transparent 50%)'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			'cyan': '0 0 30px -5px hsl(197 100% 47% / 0.3)',
  			'glow': '0 0 60px -15px hsl(197 100% 47% / 0.4)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;