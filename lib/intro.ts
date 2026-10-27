/**
 * Script inline do <head> (hash SHA-256 entra na CSP no postbuild).
 * 1) Restaura o modo tinta salvo na sessão antes da primeira pintura (sem
 *    piscar o papel claro a cada página).
 * 2) Marca a abertura só se o visitante não passou pelo site nos últimos
 *    30 min (localStorage, vale para abas novas também) e fora de
 *    reduced-motion; tecla ou toque pulam (a camada sai em ~0,25 s); em
 *    1,5 s o atributo some de qualquer jeito.
 * Sem "&", "<" ou ">" de propósito: o texto vai cru para dentro da tag.
 */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement,r=matchMedia('(prefers-reduced-motion: reduce)').matches,n=Date.now(),l=0;if(!r)if(sessionStorage.getItem('gt-tinta')==='1')d.setAttribute('data-tinta','on');try{l=+localStorage.getItem('gt-intro')||0;localStorage.setItem('gt-intro',String(n))}catch(x){}if(r||sessionStorage.getItem('gt-intro'))return;sessionStorage.setItem('gt-intro','1');if(Math.max(0,18e5-Math.abs(n-l)))return;d.setAttribute('data-intro','');var t,e=function(){clearTimeout(t);d.removeAttribute('data-intro');removeEventListener('keydown',s);removeEventListener('pointerdown',s)},s=function(){d.setAttribute('data-intro','skip');clearTimeout(t);t=setTimeout(e,260)};addEventListener('keydown',s,{once:true});addEventListener('pointerdown',s,{once:true});t=setTimeout(e,1500)}catch(x){}})()`
