/**
 * Script inline do <head> (hash SHA-256 entra na CSP no postbuild). Marca a
 * abertura só na primeira visita da sessão e fora de reduced-motion; tecla ou
 * toque pulam (a camada sai em ~0,25 s); em 1,5 s o atributo some de qualquer
 * jeito. Sem "&", "<" ou ">" de propósito: o texto vai cru para dentro da tag.
 */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('gt-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;sessionStorage.setItem('gt-intro','1');d.setAttribute('data-intro','');var t,e=function(){clearTimeout(t);d.removeAttribute('data-intro');removeEventListener('keydown',s);removeEventListener('pointerdown',s)},s=function(){d.setAttribute('data-intro','skip');clearTimeout(t);t=setTimeout(e,260)};addEventListener('keydown',s,{once:true});addEventListener('pointerdown',s,{once:true});t=setTimeout(e,1500)}catch(x){}})()`
