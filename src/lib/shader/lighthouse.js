/*!
 * Lighthouse: a 1-bit, pixelated WebGL2 shader (540 x 960 art pixels). MIT licence.
 *
 * Plain script, no dependencies. Exposes window.Lighthouse (and module.exports under CommonJS).
 *
 *   <canvas id="c" width="540" height="960"></canvas>
 *   <script src="lighthouse.js"></script>
 *   <script>
 *     const lh = Lighthouse.mount(document.getElementById('c'), {
 *       settings: { pattern: 'stripes', speed: 4 },   // any key of Lighthouse.DEFAULTS
 *       fit: 'parent'                                  // 'parent' (default), 'window' or false
 *     });
 *     // live control: lh.S.intensity = 0.6; lh.dirty = true;
 *     //               lh.playing = false;  lh.angle = 120;  lh.stop();  lh.destroy();
 *   </script>
 *
 * Settings: speed, angle, width, intensity, pattern (dots | stripes | noise | diamond),
 * beamOn, wavesOn, ripples, birds, waveSpeed, waveScale, waveDots, dark, light,
 * beamTint, beamColor. Colours are '#rrggbb'. After changing lh.S by hand, set lh.dirty = true
 * so a paused scene redraws.
 *
 * Needs WebGL2: mount() throws an Error if it is not available.
 */
