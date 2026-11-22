/* Mesa de som do "Criar meu vídeo" (22/11, ele: "assim que botar o som tem que mudar" e "toda vez que clicar no efeito
   sonoro, pode escutar"). Tudo pelo Web Audio: a voz e a trilha seguem o tempo do vídeo (corrigem quando escorregam),
   a troca de trilha vale no mesmo instante e cada efeito sonoro toca na hora do toque. O navegador só deixa tocar som
   depois de um toque da pessoa: `ligar()` é chamado dentro do clique (Ouvir, trilha ou efeito). */

type Faixa = { url: string | null; src: AudioBufferSourceNode | null; g: GainNode | null; t0: number; off: number; saida: GainNode };

const NIVEL = { voz: 1, trilha: 1.5, sfxVideo: 0.34, sfxToque: 0.62 };

class Mesa {
  private ctx: AudioContext | null = null;
  private brutos = new Map<string, Promise<ArrayBuffer | null>>();
  private decod = new Map<string, Promise<AudioBuffer | null>>();
  private prontos = new Map<string, AudioBuffer>();
  private voz: Faixa | null = null;
  private tri: Faixa | null = null;
  private fx: GainNode | null = null;

  private criar(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    const ctx = new C();
    const mestre = ctx.createGain();
    mestre.gain.value = 0.9;
    mestre.connect(ctx.destination);
    const faixa = (nivel: number): Faixa => { const g = ctx.createGain(); g.gain.value = nivel; g.connect(mestre); return { url: null, src: null, g: null, t0: 0, off: 0, saida: g }; };
    this.voz = faixa(NIVEL.voz);
    this.tri = faixa(NIVEL.trilha);
    this.fx = ctx.createGain();
    this.fx.connect(mestre);
    this.ctx = ctx;
    return ctx;
  }

  /** dentro de um toque da pessoa: libera o som */
  ligar() {
    const ctx = this.criar();
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  }

  /** baixa antes (não precisa de toque): os sons de um passo já ficam prontos quando ele abre */
  preparar(urls: (string | null)[]) {
    for (const u of urls) if (u && !this.brutos.has(u)) this.brutos.set(u, fetch(u).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
  }

  private carregar(url: string): Promise<AudioBuffer | null> {
    const ctx = this.criar();
    if (!ctx) return Promise.resolve(null);
    let p = this.decod.get(url);
    if (!p) {
      this.preparar([url]);
      p = this.brutos.get(url)!
        .then(b => (b ? ctx.decodeAudioData(b.slice(0)) : null))
        .then(buf => { if (buf) this.prontos.set(url, buf); return buf; })
        .catch(() => null);
      this.decod.set(url, p);
    }
    return p;
  }

  private parar(f: Faixa, fade = 0.04) {
    const ctx = this.ctx;
    if (!ctx || !f.src || !f.g) return;
    const agora = ctx.currentTime;
    f.g.gain.cancelScheduledValues(agora);
    f.g.gain.setValueAtTime(f.g.gain.value, agora);
    f.g.gain.linearRampToValueAtTime(0, agora + fade);
    try { f.src.stop(agora + fade + 0.01); } catch { /* já parou */ }
    f.src = null;
    f.g = null;
  }

  private seguir(f: Faixa | null, url: string | null, tv: number, tocar: boolean) {
    const ctx = this.ctx;
    if (!ctx || !f) return;
    if (f.url !== url) { this.parar(f, 0.12); f.url = url; }
    if (!url || !tocar || ctx.state !== 'running') { this.parar(f); return; }
    const b = this.prontos.get(url);
    if (!b) { void this.carregar(url); return; }
    const pos = f.src ? f.off + (ctx.currentTime - f.t0) : -1;
    if (f.src && Math.abs(pos - tv) <= 0.15) return;
    this.parar(f, 0.03);
    if (tv >= b.duration - 0.05) return;
    const agora = ctx.currentTime;
    const s = ctx.createBufferSource();
    s.buffer = b;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, agora);
    g.gain.linearRampToValueAtTime(1, agora + 0.05);
    s.connect(g);
    g.connect(f.saida);
    s.start(agora, tv);
    Object.assign(f, { src: s, g, t0: agora, off: tv });
  }

  /** a cada quadro do vídeo: voz e trilha no tempo `tv` */
  quadro(tv: number, tocar: boolean, voz: string | null, trilha: string | null) {
    if (!this.ctx) return;
    this.seguir(this.voz, voz, tv, tocar);
    this.seguir(this.tri, trilha, tv, tocar);
  }

  /** um efeito sonoro agora (no toque do cartão ou num momento da fala) */
  tocar(url: string, noVideo = false) {
    const ctx = this.criar();
    if (!ctx || !this.fx) return;
    const pedido = performance.now();
    void this.carregar(url).then(b => {
      // (num contexto que ainda está ligando, o som sai assim que ele liga)
      if (!b || !this.fx || performance.now() - pedido > 700) return;
      const s = ctx.createBufferSource();
      s.buffer = b;
      const g = ctx.createGain();
      g.gain.value = noVideo ? NIVEL.sfxVideo : NIVEL.sfxToque;
      s.connect(g);
      g.connect(this.fx);
      s.start();
    });
  }

  silenciar() {
    if (this.voz) this.parar(this.voz);
    if (this.tri) this.parar(this.tri);
  }
}

export const mesa = new Mesa();
