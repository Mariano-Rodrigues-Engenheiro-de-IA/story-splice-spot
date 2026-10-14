// @ts-nocheck
// Prévia animada desenhada em canvas: simula uma gravação "bruta" e a versão "pronta".
// Serve só como marcador até você trocar pelos seus vídeos reais (veja src/config.ts).

export const REC = "#ff3b3b"
export const OK = "#2ee6c4"
const AMBER = "#ffb020"
const DISP = '"Geist",system-ui,sans-serif'
const MONO = '"Geist Mono",ui-monospace,monospace'

export type ClipOpts = {
  scene?: "studio" | "green" | "warm" | "blue"
  desat?: boolean
  pauses?: boolean
  rec?: boolean
  grade?: boolean
  captions?: boolean
  zoom?: boolean
  impact?: string
  bgSwap?: boolean
  letterbox?: boolean
  music?: boolean
  ui?: boolean
  pauseLen?: number
  offset?: number
  static?: boolean
}

export const PRESETS: Record<"bruto" | "pronto", ClipOpts> = {
  bruto: { desat: true, pauses: true, rec: true, grade: false, captions: false, zoom: false, impact: "", bgSwap: false, letterbox: false, music: false, ui: false },
  pronto: { desat: false, pauses: false, rec: false, grade: true, captions: true, zoom: true, impact: "", bgSwap: false, letterbox: false, music: false, ui: true },
}

const SC = {
  studio: { top: "#1c0f27", bot: "#060409", light: "rgba(255,64,120,.5)", led: "#ff5a8a" },
  green: { top: "#0b2a20", bot: "#030907", light: "rgba(70,255,190,.4)", led: "#3cf0b8" },
  warm: { top: "#2b170b", bot: "#080402", light: "rgba(255,150,60,.5)", led: "#ffb45e" },
  blue: { top: "#0b1631", bot: "#03050b", light: "rgba(90,140,255,.5)", led: "#71a2ff" },
}
const WORDS = ["Você", "grava", "do", "seu", "jeito", "e", "a", "IA", "entrega", "o", "vídeo", "cortado,", "com", "legenda", "e", "movimento,", "pronto", "pra", "postar."]
const WD = 0.34, NW = 8
const fmt = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60), x = Math.floor(s % 60); return m + ":" + String(x).padStart(2, "0") }

function speech(t, pauses, P) {
  if (pauses) {
    const cyc = NW * WD + P, k = Math.floor(t / cyc), ct = t - k * cyc
    if (ct >= NW * WD) return { a: 0, wi: k * NW + NW - 1, silent: true, left: cyc - ct }
    const i = Math.floor(ct / WD), ph = (ct - i * WD) / WD, wi = k * NW + i
    return { a: Math.sin(ph * Math.PI) * (0.55 + 0.45 * Math.abs(Math.sin(wi * 1.7))), wi, silent: false }
  }
  const wi = Math.floor(t / WD), ph = (t - wi * WD) / WD
  return { a: Math.sin(ph * Math.PI) * (0.55 + 0.45 * Math.abs(Math.sin(wi * 1.7))), wi, silent: false }
}
function rr(x, X, Y, W, H, R) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, Math.max(0, W), Math.max(0, H), Math.max(0, Math.min(R, W / 2, H / 2))); else x.rect(X, Y, W, H) }
function ell(x, cx, cy, rx, ry) { x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2) }