const Lighthouse = (function () {
  "use strict";
  const MAP =
    "data:image/png;base64,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";

  const VS = `#version 300 es
  void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;

  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uRes,uLamp,uOff;
  uniform float uT,uClk,uAng,uW,uI,uCell,uDots,uW0,uK;
  uniform int uPat,uBeamOn,uWaves,uTint,uRip,uBirds;
  uniform vec3 uDark,uLight,uBeam;
  out vec4 oc;

  float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
  vec2 h22(vec2 p){return vec2(h21(p),h21(p+17.3));}

  /* ocean: slowly drifting, horizontally-stretched cell outlines drawn as dotted 1px lines,
     brighter stipple clusters where three cells meet */
  float wave(vec2 p){
    float S=60.*uCell, R=2.5;             // cell ≈ 60 x 24 art px (stretched metric)
    float T=uT;
    vec2 q=vec2(p.x,p.y*R)/S;
    q+=vec2(.06*sin(q.y*5.3+T*.21+q.x*1.7),.07*cos(q.x*4.1+T*.17+q.y*2.3));
    vec2 ic=floor(q),f=fract(q);
    float F1=1e3,F2=1e3,F3=1e3;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
      vec2 g=vec2(float(i),float(j)),c=ic+g,r=h22(c);
      vec2 pt=g+.5+vec2(.5*mod(c.y,2.)-.25,0.)+.40*sin(T*(.20+.14*r.x)+6.2831*r+vec2(0.,1.5708));
      float d=length((pt-f)*S);
      if(d<F1){F3=F2;F2=F1;F1=d;}else if(d<F2){F3=F2;F2=d;}else if(d<F3)F3=d;
    }
    float e=F2-F1;
    ivec2 ip=ivec2(floor(p));
    float chk=float((ip.x+ip.y)&1);
    float line=(e<2.0*uDots&&(chk<.5||h21(p)<.08))?1.:0.;
    float junc=(F3-F1<13.*uDots&&e<6.*uDots&&h21(p+7.7)<.45)?1.:0.;
    return max(line,junc);
  }

  /* expanding elliptical ripples around the three rocks */
  float ripples(vec2 p){
    vec3 R[3]=vec3[3](vec3(138.,479.,18.5),vec3(202.5,477.,20.5),vec3(201.5,671.,18.5));
    float o=0.;
    for(int k=0;k<3;k++){
      for(int w=0;w<2;w++){
        float ph=fract(uClk/1.8+float(w)*.5+float(k)*.31);
        float rx=R[k].z+4.+13.*ph, ry=rx/2.75;
        vec2 d=p-R[k].xy;
        float q=sqrt(d.x*d.x/(rx*rx)+d.y*d.y/(ry*ry));
        float g=sqrt(d.x*d.x/(rx*rx*rx*rx)+d.y*d.y/(ry*ry*ry*ry))/max(q,1e-3);
        float dist=abs(q-1.)/max(g,1e-4);
        if(dist<.5&&h21(floor(p)+float(w)*3.1)<1.05-.8*ph)o=1.;
      }
    }
    return o;
  }

  /* a few seagulls drifting over the open water, wings flapping */
  float birds(vec2 p){
    const float WY[4]=float[4](-2.,0.,2.,0.);
    float o=0.;
    for(int b=0;b<6;b++){
      float fb=float(b),ph=fb*1.7;
      vec2 c=vec2(282.+46.*sin(uClk*.11+ph)+14.*sin(uClk*.23+fb),
                  398.+34.*sin(uClk*.09+ph*1.3)+10.*cos(uClk*.21+fb*2.));
      ivec2 l=ivec2(floor(p))-ivec2(floor(c));
      int fr=int(mod(uClk*5.5+fb*1.3,4.));
      int ax=abs(l.x);
      if(ax<=5){
        int wy=int(floor(-WY[fr]*float(ax)/3.+.5));
        if(l.y==wy||(ax<=4&&l.y==wy+1)||(ax<=1&&(l.y==wy+2||l.y==wy-1)))o=1.;
      }
    }
    return o;
  }

  /* beam dither, evaluated on 2x2-art-pixel cells that are fixed to the screen grid */
  const int RK[16]=int[16](8,0,10,1, 4,12,6,15, 11,2,9,3, 7,14,5,13);   // dots: order cells switch on
  const float STR[4]=float[4](.125,.625,.875,.375);
  float pat(ivec2 pp,float I){
    int cx=pp.x&3,cy=pp.y&3;
    if(uPat==0)return float(RK[cy*4+cx])<I*16.-1e-4?1.:0.;
    if(uPat==1)return STR[(pp.x+pp.y)&3]<I?1.:0.;
    if(uPat==2)return h21(vec2(pp)+.5)<I?1.:0.;
    int dx=abs(cx-1);dx=min(dx,4-dx);int dy=abs(cy-2);dy=min(dy,4-dy);
    int d=dx+dy;float th=d==0?.06:(d==1?.20:(d==2?.45:(d==3?.70:.95)));
    return th<I?1.:0.;
  }

  void main(){
    vec2 pf=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)+uOff;
    ivec2 ip=ivec2(floor(pf));
    vec4 t=texelFetch(uTex,ip,0);
    float bit=t.r>.5?1.:0.;
    bool zone=(t.g>.5||t.b>.5)&&t.r<.5;
    if(uWaves==1&&t.g>.5)bit=max(bit,wave(pf));
    if(uRip==1&&zone)bit=max(bit,ripples(pf));
    if(uBirds==1&&t.g>.5)bit=max(bit,birds(pf));
    float hit=0.;
    if(uBeamOn==1){
      vec2 d=pf-uLamp,u=vec2(cos(uAng),sin(uAng));
      float al=abs(dot(d,u)),pe=abs(d.x*u.y-d.y*u.x);
      float lit=(al>6.&&pe<(uW0+al*uK)*uW)?1.:0.;
      hit=lit*pat(ip>>1,uI);
    }
    float out1=max(bit,hit);
    vec3 c=mix(uDark,uLight,out1);
    if(uTint==1&&hit>.5)c=uBeam;
    oc=vec4(c,1.);
  }`;

  const DEFAULTS = {
    speed: 2.25,
    angle: 232.5,
    width: 1,
    intensity: 0.42,
    pattern: "dots",
    beamOn: true,
    wavesOn: true,
    ripples: true,
    birds: true,
    waveSpeed: 1.8,
    waveScale: 1,
    waveDots: 0.55,
    dark: "#000000",
    light: "#ffffff",
    beamTint: false,
    beamColor: "#ffd9a0",
  };

  const PALS = {
    "black / white": ["#000000", "#ffffff"],
    paper: ["#1b1a17", "#f1ead6"],
    gameboy: ["#0f380f", "#9bbc0f"],
    "ink blue": ["#0b1020", "#e8f1ff"],
    amber: ["#120a00", "#ffb000"],
  };

  /* ---- sizing: whole device pixels when the space allows, a clean half-scale otherwise ---- */
  function fitCanvas(cv, availW, availH) {
    const W = 540,
      H = 960,
      d = window.devicePixelRatio || 1;
    const f = Math.min((availW * d) / W, (availH * d) / H);
    let n =
      f >= 1 ? Math.min(6, Math.floor(f)) : f >= 0.7 ? f : f >= 0.5 ? 0.5 : f;
    n = Math.max(n, 0.05);
    cv.style.width = (W * n) / d + "px";
    cv.style.height = (H * n) / d + "px";
    cv.style.imageRendering =
      n >= 1 && n === Math.floor(n) ? "pixelated" : "auto";
  }

  /* ---- the engine: compiles the shader, uploads the map, runs the loop ---- */
  function createLighthouse(canvas, o) {
    "use strict";
    const W = 540,
      H = 960;
    const LAMP = [262.0, 482.5]; // beam origin (art px): top of the lantern room
    const BEAM_W0 = 0.5,
      BEAM_K = 0.102; // half-width = 0.5 px + 0.102 * distance
    const PATS = { dots: 0, stripes: 1, noise: 2, diamond: 3 };
    const hexv = (h) =>
      [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const S = Object.assign({}, o.settings);

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("WebGL2 is not available in this browser.");
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error("Shader compile error:\n" + gl.getShaderInfoLog(s));
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, compile(gl.VERTEX_SHADER, o.vs));
    gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, o.fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS))
      throw new Error("Link error:\n" + gl.getProgramInfoLog(pr));
    const U = {};
    [
      "uTex",
      "uRes",
      "uLamp",
      "uOff",
      "uT",
      "uClk",
      "uAng",
      "uW",
      "uI",
      "uCell",
      "uDots",
      "uW0",
      "uK",
      "uPat",
      "uBeamOn",
      "uWaves",
      "uTint",
      "uRip",
      "uBirds",
      "uDark",
      "uLight",
      "uBeam",
    ].forEach((n) => {
      U[n] = gl.getUniformLocation(pr, n);
    });
    const tex = gl.createTexture();

    // angle: beam angle in degrees. wt: wave clock. clk: ripple and gull clock (seconds).
    const api = {
      S,
      W,
      H,
      LAMP,
      angle: S.angle,
      wt: 0,
      clk: 0,
      playing: true,
      dirty: true,
      ready: false,
      fps: 0,
      ox: 0,
      oy: 0,
      minDt: 0,
    };

    function draw() {
      if (!api.ready) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(pr);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(U.uTex, 0);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform2f(U.uOff, api.ox, api.oy);
      gl.uniform2f(U.uLamp, LAMP[0], LAMP[1]);
      gl.uniform1f(U.uT, api.wt);
      gl.uniform1f(U.uClk, api.clk);
      gl.uniform1i(U.uRip, S.ripples ? 1 : 0);
      gl.uniform1i(U.uBirds, S.birds ? 1 : 0);
      gl.uniform1f(U.uAng, (api.angle * Math.PI) / 180);
      gl.uniform1f(U.uW, S.width);
      gl.uniform1f(U.uI, S.intensity);
      gl.uniform1f(U.uCell, S.waveScale);
      gl.uniform1f(U.uDots, S.waveDots);
      gl.uniform1f(U.uW0, BEAM_W0);
      gl.uniform1f(U.uK, BEAM_K);
      gl.uniform1i(U.uPat, PATS[S.pattern]);
      gl.uniform1i(U.uBeamOn, S.beamOn ? 1 : 0);
      gl.uniform1i(U.uWaves, S.wavesOn ? 1 : 0);
      gl.uniform1i(U.uTint, S.beamTint ? 1 : 0);
      gl.uniform3fv(U.uDark, hexv(S.dark));
      gl.uniform3fv(U.uLight, hexv(S.light));
      gl.uniform3fv(U.uBeam, hexv(S.beamColor));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");
      x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, W, H);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        W,
        H,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        d.data,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      api.ready = true;
      api.dirty = true;
      draw();
    };
    im.onerror = () => {
      if (o.onError)
        o.onError(new Error("Could not decode the embedded map image."));
    };
    im.src = o.map;

    let last = 0,
      raf = 0;
    const frames = [];
    function loop(n) {
      raf = requestAnimationFrame(loop);
      if (api.minDt && n - last < api.minDt) return;
      const dt = Math.min(0.1, (n - last) / 1000);
      last = n;
      if (api.playing) {
        api.angle = (((api.angle + S.speed * dt) % 360) + 360) % 360;
        api.wt += dt * S.waveSpeed;
        api.clk += dt;
        api.dirty = true;
      }
      if (api.dirty && api.ready) {
        api.dirty = false;
        draw();
        frames.push(n);
      }
      while (frames.length && n - frames[0] > 1000) frames.shift();
      api.fps = frames.length;
    }
    api.draw = draw;
    // Show a w x h window of the 540 x 960 map whose top-left art pixel is (ox, oy).
    // One canvas pixel = one art pixel, so the caller scales the canvas by a whole number.
    api.setView = (w, h, ox, oy) => {
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      api.ox = ox;
      api.oy = oy;
      api.dirty = true;
      draw();
    };
    api.start = () => {
      raf = requestAnimationFrame((t) => {
        last = t;
        loop(t);
      });
    };
    api.stop = () => cancelAnimationFrame(raf);
    return api;
  }

  /* ---- convenience wrapper ---- */
  function mount(canvas, options) {
    options = options || {};
    const lh = createLighthouse(canvas, {
      map: MAP,
      vs: VS,
      fs: FS,
      settings: Object.assign({}, DEFAULTS, options.settings),
      onError: options.onError,
    });
    const mode = options.fit === undefined ? "parent" : options.fit;
    const fit = () => {
      if (mode === "window")
        fitCanvas(canvas, window.innerWidth, window.innerHeight);
      else if (mode === "parent") {
        const p = canvas.parentElement || document.body;
        fitCanvas(
          canvas,
          p.clientWidth || window.innerWidth,
          p.clientHeight || window.innerHeight,
        );
      }
    };
    if (mode) {
      window.addEventListener("resize", fit);
      fit();
    }
    if (
      options.respectReducedMotion !== false &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      lh.playing = false;
    lh.destroy = () => {
      lh.stop();
      window.removeEventListener("resize", fit);
    };
    lh.start();
    return lh;
  }

  return {
    mount,
    create: createLighthouse,
    fitCanvas,
    DEFAULTS,
    PALS,
    VS,
    FS,
    MAP,
  };
})();
export default Lighthouse;
