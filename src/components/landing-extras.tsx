import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, Check, Clapperboard, FileText, GraduationCap, KeyRound, Megaphone, MonitorPlay, Play, Power, Sparkles, Wallet, WandSparkles,
} from 'lucide-react';
import { Clip } from '@/components/clip';
import { siteConfig } from '@/lib/site-config';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True while the element is on screen. */
function useInView<T extends Element>(margin = '0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { rootMargin: margin });
    io.observe(node);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

/** Cycles 0..count-1 every `ms` while visible. Clicking a step restarts the timer. */
function useStepper(count: number, ms: number, active: boolean) {
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active || reduced()) return;
    const id = window.setTimeout(() => setStep(s => (s + 1) % count), ms);
    return () => window.clearTimeout(id);
  }, [step, tick, active, count, ms]);
  return [step, (s: number) => { setStep(s); setTick(t => t + 1); }] as const;
}

/* ───────────── Editando ao vivo ───────────── */

const liveSteps = [
  { title: 'Ouvindo a sua gravação.', note: 'A IA lê a fala inteira, palavra por palavra.' },
  { title: `Achei ${siteConfig.vslDemo.cuts} pausas e erros.`, note: 'Silêncio, "ééé" e a frase que travou.' },
  { title: `Cortei. ${siteConfig.vslDemo.rawLength} virou ${siteConfig.vslDemo.editedLength}.`, note: 'A fala fica corrida, sem buraco.' },
  { title: 'Legenda no tempo da sua fala.', note: 'Cada palavra acende quando você fala.' },
  { title: 'Pronto pra postar.', note: 'E você nem estava olhando.' },
];
const cutGroups: { from: number; to: number; label: string }[] = [
  { from: 9, to: 13, label: 'pausa 2,1 s' },
  { from: 22, to: 25, label: 'ééé' },
  { from: 33, to: 38, label: 'repetida' },
];
const bars = Array.from({ length: 48 }, (_, i) => ({
  h: (18 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.37)) * 72).toFixed(1),
  cut: cutGroups.find(g => i >= g.from && i <= g.to),
  first: cutGroups.find(g => g.from === i),
}));
const captionWords = ['Você', 'grava', 'do', 'seu', 'jeito', 'e', 'a', 'IA', 'edita'];