function studio(x, W, H, t, S) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, S.top); g.addColorStop(1, S.bot); x.fillStyle = g; x.fillRect(0, 0, W, H)
  const r = x.createRadialGradient(W * 0.84, H * 0.2, 0, W * 0.84, H * 0.2, W * 0.8); r.addColorStop(0, S.light); r.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = r; x.fillRect(0, 0, W, H)
  x.fillStyle = "rgba(255,255,255,.06)"; x.fillRect(0, H * 0.355, W * 0.32, H * 0.007)
  for (let i = 0; i < 5; i++) { x.globalAlpha = 0.35 + 0.25 * Math.sin(t * 2 + i); x.fillStyle = S.led; x.fillRect(W * (0.03 + i * 0.055), H * 0.335, W * 0.02, H * 0.013) }
  x.globalAlpha = 1
}
function city(x, W, H, t) {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0a1638"); g.addColorStop(0.6, "#1b1244"); g.addColorStop(1, "#05040c"); x.fillStyle = g; x.fillRect(0, 0, W, H)
  const m = x.createRadialGradient(W * 0.78, H * 0.15, 0, W * 0.78, H * 0.15, W * 0.4); m.addColorStop(0, "rgba(255,220,180,.5)"); m.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = m; x.fillRect(0, 0, W, H)
  for (let i = 0; i < 14; i++) {
    const bw = W * (0.07 + ((i * 37) % 5) * 0.013), bx = ((i * 0.078) % 1.04) * W - W * 0.03, bh = H * (0.2 + ((i * 53) % 7) * 0.045), top = H * 0.6 - bh
    x.fillStyle = i % 2 ? "#0e1331" : "#131b42"; x.fillRect(bx, top, bw, bh + H * 0.5)
    for (let wy = 0; wy < bh / (H * 0.03); wy++) for (let wx = 0; wx < 3; wx++) {
      if (((i * 7 + wy * 3 + wx * 5) % 4) === 0) { x.fillStyle = "rgba(255," + (190 + ((wy * 13) % 50)) + ",120," + (0.45 + 0.3 * Math.sin(t * 0.8 + i + wy)).toFixed(2) + ")"; x.fillRect(bx + bw * (0.14 + wx * 0.28), top + wy * H * 0.03 + H * 0.008, bw * 0.14, H * 0.012) }
    }
  }
}
function person(x, W, H, t, sp, S, o) {
  const cx = W / 2 + Math.sin(t * 1.1) * W * 0.006, hy = H * 0.45 + Math.sin(t * 1.9) * H * 0.003, hrx = W * 0.185, hry = W * 0.235, sy = H * 0.62
  x.save(); if (o.bgSwap) { x.shadowColor = "rgba(130,165,255,.75)"; x.shadowBlur = W * 0.07 }
  const tg = x.createLinearGradient(0, sy, 0, H); tg.addColorStop(0, "#26262e"); tg.addColorStop(1, "#0b0b0e"); x.fillStyle = tg
  x.beginPath(); x.moveTo(cx - W * 0.58, H); x.bezierCurveTo(cx - W * 0.55, sy + H * 0.06, cx - W * 0.32, sy, cx, sy); x.bezierCurveTo(cx + W * 0.32, sy, cx + W * 0.55, sy + H * 0.06, cx + W * 0.58, H); x.closePath(); x.fill(); x.restore()
  const ng = x.createLinearGradient(0, hy + hry * 0.45, 0, sy); ng.addColorStop(0, "#86513a"); ng.addColorStop(1, "#a8694b"); x.fillStyle = ng; rr(x, cx - W * 0.07, hy + hry * 0.42, W * 0.14, sy - hy - hry * 0.38, W * 0.05); x.fill()
  x.fillStyle = "#34343d"; x.beginPath(); x.ellipse(cx, sy + H * 0.004, W * 0.105, H * 0.02, 0, 0, Math.PI); x.fill()
  x.fillStyle = "#b97a5a"; ell(x, cx - hrx * 0.97, hy + hry * 0.08, hrx * 0.14, hry * 0.19); x.fill(); ell(x, cx + hrx * 0.97, hy + hry * 0.08, hrx * 0.14, hry * 0.19); x.fill()
  x.save(); x.shadowColor = o.bgSwap ? "rgba(140,170,255,.8)" : S.light; x.shadowBlur = W * 0.06
  const hg = x.createRadialGradient(cx - hrx * 0.35, hy - hry * 0.3, hrx * 0.1, cx, hy + hry * 0.1, hry * 1.15); hg.addColorStop(0, "#ecb492"); hg.addColorStop(0.55, "#d09371"); hg.addColorStop(1, "#a56b4c")
  x.fillStyle = hg; ell(x, cx, hy, hrx, hry); x.fill(); x.restore()
  x.save(); ell(x, cx, hy, hrx, hry); x.clip(); x.beginPath(); x.rect(cx - hrx, hy + hry * 0.2, hrx * 2, hry); x.clip()
  const bg = x.createLinearGradient(0, hy + hry * 0.2, 0, hy + hry); bg.addColorStop(0, "rgba(60,34,22,0)"); bg.addColorStop(0.4, "rgba(60,34,22,.42)"); bg.addColorStop(1, "rgba(42,24,15,.7)"); x.fillStyle = bg; x.fillRect(cx - hrx, hy + hry * 0.2, hrx * 2, hry); x.restore()
  x.fillStyle = "#1c130e"; x.beginPath(); x.moveTo(cx - hrx * 1.02, hy - hry * 0.02)
  x.bezierCurveTo(cx - hrx * 1.16, hy - hry * 1.58, cx + hrx * 1.16, hy - hry * 1.62, cx + hrx * 1.03, hy - hry * 0.05)
  x.bezierCurveTo(cx + hrx * 0.86, hy - hry * 0.5, cx + hrx * 0.2, hy - hry * 0.64, cx - hrx * 0.35, hy - hry * 0.52)
  x.bezierCurveTo(cx - hrx * 0.7, hy - hry * 0.44, cx - hrx * 0.92, hy - hry * 0.3, cx - hrx * 1.02, hy - hry * 0.02); x.fill()
  x.strokeStyle = "#2a1a12"; x.lineCap = "round"; x.lineWidth = W * 0.014
  x.beginPath(); x.moveTo(cx - hrx * 0.6, hy - hry * 0.24); x.quadraticCurveTo(cx - hrx * 0.38, hy - hry * 0.31, cx - hrx * 0.16, hy - hry * 0.25); x.stroke()
  x.beginPath(); x.moveTo(cx + hrx * 0.16, hy - hry * 0.25); x.quadraticCurveTo(cx + hrx * 0.38, hy - hry * 0.31, cx + hrx * 0.6, hy - hry * 0.24); x.stroke()
  const bl = (t % 4.3) < 0.12 ? 0.12 : 1
  for (const s of [-1, 1]) { const ex = cx + s * hrx * 0.38, ey = hy - hry * 0.06; x.fillStyle = "#f4ece6"; ell(x, ex, ey, hrx * 0.13, hry * 0.062 * bl); x.fill(); x.fillStyle = "#2b1b12"; ell(x, ex + Math.sin(t * 0.7) * hrx * 0.025, ey, hrx * 0.065, hry * 0.058 * bl); x.fill() }
  x.strokeStyle = "rgba(120,66,44,.55)"; x.lineWidth = W * 0.008; x.beginPath(); x.moveTo(cx + hrx * 0.02, hy + hry * 0.02); x.quadraticCurveTo(cx - hrx * 0.09, hy + hry * 0.2, cx + hrx * 0.03, hy + hry * 0.25); x.stroke()
  x.strokeStyle = "#121214"; x.lineWidth = W * 0.0085; for (const s of [-1, 1]) { rr(x, cx + s * hrx * 0.38 - hrx * 0.27, hy - hry * 0.19, hrx * 0.54, hry * 0.27, W * 0.025); x.stroke() }
  x.beginPath(); x.moveTo(cx - hrx * 0.11, hy - hry * 0.08); x.quadraticCurveTo(cx, hy - hry * 0.13, cx + hrx * 0.11, hy - hry * 0.08); x.stroke()
  x.fillStyle = "rgba(255,255,255,.1)"; for (const s of [-1, 1]) { rr(x, cx + s * hrx * 0.38 - hrx * 0.22, hy - hry * 0.16, hrx * 0.16, hry * 0.07, W * 0.01); x.fill() }
  const mo = Math.max(0.06, sp.a), my = hy + hry * 0.5, mh = hry * 0.085 * mo + hry * 0.014
  x.fillStyle = "#4a1d16"; ell(x, cx, my, hrx * 0.22, mh); x.fill()
  if (mo > 0.35) { x.save(); ell(x, cx, my, hrx * 0.22, mh); x.clip(); x.fillStyle = "#efe4dd"; x.fillRect(cx - hrx * 0.16, my - mh, hrx * 0.32, mh * 0.42); x.restore() }
  x.strokeStyle = "#94503f"; x.lineWidth = W * 0.006; ell(x, cx, my, hrx * 0.22, mh); x.stroke()
  x.save(); x.strokeStyle = "#1c1c22"; x.lineWidth = W * 0.022; x.lineCap = "round"; x.beginPath(); x.moveTo(-W * 0.05, H * 0.93); x.lineTo(cx - W * 0.24, H * 0.72); x.stroke()
  x.translate(cx - W * 0.21, H * 0.675); x.rotate(-0.35); x.fillStyle = "#0c0c10"; rr(x, -W * 0.055, -H * 0.06, W * 0.11, H * 0.12, W * 0.05); x.fill(); x.strokeStyle = "rgba(255,255,255,.1)"; x.lineWidth = W * 0.004; x.stroke(); x.restore()
}
function scene(x, W, H, t, o, S, sp) {
  let z = 1
  if (o.zoom) { const c = (t % 3.4) / 3.4; z = 1.03 + 0.11 * Math.exp(-c * 5) * Math.min(1, c / 0.03) }
  const fx = W / 2, fy = H * 0.45; x.save(); x.translate(fx, fy); x.scale(z, z); x.translate(-fx, -fy)
  if (o.bgSwap) city(x, W, H, t); else studio(x, W, H, t, S)
  person(x, W, H, t, sp, S, o); x.restore()
}
function grain(x, W, H, t) { x.fillStyle = "rgba(255,255,255,.06)"; let s = ((t * 30) | 0) * 9301 + 7; for (let i = 0; i < 70; i++) { s = (s * 9301 + 49297) % 233280; const px = (s / 233280) * W; s = (s * 9301 + 49297) % 233280; x.fillRect(px, (s / 233280) * H, 1.6, 1.6) } }
function vig(x, W, H, a) { const g = x.createRadialGradient(W / 2, H * 0.45, W * 0.3, W / 2, H * 0.5, H * 0.78); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0," + a + ")"); x.fillStyle = g; x.fillRect(0, 0, W, H) }
function rec(x, W, H, u, t, sp) {
  x.textBaseline = "middle"; x.fillStyle = "rgba(0,0,0,.55)"; rr(x, u * 5, u * 5, u * 32, u * 8.5, u * 4.2); x.fill()
  if (((t * 1.6) | 0) % 2 === 0) { x.fillStyle = REC; ell(x, u * 9.7, u * 9.25, u * 1.7, u * 1.7); x.fill() }
  x.font = "500 " + u * 3.5 + "px " + MONO; x.fillStyle = "#fff"; x.fillText("REC " + fmt(t), u * 13.2, u * 9.4)
  if (sp.silent) {
    const tx = "pausa · " + sp.left.toFixed(1) + " s"; x.font = "500 " + u * 3.8 + "px " + MONO
    const w = x.measureText(tx).width, bx = W / 2 - w / 2 - u * 3, by = H * 0.73
    x.fillStyle = "rgba(255,59,59,.24)"; rr(x, bx, by - u * 4.6, w + u * 6, u * 9.2, u * 4.6); x.fill(); x.strokeStyle = "rgba(255,100,100,.85)"; x.lineWidth = u * 0.4; x.stroke(); x.fillStyle = "#ffc0c0"; x.fillText(tx, bx + u * 3, by + u * 0.2)
  }
}
function captions(x, W, H, u, sp) {
  const start = Math.floor(sp.wi / 3) * 3, line = [0, 1, 2].map((i) => WORDS[(start + i) % WORDS.length])
  let fs = u * 7.6; x.textBaseline = "middle"; x.lineJoin = "round"
  const meas = () => { x.font = "700 " + fs + "px " + DISP; const ws = line.map((w) => x.measureText(w).width); return { ws, tot: ws.reduce((a, b) => a + b, 0) + fs * 0.64 } }
  let m = meas(); if (m.tot > W * 0.88) { fs *= (W * 0.88) / m.tot; m = meas() }
  let px = W / 2 - m.tot / 2; const py = H * 0.745
  line.forEach((w, i) => {
    const act = start + i === sp.wi && !sp.silent
    if (act) { x.fillStyle = OK; rr(x, px - fs * 0.18, py - fs * 0.64, m.ws[i] + fs * 0.36, fs * 1.28, fs * 0.26); x.fill(); x.fillStyle = "#04110e" }
    else { x.lineWidth = fs * 0.18; x.strokeStyle = "rgba(0,0,0,.6)"; x.strokeText(w, px, py); x.fillStyle = "#fff" }
    x.fillText(w, px, py); px += m.ws[i] + fs * 0.32
  })
}
function impact(x, W, H, u, t, txt) {
  const n = Math.min(txt.length, Math.floor((t % 6) / 0.06)), s = txt.slice(0, n); let fs = u * 6.4
  x.font = "700 " + fs + "px " + DISP; let w = x.measureText(txt).width
  if (w > W * 0.78) { fs *= (W * 0.78) / w; x.font = "700 " + fs + "px " + DISP; w = x.measureText(txt).width }
  const bx = W / 2 - w / 2 - u * 3.5, by = H * 0.15; x.textBaseline = "middle"
  x.fillStyle = "rgba(10,10,14,.76)"; rr(x, bx, by - fs * 1.05, w + u * 7, fs * 2.05, u * 2.4); x.fill()
  x.font = "500 " + u * 2.5 + "px " + MONO; x.fillStyle = OK; x.fillText("DESTAQUE", bx + u * 3.5, by - fs * 0.58)
  x.font = "700 " + fs + "px " + DISP; x.fillStyle = "#fff"; x.fillText(s, bx + u * 3.5, by + fs * 0.28)
  if (((t * 2) | 0) % 2 === 0) { x.fillStyle = OK; x.fillRect(bx + u * 3.5 + x.measureText(s).width + u * 0.6, by - fs * 0.2, u * 0.7, fs * 0.95) }
}
function eq(x, W, H, u, t) {
  x.textBaseline = "middle"; x.fillStyle = "rgba(0,0,0,.5)"; rr(x, W - u * 28, H - u * 15, u * 22, u * 8, u * 4); x.fill()
  for (let i = 0; i < 5; i++) { const h = u * (1.6 + 3.6 * Math.abs(Math.sin(t * 6 + i * 1.3))); x.fillStyle = AMBER; rr(x, W - u * 25.5 + i * u * 2.2, H - u * 11 - h / 2, u * 1.3, h, u * 0.6); x.fill() }
  x.font = "500 " + u * 2.8 + "px " + MONO; x.fillStyle = "rgba(255,255,255,.85)"; x.fillText("trilha", W - u * 13.5, H - u * 10.8)
}
function draw(x, W, H, t, o) {
  const S = SC[o.scene] || SC.studio, sp = speech(t, o.pauses, o.pauseLen || 1.3), u = W / 100
  x.save(); x.clearRect(0, 0, W, H); scene(x, W, H, t, o, S, sp)
  if (o.grade) { x.globalCompositeOperation = "soft-light"; const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "rgba(255,170,90,.6)"); g.addColorStop(1, "rgba(40,90,255,.4)"); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = "source-over"; vig(x, W, H, 0.55) }
  if (o.desat) { x.globalCompositeOperation = "saturation"; x.fillStyle = "hsl(0,0%,50%)"; x.globalAlpha = 0.85; x.fillRect(0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.fillStyle = "rgba(0,0,0,.16)"; x.fillRect(0, 0, W, H); grain(x, W, H, t) }
  if (o.letterbox) { x.fillStyle = "#000"; const b = H * 0.085; x.fillRect(0, 0, W, b); x.fillRect(0, H - b, W, b) }
  if (o.rec) rec(x, W, H, u, t, sp)
  if (o.impact) impact(x, W, H, u, t, o.impact)
  if (o.captions) captions(x, W, H, u, sp)
  if (o.music) eq(x, W, H, u, t)
  if (o.ui) { x.fillStyle = "rgba(255,255,255,.2)"; x.fillRect(u * 5, H - u * 3.4, W - u * 10, u * 0.8); x.fillStyle = OK; x.fillRect(u * 5, H - u * 3.4, (W - u * 10) * ((t % 14) / 14), u * 0.8) }
  x.restore()
}

