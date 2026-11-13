import { Play, RotateCcw, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { eventoProprio } from '@/lib/pixel';

// Player do vídeo de vendas no padrão dos concorrentes (VTurb): começa mudo, aviso grande no centro para ativar o som,
// sem controles nem duração, barra de progresso que anda rápido no começo e devagar no fim, e "continuar de onde parou".
type Fase = 'mudo' | 'tocando' | 'pausado' | 'retomar' | 'fim';
const CHAVE = 'vsl-posicao';

/** Progresso exibido: anda rápido no começo e desacelera (a pessoa não vê quanto falta). */
const progressoVisivel = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 2.2);

function lerPosicao(): number {
  try {
    return Number(window.localStorage.getItem(CHAVE)) || 0;
  } catch {
    return 0;
  }
}
function gravarPosicao(t: number) {
  try {
    window.localStorage.setItem(CHAVE, String(Math.floor(t)));
  } catch {
    /* navegador sem armazenamento: só não retoma */
  }
}

/** Pelo menos metade do vídeo está aparecendo na tela? */
function videoNaTela(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  if (!r.height) return false;
  const visivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  return visivel >= r.height * 0.5;
}

export function VslPlayer({ src, poster }: { src: string; poster?: string | undefined }) {
  const ref = useRef<HTMLVideoElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<Fase>('mudo');
  const faseAtual = useRef<Fase>('mudo');
  faseAtual.current = fase;
  const somAtivado = useRef(false);
  const [prog, setProg] = useState(0);
  const salva = useRef(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // só oferece retomar se a posição salva cabe no vídeo atual (uma versão antiga do vídeo podia ser mais longa)
    const confere = () => { const p = lerPosicao(); if (p > 8 && (!v.duration || p < v.duration - 5)) setFase(f => (f === 'mudo' ? 'retomar' : f)); else if (p > 8) gravarPosicao(0); };
    if (v.readyState >= 1) confere(); else v.addEventListener('loadedmetadata', confere, { once: true });
    const tempo = () => {
      if (!v.duration) return;
      if (!v.muted) {
        const x = v.currentTime / v.duration;
        setProg(progressoVisivel(x));
        for (const m of [25, 50, 75]) if (x >= m / 100) eventoProprio(`VSL_${m}`); // retenção (com som)
        if (Math.abs(v.currentTime - salva.current) > 2) {
          salva.current = v.currentTime;
          gravarPosicao(v.currentTime);
        }
      }
    };
    const fim = () => {
      if (v.muted) return;
      gravarPosicao(0);
      eventoProprio('VSL_Concluiu');
      setFase('fim');
    };
    v.addEventListener('timeupdate', tempo);
    v.addEventListener('ended', fim);
    return () => {
      v.removeEventListener('timeupdate', tempo);
      v.removeEventListener('ended', fim);
    };
  }, []);

  const tocarComSom = (de: number) => {
    const v = ref.current;
    if (!v) return;
    somAtivado.current = true;
    eventoProprio('VSL_AtivouSom', { como: 'botao' });
    v.loop = false;
    v.muted = false;
    v.currentTime = de;
    setFase('tocando');
    void v.play().catch(() => setFase('pausado'));
  };

  // O primeiro toque em qualquer lugar da página liga o som, desde que o vídeo esteja aparecendo na tela.
  // Arrastar para rolar não conta: o navegador só deixa ligar o som com um toque, clique ou tecla.
  useEffect(() => {
    let x0 = 0;
    let y0 = 0;
    let arrastou = false;
    const comecou = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      x0 = t.clientX;
      y0 = t.clientY;
      arrastou = false;
    };
    const moveu = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && Math.hypot(t.clientX - x0, t.clientY - y0) > 10) arrastou = true;
    };
    const tocou = (e: Event) => {
      if (somAtivado.current) return desligar();
      if (e.type === 'touchend' && arrastou) return;
      if (e instanceof PointerEvent && e.pointerType === 'touch') return; // no toque, quem conta é o touchend
      const v = ref.current;
      const c = caixa.current;
      if (!v || !c) return;
      if (e.target instanceof Node && c.contains(e.target)) return; // dentro do player, os botões dele resolvem
      const f = faseAtual.current;
      if (f !== 'mudo' && f !== 'retomar') return;
      if (!videoNaTela(c)) return; // rolou para baixo: não liga o som com a pessoa longe do vídeo
      const de = f === 'retomar' ? Math.max(0, lerPosicao() - 2) : 0;
      somAtivado.current = true;
      v.loop = false;
      v.muted = false;
      v.currentTime = de;
      setFase('tocando');
      v.play()
        .then(() => eventoProprio('VSL_AtivouSom', { como: 'toque-na-pagina' }))
        .catch(() => {
          // o navegador não aceitou esse gesto: volta a tocar mudo e espera o próximo toque
          somAtivado.current = false;
          v.muted = true;
          v.loop = true;
          setFase(f);
          void v.play().catch(() => {});
        });
    };
    const opcoes = { capture: true, passive: true } as const;
    const desligar = () => {
      document.removeEventListener('touchstart', comecou, opcoes);
      document.removeEventListener('touchmove', moveu, opcoes);
      document.removeEventListener('touchend', tocou, opcoes);
      document.removeEventListener('pointerup', tocou, opcoes);
      document.removeEventListener('keydown', tocou, opcoes);
    };
    document.addEventListener('touchstart', comecou, opcoes);
    document.addEventListener('touchmove', moveu, opcoes);
    document.addEventListener('touchend', tocou, opcoes);
    document.addEventListener('pointerup', tocou, opcoes);
    document.addEventListener('keydown', tocou, opcoes);
    return desligar;
  }, []);

  const cliqueNoVideo = () => {
    const v = ref.current;
    if (!v) return;
    if (fase === 'mudo') return tocarComSom(0);
    if (fase === 'tocando') {
      v.pause();
      setFase('pausado');
    }
  };

  const continuar = () => {
    const v = ref.current;
    if (!v) return;
    setFase('tocando');
    void v.play().catch(() => setFase('pausado'));
  };

  return (
    <div className="vsl" ref={caixa} onContextMenu={e => e.preventDefault()}>
      <video ref={ref} src={src} poster={poster} autoPlay muted loop playsInline preload="auto" onClick={cliqueNoVideo} disablePictureInPicture controlsList="nodownload noplaybackrate nofullscreen" />

      {fase === 'mudo' && (
        <button type="button" className="vsl-som" onClick={() => tocarComSom(0)} aria-label="Ativar o som do vídeo">
          <span className="vsl-som-topo">Seu vídeo já começou</span>
          <span className="vsl-som-icone"><VolumeX /></span>
          <span className="vsl-som-acao">Toque para ouvir</span>
        </button>
      )}

      {fase === 'pausado' && (
        <button type="button" className="vsl-pausa" onClick={continuar} aria-label="Continuar assistindo">
          <span className="vsl-pausa-icone"><Play /></span>
          <span>Continuar assistindo</span>
        </button>
      )}

      {fase === 'retomar' && (
        <div className="vsl-retomar">
          <p>Você já começou a assistir este vídeo</p>
          <button type="button" onClick={() => tocarComSom(Math.max(0, lerPosicao() - 2))}><Play />Continuar de onde parei</button>
          <button type="button" className="vsl-retomar-inicio" onClick={() => tocarComSom(0)}><RotateCcw />Assistir do início</button>
        </div>
      )}

      {fase === 'fim' && (
        <button type="button" className="vsl-pausa" onClick={() => tocarComSom(0)} aria-label="Assistir de novo">
          <span className="vsl-pausa-icone"><RotateCcw /></span>
          <span>Assistir de novo</span>
        </button>
      )}

      {fase !== 'mudo' && fase !== 'retomar' && <div className="vsl-barra" aria-hidden="true"><span style={{ transform: `scaleX(${prog})` }} /></div>}
    </div>
  );
}
