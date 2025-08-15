export const theme = {
  colors: {},
  animation: {
    keyframes: {
      enterFromRight: '0%{opacity:0;transform:translateX(200px);}100%{opacity:1;transform:translateX(0);}',
      enterFromLeft: '0%{opacity:0;transform:translateX(-200px);}100%{opacity:1;transform:translateX(0);}',
      exitToRight: '0%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(200px);}',
      exitToLeft: '0%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(-200px);}',
      scaleIn: '0%{opacity:0;transform:rotateX(-10deg) scale(0.9);}100%{opacity:1;transform:rotateX(0deg) scale(1);}',
      scaleOut: '0%{opacity:1;transform:rotateX(0deg) scale(1);}100%{opacity:0;transform:rotateX(-10deg) scale(0.95);}',
      fadeIn: '0%{opacity:0;}100%{opacity:1;}',
      fadeOut: '0%{opacity:1;}100%{opacity:0;}',
    },
    animation: {
      scaleIn: 'scaleIn 200ms ease',
      scaleOut: 'scaleOut 200ms ease',
      fadeIn: 'fadeIn 200ms ease',
      fadeOut: 'fadeOut 200ms ease',
      enterFromLeft: 'enterFromLeft 250ms ease',
      enterFromRight: 'enterFromRight 250ms ease',
      exitToLeft: 'exitToLeft 250ms ease',
      exitToRight: 'exitToRight 250ms ease',
    },
  },
  duration: {},
  timingFns: {},
  properties: {},
  counts: {},
}
