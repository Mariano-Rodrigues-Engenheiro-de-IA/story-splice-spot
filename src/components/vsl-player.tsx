import { Play, RotateCcw, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

export function VslPlayer({ src, poster }: { src: string; poster?: string | undefined }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [fase, setFase] = useState<Fase>('mudo');
  const [prog, setProg] = useState(0);
  const salva = useRef(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (lerPosicao() > 8) setFase('retomar');
    const tempo = () => {
      if (!v.duration) return;
      if (!v.muted) {
        setProg(progressoVisivel(v.currentTime / v.duration));
        if (Math.abs(v.currentTime - salva.current) > 2) {
          salva.current = v.currentTime;
          gravarPosicao(v.currentTime);
        }
      }
    };
    const fim = () => {
      if (v.muted) return;
      gravarPosicao(0);
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
    v.loop = false;
    v.muted = false;
    v.currentTime = de;
    setFase('tocando');
    void v.play().catch(() => setFase('pausado'));
  };

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
    <div className="vsl" onContextMenu={e => e.preventDefault()}>
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
