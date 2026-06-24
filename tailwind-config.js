tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        djBg: '#030408',
        djCyan: '#00e5ff',
        djMagenta: '#ff00ea',
        djYellow: '#ffd600'
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'glow-pulse': 'glowPulse 4s infinite alternate ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        glowPulse: { 
          '0%': { opacity: '0.5', transform: 'scale(1)' }, 
          '100%': { opacity: '0.8', transform: 'scale(1.1)' } 
        },
        float: { 
          '0%, 100%': { transform: 'translateY(0) scale(1)' }, 
          '50%': { transform: 'translateY(-15px) scale(1.02)' } 
        },
        floatReverse: { 
          '0%, 100%': { transform: 'translateY(0) scale(1.02)' }, 
          '50%': { transform: 'translateY(15px) scale(1)' } 
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  }
};
