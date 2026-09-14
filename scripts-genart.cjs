const { chromium } = require('playwright');

// Gera capas abstratas generativas (dark: trilho de trabalhos / light: manifesto)
// usando canvas 2D com seed determinística por slug.

const ART = `
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function makeNoise(rand){
  const g=[];for(let i=0;i<256;i++)g.push(rand());
  const p=[];for(let i=0;i<512;i++)p[i]=Math.floor(rand()*256);
  function n(x,y){
    const X=Math.floor(x)&255,Y=Math.floor(y)&255;
    x-=Math.floor(x);y-=Math.floor(y);
    const u=x*x*(3-2*x),v=y*y*(3-2*y);
    const a=g[p[p[X]+Y]],b=g[p[p[X+1]+Y]],c=g[p[p[X]+Y+1]],d=g[p[p[X+1]+Y+1]];
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
  }
  return n;
}
function fbm(n,x,y){let v=0,a=0.5,f=1;for(let i=0;i<4;i++){v+=a*n(x*f,y*f);a*=0.5;f*=2}return v}

function paint(canvas, opts){
  const {w,h,seed,dark}=opts;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  const rand=mulberry32(seed);
  const noise=makeNoise(rand);
  const ACC='#8f97dd', INK='#0c0c10', PAPER='#f5f4f1';

  ctx.fillStyle=dark?INK:PAPER;
  ctx.fillRect(0,0,w,h);

  // glows grandes
  ctx.globalCompositeOperation=dark?'screen':'multiply';
  const glows=3+Math.floor(rand()*2);
  for(let i=0;i<glows;i++){
    const gx=w*(0.15+rand()*0.7), gy=h*(0.15+rand()*0.7), r=Math.max(w,h)*(0.22+rand()*0.3);
    const g=ctx.createRadialGradient(gx,gy,0,gx,gy,r);
    const c=dark
      ? (rand()>0.4?ACC:'#3d4270')
      : (rand()>0.5?ACC:'#b9bde8');
    g.addColorStop(0, c+(dark?'59':'55'));
    g.addColorStop(1, c+'00');
    ctx.fillStyle=g;
    ctx.fillRect(0,0,w,h);
  }

  // linhas de fluxo (flow field)
  ctx.globalCompositeOperation=dark?'screen':'source-over';
  const lines=dark?140:70;
  for(let i=0;i<lines;i++){
    let x=rand()*w, y=rand()*h;
    const steps=120+Math.floor(rand()*160);
    const alpha=(dark?0.10:0.10)+rand()*(dark?0.20:0.14);
    ctx.strokeStyle=(rand()>0.25?ACC:(dark?'#e8e9f7':'#111111'))+Math.round(alpha*255).toString(16).padStart(2,'0');
    ctx.lineWidth=0.6+rand()*1.4;
    ctx.beginPath();ctx.moveTo(x,y);
    const sc=0.0016+rand()*0.0012, off=rand()*100;
    for(let s=0;s<steps;s++){
      const a=fbm(noise,x*sc+off,y*sc)*Math.PI*4;
      x+=Math.cos(a)*2.2;y+=Math.sin(a)*2.2;
      ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  // grão
  ctx.globalCompositeOperation='source-over';
  const gr=document.createElement('canvas');gr.width=128;gr.height=128;
  const gc=gr.getContext('2d');
  const id=gc.createImageData(128,128);
  for(let i=0;i<id.data.length;i+=4){const v=Math.floor(rand()*255);id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=dark?16:10;}
  gc.putImageData(id,0,0);
  ctx.fillStyle=ctx.createPattern(gr,'repeat');
  ctx.fillRect(0,0,w,h);

  // vinheta
  const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.75);
  vg.addColorStop(0,'rgba(0,0,0,0)');
  vg.addColorStop(1,dark?'rgba(0,0,0,0.45)':'rgba(17,17,17,0.12)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
}
`;

const TARGETS = [
  { file: 'public/images/manifesto/campo.png',    seed: 83, dark: false, w: 1040, h: 650 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const t of TARGETS) {
    await page.setViewportSize({ width: t.w, height: t.h });
    await page.setContent(`<canvas id="c" style="display:block"></canvas><script>${ART}
      paint(document.getElementById('c'), {w:${t.w},h:${t.h},seed:${t.seed},dark:${t.dark}});
    </script>`);
    await page.waitForTimeout(300);
    await page.locator('#c').screenshot({ path: t.file });
    console.log('ok', t.file);
  }
  await browser.close();
})();
