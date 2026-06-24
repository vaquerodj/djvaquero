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
        'glow-pulse': 'glowPulse 3s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: { 
          '0%': { boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)' }, 
          '100%': { boxShadow: '0 0 25px rgba(0, 229, 255, 0.6)' } 
        },
        float: { 
          '0%, 100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-10px)' } 
        }
      }
    }
  }
};
