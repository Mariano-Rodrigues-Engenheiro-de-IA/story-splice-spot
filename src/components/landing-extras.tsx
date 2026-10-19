import { useEffect, useRef, useState } from 'react';
import {
  Check, Clapperboard, Copy, FileArchive, FileText, GraduationCap, Mail, Megaphone, Play, Power, Sparkles, Timer, Wallet,
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
  const [ref, inView] = useInView<HTMLDivElement>('-20% 0px');
  const [touched, setTouched] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!inView || touched || reduced()) return;
    const id = window.setTimeout(() => setOn(v => !v), on ? 4200 : 2600);
    return () => window.clearTimeout(id);
  }, [inView, touched, on]);
  return (
    <section className="section container" id="diferenca">
      <div className="section-heading reveal">
        <span className="eyebrow">A diferença</span>
        <h2>Mesma IA. <em>Outro resultado.</em></h2>
        <p>Sozinha, a IA chuta como você quer o vídeo. Com o Modo Editor, ela já começa sabendo.</p>
      </div>
      <div className="reveal"><div ref={ref} className={`mode ${on ? 'is-on' : ''}`}>
        <div className="mode-head">
          <div className="mode-request"><small>Seu pedido</small>“Edita esse vídeo e deixa bonito.”</div>
          <button type="button" className="mode-toggle" role="switch" aria-checked={on} onClick={() => { setTouched(true); setOn(v => !v); }}>
            <Power size={13} /> Modo Editor <span className="mode-knob"><i /></span> <b>{on ? 'ligado' : 'desligado'}</b>
          </button>
        </div>
        <div className="mode-body">
          <div className="mode-phone"><Clip src={on ? siteConfig.videos.cenas.comModo : siteConfig.videos.cenas.semModo} preset={on ? 'pronto' : 'bruto'} opts={{ scene: 'blue', offset: 3 }} /></div>
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
  { icon: Clapperboard, title: 'Quem cria conteúdo', copy: 'Você grava no domingo e o vídeo só sai na quinta, quando sobra tempo.', art: 'files' },
  { icon: Megaphone, title: 'Quem anuncia', copy: 'O criativo cansa em poucos dias e o próximo depende de alguém editar.', art: 'ads' },
  { icon: GraduationCap, title: 'Quem ensina', copy: 'Você explica bem falando. Falta o vídeo mostrar o que você disse.', art: 'class' },
  { icon: Wallet, title: 'Quem paga editor', copy: 'O vídeo vai, a fatura vem e você fica esperando ele voltar.', art: 'wait' },
] as const;

function PersonaArt({ type }: { type: string }) {
  if (type === 'files') return (
    <div className="pa-list"><small>Sua pasta de gravações</small>
      {['gravacao_07.mov', 'gravacao_06.mov', 'gravacao_05.mov'].map((f, i) => <span key={f} style={{ animationDelay: `${i * 0.9}s` }}><FileText size={11} />{f}<em>esperando</em><b>✓ editado</b></span>)}
    </div>
  );
  if (type === 'ads') return (
    <div className="pa-list"><small>Seus anúncios</small>
      <span className="worn"><Megaphone size={11} />Anúncio 1<em className="bad">cansou</em></span>
      <span className="worn"><Megaphone size={11} />Anúncio 2<em className="bad">cansou</em></span>
      <span style={{ animationDelay: '0s' }}><Megaphone size={11} />Anúncio novo<em>esperando edição</em><b>✓ no ar</b></span>
    </div>
  );
  if (type === 'class') return (
    <div className="pa-list"><small>Sua aula gravada</small>
      <div className="pa-tags">{['legenda', 'zoom', 'destaque'].map((t, i) => <span key={t} style={{ animationDelay: `${i * 0.5}s` }}>✓ {t}</span>)}</div>
    </div>
  );
  return <div className="pa-wait"><Timer size={16} /><span>esperando o editor<i>…</i></span><b>✓ pronto com a IA</b></div>;
}

export function ForWho() {
  return (
    <section className="section container" id="para-quem">
      <div className="section-heading reveal">
        <span className="eyebrow">Para quem é</span>
        <h2>A ideia você já tem. <em>Falta a edição sair.</em></h2>
        <p>Se uma dessas cenas é a sua semana, o Modo Editor foi feito pra você.</p>
      </div>
      <div className="personas">
        {personas.map(p => (
          <article key={p.title} className="persona reveal">
            <div className="persona-art"><PersonaArt type={p.art} /></div>
            <p.icon className="feature-icon" />
            <h3>{p.title}</h3>
            <p>{p.copy}</p>
          </article>
        ))}
      </div>
      <p className="persona-close reveal">Em todos os casos, a edição sai da sua agenda e vai pra sua IA.</p>
    </section>
  );
}