// ---------- laço compartilhado: só anima o que está visível ----------
const RM = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
const clips = new Set()
let running = false, last = 0
const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => { for (const e of es) { const c = e.target.__clip; if (c) c.vis = e.isIntersecting } kick() }, { rootMargin: "120px 0px" }) : null
function paint(c) { if (c.canvas.width < 4) return; draw(c.x, c.canvas.width, c.canvas.height, c.ext != null ? c.ext : c.t, c.o) }
const live = (c) => c.vis && (!c.o.static || c.hover)
function kick() {
  if (RM) { clips.forEach((c) => c.vis && paint(c)); return }
  if (!running && [...clips].some(live)) { running = true; last = performance.now(); requestAnimationFrame(loop) }
}
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; let any = false
  clips.forEach((c) => { if (live(c)) { if (c.ext == null) c.t += dt; paint(c); any = true } })
  if (any && !document.hidden) requestAnimationFrame(loop); else running = false
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick() })
  document.fonts?.ready?.then(() => clips.forEach(paint))
}

export function mountClip(canvas: HTMLCanvasElement, opts: ClipOpts) {
  const c = { canvas, x: canvas.getContext("2d"), o: { scene: "studio", ...opts }, t: opts.offset || 0, ext: null, vis: false, hover: false }
  canvas.__clip = c
  const size = () => {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr))
    if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h }
    paint(c)
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null
  ro?.observe(canvas); size()
  if (!c.x) return { set() {}, setTime() {}, setHover() {}, destroy() { ro?.disconnect() } }
  clips.add(c)
  if (io) io.observe(canvas); else { c.vis = true; kick() }
  return {
    set(o: ClipOpts) { c.o = { ...c.o, ...o }; if (!running || !c.vis) paint(c) },
    setTime(t: number | null) { c.ext = t; if (!running || !c.vis) paint(c) },
    setHover(h: boolean) { c.hover = h; kick() },
    destroy() { clips.delete(c); io?.unobserve(canvas); ro?.disconnect() },
  }
}