export function LiveDemo() {
  const [ref, inView] = useInView<HTMLDivElement>('-15% 0px');
  const [step, go] = useStepper(liveSteps.length, 2800, inView);
  const s = liveSteps[step] ?? liveSteps[0]!;
  return (
    <section className="section container" id="ao-vivo">
      <div className="section-heading reveal">
        <span className="eyebrow">Editando ao vivo</span>
        <h2>Veja a IA <em>trabalhando.</em></h2>
        <p>Uma gravação comum entra. Em cinco passos, sai um vídeo pronto, sem você abrir programa nenhum.</p>
      </div>
      <div ref={ref} className="live reveal" data-step={step}>
        <div className="live-phone">
          <Clip src={step >= 3 ? siteConfig.videos.cenas.aoVivoPronto : siteConfig.videos.cenas.aoVivoBruto} preset={step >= 3 ? 'pronto' : 'bruto'} opts={{ scene: 'studio', captions: step >= 3, zoom: step >= 4, offset: 0.5 }} />
          <span className={`live-badge ${step >= 4 ? 'done' : ''}`}>{step >= 4 ? '✓ Pronto' : '● Bruto'}</span>
        </div>
        <div className="live-panel">
          <div className="live-top">
            <span><i className="rec" />{step >= 4 ? 'Edição concluída' : 'Editando'}</span>
            <span className="live-time" key={step >= 2 ? 'b' : 'a'}>{step >= 2 ? siteConfig.vslDemo.editedLength : siteConfig.vslDemo.rawLength}</span>
          </div>
          <ol className="live-steps">
            {liveSteps.map((item, i) => (
              <li key={item.title} className={i === step ? 'on' : i < step ? 'done' : ''}>
                <button type="button" onClick={() => go(i)} aria-label={`Passo ${i + 1}: ${item.title}`}>
                  <span className="live-num">{i < step ? <Check size={11} /> : i + 1}</span>
                  <span className="live-bar"><i key={`${step}-${i}`} /></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="live-copy" key={step}>
            <strong>{s.title}</strong>
            <p>{s.note}</p>
          </div>
          <div className="live-track">
            <span className="live-label">Fala</span>
            <div className="live-wave">
              {bars.map((b, i) => (
                <span key={i} className={b.cut ? (step >= 2 ? 'cut gone' : step >= 1 ? 'cut' : '') : ''} style={{ height: `${b.h}%` }}>
                  {b.first && step === 1 && <em className="cut-tag">{b.first.label}</em>}
                </span>
              ))}
              {step === 0 && <i className="live-head" />}
            </div>
          </div>
          <div className="live-track">
            <span className="live-label">Legenda</span>
            <div className="live-caps">
              {captionWords.map((w, i) => (
                <span key={w + i} className={step >= 3 ? 'on' : ''} style={{ transitionDelay: `${i * 70}ms` }}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="illustration-note">{`Gravação real do vídeo de vendas: ${siteConfig.vslDemo.rawLength} de bruto viraram ${siteConfig.vslDemo.editedLength}. Os números mudam com cada gravação.`}</p>
    </section>
  );
}

/* ───────────── Sem x com o Modo Editor ───────────── */

const criteria = [
  ['Cortes', 'silêncio, gaguejada e tomada repetida saem'],
  ['Legenda', 'palavra por palavra, no tempo da fala'],
  ['Zoom', 'aproxima quando você enfatiza'],
  ['Fundo e cor', 'cenário e cor no padrão que você pedir'],
  ['Trilha', 'baixinha por baixo da voz, efeito nos cortes'],
] as const;

export function ModeSwitch() {
  // alterna sozinho entre a gravação crua e a editada; o toque no botão troca na hora e o ciclo continua
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced()) return;
    const id = window.setTimeout(() => setOn(v => !v), on ? 4500 : 3000);
    return () => window.clearTimeout(id);
  }, [on]);
  return (
    <section className="section container" id="diferenca">
      <div className="section-heading reveal">
        <span className="eyebrow">A diferença</span>
        <h2>Mesma IA. <em>Outro resultado.</em></h2>
        <p>Sozinha, a IA chuta como você quer o vídeo. Com o Modo Editor, ela já começa sabendo.</p>
      </div>
      <div className="reveal"><div className={`mode ${on ? 'is-on' : ''}`}>
        <div className="mode-head">
          <div className="mode-request"><small>Seu pedido</small>“Edita esse vídeo e deixa bonito.”</div>
          <button type="button" className="mode-toggle" role="switch" aria-checked={on} onClick={() => setOn(v => !v)}>
            <Power size={13} /> Modo Editor <span className="mode-knob"><i /></span> <b>{on ? 'ligado' : 'desligado'}</b>
          </button>
        </div>
        <div className="mode-body">
          <div className="mode-phone">
            <div className={`mode-camada ${on ? '' : 'ativa'}`}><Clip src={siteConfig.videos.cenas.cruModo} preset="bruto" label="Gravação crua, sem edição" /></div>
            <div className={`mode-camada ${on ? 'ativa' : ''}`}><Clip src={siteConfig.videos.cenas.comModo} preset="pronto" label="Vídeo editado com o Modo Editor" /></div>
            <span className={`live-badge ${on ? 'done' : ''}`}>{on ? '✓ Editado' : '● Cru'}</span>
          </div>
          <ul className="mode-list">
            {criteria.map(([title, copy], i) => (
              <li key={title} style={{ transitionDelay: on ? `${i * 90}ms` : '0ms' }}>
                <span className="mode-check">{on ? <Check size={12} /> : '?'}</span>
                <div><strong>{title}</strong><p>{on ? copy : 'a IA adivinha'}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mode-foot"><span>{on ? 5 : 0}/5</span> critérios de edição {on ? 'definidos' : 'no chute'}</div>
      </div></div>
    </section>
  );
}

/* ───────────── Para quem é ───────────── */

const personas = [
  { icon: Clapperboard, title: 'Quem cria conteúdo', copy: 'Grava no domingo e só posta na quinta.' },
  { icon: Megaphone, title: 'Quem anuncia', copy: 'Precisa de criativo novo toda semana.' },
  { icon: GraduationCap, title: 'Quem ensina', copy: 'Tem aula gravada esperando edição.' },
  { icon: Wallet, title: 'Quem paga editor', copy: 'Paga caro e ainda espera dias.' },
] as const;

export function ForWho() {
  return (
    <section className="section container" id="para-quem">
      <div className="section-heading reveal">
        <span className="eyebrow">Para quem é</span>
        <h2>A ideia você já tem. <em>Falta a edição sair.</em></h2>
      </div>
      <div className="reveal"><div className="publico">
        {personas.map(p => (
          <div key={p.title} className="publico-item">
            <span className="publico-icon"><p.icon size={18} /></span>
            <div><strong>{p.title}</strong><p>{p.copy}</p></div>
          </div>
        ))}
      </div></div>
    </section>
  );
}

/* ───────────── Pedidos que funcionam ───────────── */

/** Conversas de exemplo: o pedido em português e o que a IA responde. O vídeo do fim é um efeito real feito pela IA. */
const conversas = [
  { pedido: 'Corta as pausas e os “ééé”, coloca legenda palavra por palavra e deixa o ritmo rápido', passos: ['Ouvi a gravação inteira', 'Tirei as pausas e as repetições', 'Legenda no tempo da sua fala'], video: '/videos/cenas/legenda.mp4' },
  { pedido: 'Troca meu fundo por um cenário de estúdio e dá zoom quando eu falar mais forte', passos: ['Recortei você do fundo', 'Cenário novo atrás de você', 'Zoom nas partes fortes'], video: '/videos/cenas/cenario.mp4' },
  { pedido: 'Deixa com cor de cinema, faixas pretas e uma trilha calma bem baixinha', passos: ['Cor de cinema na imagem', 'Faixas pretas em cima e embaixo', 'Trilha baixinha por baixo da voz'], video: '/videos/cenas/cinema.mp4' },
];

export function RequestLibrary() {
  // 0 digitando · 1 enviado · 2, 3, 4 a IA trabalhando (um passo cada) · 5 pronto
  const [ref, visivel] = useInView<HTMLDivElement>('200px 0px');
  const [i, setI] = useState(0);
  const [chars, setChars] = useState(0);
  const [fase, setFase] = useState(0);
  const c = conversas[i] ?? conversas[0]!;
  useEffect(() => {
    if (reduced()) { setChars(c.pedido.length); setFase(5); return; }
    if (!visivel) return;
    let id: number;
    if (fase === 0) id = chars < c.pedido.length ? window.setTimeout(() => setChars(n => n + 1), 30) : window.setTimeout(() => setFase(1), 450);
    else if (fase < 5) id = window.setTimeout(() => setFase(f => f + 1), fase === 1 ? 700 : 900);
    else id = window.setTimeout(() => { setI(n => (n + 1) % conversas.length); setChars(0); setFase(0); }, 5000);
    return () => window.clearTimeout(id);
  }, [visivel, fase, chars, c.pedido.length]);
  return (
    <section className="section container" id="pedidos">
      <div className="section-heading reveal">
        <span className="eyebrow">Exemplos de pedido</span>
        <h2>Escreva como <em>você fala.</em></h2>
        <p>Nada de termo técnico: você manda a gravação e pede, como numa conversa. Se preferir, o Gerador de Pedido monta o pedido pra você.</p>
      </div>
      <div className="reveal"><div className="ia-chat" ref={ref}>
        <div className="ia-topo"><span className="ia-avatar"><Sparkles size={12} /></span><strong>Sua IA</strong><small>ChatGPT ou Claude · Modo Editor ativo</small></div>
        <div className="ia-conversa" aria-live="polite">
          {fase === 0 && <p className="ia-vazio">Mande a gravação e diga o que quer.</p>}
          {fase >= 1 && (
            <div className="ia-eu" key={`eu-${i}`}>
              <div className="ia-anexo"><Play size={14} /><div><strong>gravacao.mp4</strong><small>vídeo</small></div></div>
              <p>{c.pedido}</p>
            </div>
          )}
          {fase >= 2 && (
            <div className="ia-ela" key={`ela-${i}`}>
              <span className="ia-avatar"><Sparkles size={12} /></span>
              <div>
                <ul className="ia-passos">
                  {c.passos.map((p, k) => fase >= 2 + k && (
                    <li key={p} className={fase > 2 + k ? 'ok' : ''}>{fase > 2 + k ? <Check size={11} /> : <i className="ia-girando" />}{p}</li>
                  ))}
                </ul>
                {fase >= 5 && (
                  <div className="ia-pronto">
                    <div className="ia-video"><Clip src={c.video} label="Vídeo editado pela IA" /></div>
                    <p><strong>Pronto!</strong> Seu vídeo está editado. Quer mudar alguma coisa?</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="ia-entrada">
          <span className={fase === 0 ? '' : 'vazio'}>{fase === 0 ? <>{c.pedido.slice(0, chars)}<i className="caret" /></> : 'Mensagem para a IA'}</span>
          <span className="ia-enviar" aria-hidden="true"><ArrowUp size={14} /></span>
        </div>
      </div></div>
    </section>
  );
}

/* ───────────── O que você recebe ───────────── */

export function WhatYouGet() {
  return (
    <section className="section container" id="recebe">
      <div className="section-heading reveal">
        <span className="eyebrow">O que você recebe</span>
        <h2>Não é só um arquivo. <em>É o caminho inteiro.</em></h2>
        <p>Você entra na área de membros e encontra tudo pra editar o seu primeiro vídeo com IA ainda hoje.</p>
      </div>
      <div className="reveal"><div className="unbox">
        <div className="unbox-mail"><KeyRound size={18} /><div><strong>Acesso na hora à área de membros</strong><small>o login chega no seu e-mail assim que o pagamento é aprovado</small></div></div>
        <div className="unbox-files">
          <div className="unbox-file principal">
            <span className="unbox-icon unbox-marca" aria-hidden="true"><span className="brand-icon"><Play /><span className="brand-dot" /></span></span>
            <div><strong>Modo Editor <em>o coração</em></strong><p>O arquivo que transforma o seu ChatGPT ou Claude num editor de vídeo profissional: corta os erros e as pausas, legenda, coloca zoom, efeitos e trilha, e confere tudo antes de entregar.</p></div>
          </div>
          <div className="unbox-file"><span className="unbox-icon"><MonitorPlay size={20} /></span><div><strong>Videoaulas curtas</strong><p>Tutoriais direto ao ponto: preparar o computador, instalar o Modo Editor, montar o pedido e editar o seu primeiro vídeo, mostrado tela por tela.</p></div></div>
          <div className="unbox-file"><span className="unbox-icon"><WandSparkles size={20} /></span><div><strong>Gerador de Pedido</strong><p>Você clica nas opções (estilo, legenda, efeitos, trilha) e ele monta o pedido completo pra IA. Dá até pra explicar em áudio.</p></div></div>
          <div className="unbox-file bonus"><span className="unbox-icon"><FileText size={20} /></span><div><strong>O Arquivo Secreto do Roteiro <em>bônus</em></strong><p>Antes de gravar, a IA revisa o seu roteiro: gancho forte, fala clara e chamada final.</p></div></div>
        </div>
        <div className="unbox-works"><span>Funciona no</span><b>ChatGPT</b><span>e no</span><b>Claude</b><small>plano pago, contratado à parte</small></div>
      </div></div>
    </section>
  );
}

/* ───────────── Quem está por trás (foto e a história do produtor) ───────────── */

export function Creator({ name, photo }: { name: string; photo: string }) {
  if (!photo) return null;
  return (
    <section className="section container produtor" id="quem">
      <div className="produtor-foto reveal">
        <img src={photo} alt={`${name}, criador do Modo Editor`} width={820} height={1024} loading="lazy" decoding="async" />
        <span className="produtor-tag"><i className="record-dot" />Criador do Modo Editor</span>
      </div>
      <div className="produtor-texto reveal">
        <span className="eyebrow">Quem está por trás</span>
        <h2>Prazer, eu sou o <em>{name}.</em></h2>
        <p className="produtor-cargo">Creator e estrategista de IA</p>
        <p>Empreendo desde 2021 e, nesse tempo todo, nunca parei de produzir conteúdo. Sempre estive ativo na internet, e todo vídeo esbarrava no mesmo problema: ou eu editava na mão, ou pagava um editor e ficava esperando.</p>
        <p>Quando a IA abriu essa possibilidade, comecei a testar na minha própria operação. Validei, ajustei e uso até hoje. Os vídeos desta página foram editados assim.</p>
        <p>Aí os meus alunos começaram a pedir pra aprender do mesmo jeito. Foi daí que nasceu o Modo Editor: tudo o que eu sei de edição com IA, no método que eu uso todos os dias.</p>
      </div>
    </section>
  );
}

/** Fades in every `.reveal` element the first time it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (typeof IntersectionObserver === 'undefined' || reduced()) { nodes.forEach(n => n.classList.add('in')); return; }
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px 12% 0px' });
    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
}