/* ───────────── Pedidos que funcionam ───────────── */

const requestExamples = [
  'Corta as pausas e deixa o ritmo rápido',
  'Tira os “é”, os “ãã” e as frases repetidas',
  'Coloca legenda palavra por palavra, branca e grande',
  'Dá zoom quando eu falar mais forte',
  'Troca o fundo por um escritório moderno',
  'Põe a frase principal escrita no topo',
  'Cor quente com faixas pretas, estilo cinema',
  'Trilha calma bem baixinha por baixo da voz',
];

export function RequestLibrary() {
  const [pick, setPick] = useState(0);
  const [phase, setPhase] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setPhase(0); setCopied(false);
    if (reduced()) { setPhase(2); return; }
    const a = window.setTimeout(() => setPhase(1), 700);
    const b = window.setTimeout(() => setPhase(2), 2000);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [pick]);
  const text = requestExamples[pick] ?? '';
  const copy = () => { void navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => undefined); };
  return (
    <section className="section container" id="pedidos">
      <div className="section-heading reveal">
        <span className="eyebrow">Exemplos de pedido</span>
        <h2>Escreva como <em>você fala.</em></h2>
        <p>Nada de termo técnico. Toque num pedido e veja como ele fica na conversa.</p>
      </div>
      <div className="requests reveal">
        <div className="request-chips" role="list">
          {requestExamples.map((r, i) => (
            <button key={r} type="button" role="listitem" className={i === pick ? 'on' : ''} onClick={() => setPick(i)}>{r}</button>
          ))}
        </div>
        <div className="chat-window request-chat">
          <div className="chat-header"><i className="chat-dot" /><i className="chat-dot" /><i className="chat-dot" /><span>Sua IA · ChatGPT ou Claude</span></div>
          <div className="chat-body">
            <div className="file-bubble"><Play className="file-icon" /><div><strong>gravacao.mp4</strong><small>vídeo</small></div></div>
            <div className="chat-prompt" key={pick}>{text}</div>
            <div className={`chat-success request-reply ${phase >= 1 ? 'on' : ''}`}>
              {phase >= 2 ? <><Check size={12} /> Vídeo pronto. Quer mudar alguma coisa?</> : <><Sparkles size={12} /> Editando…</>}
            </div>
          </div>
          <button type="button" className="request-copy" onClick={copy}>{copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar pedido</>}</button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── O que você recebe ───────────── */

export function WhatYouGet() {
  const [ref, inView] = useInView<HTMLDivElement>('-20% 0px');
  return (
    <section className="section container" id="recebe">
      <div className="section-heading reveal">
        <span className="eyebrow">O que você recebe</span>
        <h2>Chega no seu e-mail. <em>Você usa hoje.</em></h2>
        <p>Dois arquivos. Você solta na conversa da sua IA e começa a pedir.</p>
      </div>
      <div className="reveal"><div ref={ref} className={`unbox ${inView ? 'open' : ''}`}>
        <div className="unbox-mail"><Mail size={18} /><div><strong>Seu acesso ao Modo Editor</strong><small>chega assim que o pagamento é aprovado</small></div></div>
        <div className="unbox-files">
          <div className="unbox-file"><span className="unbox-icon"><FileArchive size={20} /></span><div><strong>Modo Editor</strong><p>O arquivo que faz a sua IA cortar, legendar e animar seus vídeos.</p></div></div>
          <div className="unbox-file bonus"><span className="unbox-icon"><FileText size={20} /></span><div><strong>O Arquivo Secreto do Roteiro <em>bônus</em></strong><p>Revisa o roteiro antes de gravar: gancho, clareza e chamada final.</p></div></div>
        </div>
        <div className="unbox-works"><span>Funciona no</span><b>ChatGPT</b><span>e no</span><b>Claude</b><small>plano pago, contratado à parte</small></div>
      </div></div>
    </section>
  );
}

/* ───────────── Quem grava (only with a real video of the owner) ───────────── */

export function Creator({ name, video }: { name: string; video: string }) {
  if (!video) return null;
  return (
    <section className="section container creator" id="quem">
      <div className="creator-video reveal"><Clip src={video} label={`Vídeo de ${name}`} /></div>
      <div className="creator-copy reveal">
        <span className="eyebrow">Quem grava</span>
        <h2>Os vídeos desta página <em>são meus.</em></h2>
        <p>Eu gravei cada um deles no celular e mandei pra IA com o Modo Editor. A edição é dela.</p>
        <strong>{name}</strong>
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
