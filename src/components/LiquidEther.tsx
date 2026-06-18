'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = true,
  resolution = 0.5,
  isBounce = false,
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  style = {},
  className = '',
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 1000,
  autoRampDuration = 0.6,
}: {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops: string[]) {
      const arr = stops.length < 2 ? [stops[0] || '#fff', stops[0] || '#fff'] : stops;
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i * 4] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    // ── Shaders ──
    const face_vert = `attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;
    const line_vert = `attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;
    const mouse_vert = `precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;
    const advection_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;vec2 nv=texture2D(velocity,uv2).xy;gl_FragColor=vec4(nv,0.0,0.0);}else{vec2 sn=uv;vec2 vo=texture2D(velocity,uv).xy;vec2 so=sn-vo*dt*ratio;vec2 vn1=texture2D(velocity,so).xy;vec2 sn2=so+vn1*dt*ratio;vec2 err=sn2-sn;vec2 sn3=sn-err/2.0;vec2 v2=texture2D(velocity,sn3).xy;vec2 so2=sn3-v2*dt*ratio;vec2 nv2=texture2D(velocity,so2).xy;gl_FragColor=vec4(nv2,0.0,0.0);}}`;
    const color_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;vec3 outRGB=mix(bgColor.rgb,c,lenv);float outA=mix(bgColor.a,1.0,lenv);gl_FragColor=vec4(outRGB,outA);}`;
    const divergence_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;float d=(x1-x0+y1-y0)/2.0;gl_FragColor=vec4(d/dt);}`;
    const externalForce_frag = `precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}`;
    const poisson_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;float nP=(p0+p1+p2+p3)/4.0-div;gl_FragColor=vec4(nP);}`;
    const pressure_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float s=1.0;float p0=texture2D(pressure,uv+vec2(px.x*s,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*s,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*s)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*s)).r;vec2 v=texture2D(velocity,uv).xy;vec2 gP=vec2(p0-p1,p2-p3)*0.5;v=v-gP*dt;gl_FragColor=vec4(v,0.0,1.0);}`;
    const viscous_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 n0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 n1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 n2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 n3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 nv=4.0*old+v*dt*(n0+n1+n2+n3);nv/=4.0*(1.0+v*dt);gl_FragColor=vec4(nv,0.0,0.0);}`;

    // ── Common (renderer + sizing) ──
    let width = 0, height = 0;
    const container = mountRef.current!;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color(0x000000), 0);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    const clock = new THREE.Clock();
    clock.start();

    container.style.position = container.style.position || 'relative';
    container.style.overflow = container.style.overflow || 'hidden';
    container.prepend(renderer.domElement);

    function resize() {
      const r2 = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(r2.width));
      height = Math.max(1, Math.floor(r2.height));
      renderer.setSize(width, height, false);
    }

    // ── Mouse ──
    const mouseCoords = new THREE.Vector2();
    const mouseOld = new THREE.Vector2();
    const mouseDiff = new THREE.Vector2();
    let mouseMoved = false;
    let mouseTimer: ReturnType<typeof setTimeout> | null = null;
    let isHoverInside = false;
    let hasUserControl = false;
    let isAutoActive = false;

    function setMouseCoords(x: number, y: number) {
      if (mouseTimer) clearTimeout(mouseTimer);
      const r2 = container.getBoundingClientRect();
      if (r2.width === 0 || r2.height === 0) return;
      mouseCoords.set(((x - r2.left) / r2.width) * 2 - 1, -(((y - r2.top) / r2.height) * 2 - 1));
      mouseMoved = true;
      mouseTimer = setTimeout(() => { mouseMoved = false; }, 100);
    }

    function onMouseMove(e: MouseEvent) {
      const r2 = container.getBoundingClientRect();
      isHoverInside = e.clientX >= r2.left && e.clientX <= r2.right && e.clientY >= r2.top && e.clientY <= r2.bottom;
      if (!isHoverInside) return;
      lastUserInteraction = performance.now();
      if (autoDriverActive) { autoDriverActive = false; isAutoActive = false; }
      setMouseCoords(e.clientX, e.clientY);
      hasUserControl = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const r2 = container.getBoundingClientRect();
      isHoverInside = t.clientX >= r2.left && t.clientX <= r2.right && t.clientY >= r2.top && t.clientY <= r2.bottom;
      if (!isHoverInside) return;
      lastUserInteraction = performance.now();
      setMouseCoords(t.clientX, t.clientY);
      hasUserControl = true;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── AutoDriver ──
    let lastUserInteraction = performance.now();
    let autoDriverActive = false;
    const autoCurrent = new THREE.Vector2(0, 0);
    const autoTarget = new THREE.Vector2();
    let autoLastTime = performance.now();
    let autoActivationTime = 0;
    const margin = 0.2;

    function pickAutoTarget() {
      autoTarget.set((Math.random() * 2 - 1) * (1 - margin), (Math.random() * 2 - 1) * (1 - margin));
    }
    pickAutoTarget();

    function updateAutoDriver() {
      if (!autoDemo) return;
      const now = performance.now();
      if (now - lastUserInteraction < autoResumeDelay) {
        if (autoDriverActive) { autoDriverActive = false; isAutoActive = false; }
        return;
      }
      if (isHoverInside) {
        if (autoDriverActive) { autoDriverActive = false; isAutoActive = false; }
        return;
      }
      if (!autoDriverActive) {
        autoDriverActive = true;
        autoCurrent.copy(mouseCoords);
        autoLastTime = now;
        autoActivationTime = now;
      }
      isAutoActive = true;
      let dtSec = (now - autoLastTime) / 1000;
      autoLastTime = now;
      if (dtSec > 0.2) dtSec = 0.016;
      const dir = new THREE.Vector2().subVectors(autoTarget, autoCurrent);
      const dist = dir.length();
      if (dist < 0.01) { pickAutoTarget(); return; }
      dir.normalize();
      let ramp = 1;
      if (autoRampDuration > 0) {
        const t = Math.min(1, (now - autoActivationTime) / (autoRampDuration * 1000));
        ramp = t * t * (3 - 2 * t);
      }
      const step = autoSpeed * dtSec * ramp;
      autoCurrent.addScaledVector(dir, Math.min(step, dist));
      mouseCoords.copy(autoCurrent);
      mouseMoved = true;
    }

    // ── Simulation FBOs ──
    const simRes = resolution;
    const fboW = Math.max(1, Math.round(simRes * width));
    const fboH = Math.max(1, Math.round(simRes * height));
    const cellScale = new THREE.Vector2(1 / fboW, 1 / fboH);
    const fboSize = new THREE.Vector2(fboW, fboH);
    const boundarySpace = new THREE.Vector2();

    const fboType = /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
    const fboOpts = { type: fboType, depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
    const vel0 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const vel1 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const velV0 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const velV1 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const divFbo = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const pres0 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);
    const pres1 = new THREE.WebGLRenderTarget(fboW, fboH, fboOpts);

    // ── ShaderPass helper ──
    function makePass(vs: string, fs: string, uniforms: any) {
      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const mat = new THREE.RawShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(mesh);
      return { scene, camera, mat, uniforms };
    }

    function runPass(pass: any, target: THREE.WebGLRenderTarget | null) {
      renderer.setRenderTarget(target);
      renderer.render(pass.scene, pass.camera);
      renderer.setRenderTarget(null);
    }

    // ── Advection ──
    const advU = { boundarySpace: { value: cellScale }, px: { value: cellScale }, fboSize: { value: fboSize }, velocity: { value: vel0.texture }, dt: { value: dt }, isBFECC: { value: true } };
    const advPass = makePass(face_vert, advection_frag, advU);
    // boundary lines
    const bndG = new THREE.BufferGeometry();
    bndG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]), 3));
    const bndLine = new THREE.LineSegments(bndG, new THREE.RawShaderMaterial({ vertexShader: line_vert, fragmentShader: advection_frag, uniforms: advU }));
    bndLine.visible = false;
    advPass.scene.add(bndLine);

    // ── External Force ──
    const efScene = new THREE.Scene();
    const efCamera = new THREE.Camera();
    const efU = { px: { value: cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(cursorSize, cursorSize) } };
    const efMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.RawShaderMaterial({ vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: efU }));
    efScene.add(efMesh);

    // ── Viscous ──
    const viscU = { boundarySpace: { value: boundarySpace }, velocity: { value: vel1.texture }, velocity_new: { value: velV0.texture }, v: { value: viscous }, px: { value: cellScale }, dt: { value: dt } };
    const viscPass = makePass(face_vert, viscous_frag, viscU);

    // ── Divergence ──
    const divU = { boundarySpace: { value: boundarySpace }, velocity: { value: velV0.texture }, px: { value: cellScale }, dt: { value: dt } };
    const divPass = makePass(face_vert, divergence_frag, divU);

    // ── Poisson ──
    const poisU = { boundarySpace: { value: boundarySpace }, pressure: { value: pres0.texture }, divergence: { value: divFbo.texture }, px: { value: cellScale } };
    const poisPass = makePass(face_vert, poisson_frag, poisU);

    // ── Pressure ──
    const presU = { boundarySpace: { value: boundarySpace }, pressure: { value: pres0.texture }, velocity: { value: velV0.texture }, px: { value: cellScale }, dt: { value: dt } };
    const presPass = makePass(face_vert, pressure_frag, presU);

    // ── Output ──
    const outScene = new THREE.Scene();
    const outCamera = new THREE.Camera();
    const outMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({ vertexShader: face_vert, fragmentShader: color_frag, transparent: true, depthWrite: false, uniforms: { velocity: { value: vel0.texture }, boundarySpace: { value: new THREE.Vector2() }, palette: { value: paletteTex }, bgColor: { value: bgVec4 } } }));
    outScene.add(outMesh);

    // ── Simulation step ──
    function simulate() {
      if (isBounce) boundarySpace.set(0, 0); else boundarySpace.copy(cellScale);

      // Advection
      advU.dt.value = dt;
      bndLine.visible = isBounce;
      advU.isBFECC.value = BFECC;
      runPass(advPass, vel1);

      // External force
      const fx = (mouseDiff.x / 2) * mouseForce;
      const fy = (mouseDiff.y / 2) * mouseForce;
      const csx = cursorSize * cellScale.x;
      const csy = cursorSize * cellScale.y;
      efU.force.value.set(fx, fy);
      efU.center.value.set(
        Math.min(Math.max(mouseCoords.x, -1 + csx + cellScale.x * 2), 1 - csx - cellScale.x * 2),
        Math.min(Math.max(mouseCoords.y, -1 + csy + cellScale.y * 2), 1 - csy - cellScale.y * 2)
      );
      efU.scale.value.set(cursorSize, cursorSize);
      renderer.setRenderTarget(vel1);
      renderer.render(efScene, efCamera);
      renderer.setRenderTarget(null);

      // Viscosity
      let vel = vel1;
      if (isViscous) {
        viscU.v.value = viscous;
        let fboIn, fboOut;
        for (let i = 0; i < iterationsViscous; i++) {
          fboIn = i % 2 === 0 ? velV0 : velV1;
          fboOut = i % 2 === 0 ? velV1 : velV0;
          viscU.velocity_new.value = fboIn.texture;
          viscU.dt.value = dt;
          runPass(viscPass, fboOut);
        }
        vel = fboOut || velV0;
      }

      // Divergence
      divU.velocity.value = vel.texture;
      runPass(divPass, divFbo);

      // Poisson
      let pIn, pOut;
      for (let i = 0; i < iterationsPoisson; i++) {
        pIn = i % 2 === 0 ? pres0 : pres1;
        pOut = i % 2 === 0 ? pres1 : pres0;
        poisU.pressure.value = pIn.texture;
        runPass(poisPass, pOut);
      }

      // Pressure
      presU.velocity.value = vel.texture;
      presU.pressure.value = (pOut || pres0).texture;
      runPass(presPass, vel0);
    }

    // ── Render loop ──
    let running = true;

    function loop() {
      if (!running) return;
      updateAutoDriver();

      // Mouse update
      mouseDiff.subVectors(mouseCoords, mouseOld);
      mouseOld.copy(mouseCoords);
      if (mouseOld.x === 0 && mouseOld.y === 0) mouseDiff.set(0, 0);
      if (isAutoActive) mouseDiff.multiplyScalar(autoIntensity);

      clock.getDelta();
      simulate();

      // Render output
      renderer.setRenderTarget(null);
      renderer.render(outScene, outCamera);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    // ── Resize ──
    const onResize = () => {
      resize();
      const nw = Math.max(1, Math.round(simRes * width));
      const nh = Math.max(1, Math.round(simRes * height));
      cellScale.set(1 / nw, 1 / nh);
      fboSize.set(nw, nh);
      [vel0, vel1, velV0, velV1, divFbo, pres0, pres1].forEach(f => f.setSize(nw, nh));
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ── Intersection Observer (pause when off-screen) ──
    const io = new IntersectionObserver((entries) => {
      const vis = entries[0].isIntersecting;
      isVisibleRef.current = vis;
      if (vis && !document.hidden) {
        if (!running) { running = true; rafRef.current = requestAnimationFrame(loop); }
      } else {
        running = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }
    }, { threshold: [0, 0.01] });
    io.observe(container);

    // ── Visibility ──
    const onVis = () => {
      if (document.hidden) {
        running = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      } else if (isVisibleRef.current) {
        if (!running) { running = true; rafRef.current = requestAnimationFrame(loop); }
      }
    };
    document.addEventListener('visibilitychange', onVis);

    webglRef.current = { renderer };

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      const canvas = renderer.domElement;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      renderer.dispose();
      renderer.forceContextLoss();
      webglRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className={`liquid-ether-container ${className || ''}`} style={style} />;
}
