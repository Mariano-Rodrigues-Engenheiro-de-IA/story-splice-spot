import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, Brain, Check, ShieldCheck, Clapperboard, FileText, GraduationCap, KeyRound, MonitorPlay, Play, Power, Ruler, Salad, Smile, Sparkles, Stethoscope, WandSparkles,
} from 'lucide-react';
import { Clip } from '@/components/clip';
import { siteConfig } from '@/lib/site-config';
import { nichos, type Nicho } from '@/lib/nichos';

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
        <span className="eyebrow">Quanto tempo leva?</span>
        <h2>Você grava em 10 minutos. <em>A IA edita enquanto você atende.</em></h2>
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

/** O que muda no vídeo com e sem o Modo Editor, dito como o profissional vê no vídeo pronto. */
const criteria = [
  ['Os erros somem', 'a pausa em que você pensou, o "éééé" e a frase que você repetiu saem; a fala fica limpa'],
  ['A explicação aparece na tela', 'quando você fala "três sinais", os três sinais acendem em lista; quando fala do dente, o dente aparece'],
  ['Legenda certa', 'cada palavra entra na hora em que você fala, pra quem assiste sem som'],
  ['Título com a dúvida do paciente', 'a pergunta que ele faz no consultório vira o título grande do vídeo'],
  ['Som e enquadramento', 'a câmera aproxima quando você enfatiza, a música fica baixinha por baixo da voz'],
] as const;

export function ModeSwitch() {
  // alterna sozinho entre a gravação crua e a editada; o toque no botão troca na hora e o ciclo continua
  const [on, setOn] = useState(false);
  const tela = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced()) return;
    const id = window.setTimeout(() => setOn(v => !v), on ? 4500 : 3000);
    return () => window.clearTimeout(id);
  }, [on]);
  // só o vídeo que está à mostra toca: o escondido fica pausado para não gastar o celular à toa
  useEffect(() => {
    const camadas = Array.from(tela.current?.querySelectorAll<HTMLElement>('.mode-camada') ?? []);
    const pausaEscondido = (e: Event) => { const v = e.target as HTMLVideoElement; if (!v.closest('.mode-camada.ativa')) v.pause(); };
    const videos = camadas.map(c => c.querySelector('video')).filter((v): v is HTMLVideoElement => !!v);
    videos.forEach(v => { v.addEventListener('play', pausaEscondido); if (v.closest('.mode-camada.ativa')) { if (v.src) void v.play().catch(() => undefined); } else v.pause(); });
    return () => videos.forEach(v => v.removeEventListener('play', pausaEscondido));
  }, [on]);
  return (
    <section className="section container" id="diferenca">
      <div className="section-heading reveal">
        <span className="eyebrow">E se eu só pedir pra IA, sem o Modo Editor?</span>
        <h2>Sozinha, ela chuta. <em>Com o Modo Editor, ela sabe.</em></h2>
        <p>Se você pedir "edita esse vídeo" pro ChatGPT ou pro Claude, ele devolve qualquer coisa. O Modo Editor é o treinamento que você coloca nele uma vez: depois disso ele edita como um editor que entende de vídeo de consultório. Toque no botão e compare.</p>
      </div>
      <div className="reveal"><div className={`mode ${on ? 'is-on' : ''}`}>
        <div className="mode-head">
          <div className="mode-request"><small>Seu pedido</small>“Edita esse vídeo e deixa bonito.”</div>
          <button type="button" className="mode-toggle" role="switch" aria-checked={on} onClick={() => setOn(v => !v)}>
            <Power size={13} /> Modo Editor <span className="mode-knob"><i /></span> <b>{on ? 'ligado' : 'desligado'}</b>
          </button>
        </div>
        <div className="mode-body">
          <div className="mode-phone" ref={tela}>
            <div className={`mode-camada ${on ? '' : 'ativa'}`}><Clip src={siteConfig.videos.cenas.cruModo} preset="bruto" label="Gravação crua, sem edição" /></div>
            <div className={`mode-camada ${on ? 'ativa' : ''}`}><Clip src={siteConfig.videos.cenas.comModo} preset="pronto" label="Vídeo editado com o Modo Editor" /></div>
            <span className={`live-badge ${on ? 'done' : ''}`}>{on ? '✓ Editado' : '● Cru'}</span>
          </div>
          <ul className="mode-list">
            {criteria.map(([title, copy], i) => (
              <li key={title} style={{ transitionDelay: on ? `${i * 90}ms` : '0ms' }}>
                <span className="mode-check">{on ? <Check size={12} /> : '?'}</span>
                <div><strong>{title}</strong><p>{on ? copy : 'a IA não sabe o que você quer e chuta'}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mode-foot"><span>{on ? 5 : 0}/5</span> {on ? 'coisas que o vídeo pronto tem' : 'coisas que o vídeo pronto tem (a IA sozinha não faz nenhuma)'}</div>
      </div></div>
    </section>
  );
}

/* ───────────── Para quem é ───────────── */

/** Cada cartão é uma profissão que grava explicando o que faz. Com `?p=`, o cartão da profissão vem primeiro, em destaque. */
const personas = [
  { icon: Brain, title: 'Psicólogos e terapeutas', copy: 'Explica o mesmo padrão dez vezes por dia. No vídeo, ninguém vê.' },
  { icon: Smile, title: 'Dentistas', copy: 'O paciente só entende o tratamento quando enxerga o dente.' },
  { icon: Stethoscope, title: 'Fisioterapeutas e personais', copy: 'A coluna, o músculo, o movimento certo: tem que aparecer.' },
  { icon: Salad, title: 'Nutricionistas', copy: 'O prato, a troca, a quantidade. Falado, some; na tela, fica.' },
  { icon: Sparkles, title: 'Clínicas de estética', copy: 'O antes e depois é a sua prova. Precisa sair bonito e rápido.' },
  { icon: Ruler, title: 'Arquitetos e corretores', copy: 'O cliente precisa ver o espaço, a medida, a mudança.' },
  { icon: GraduationCap, title: 'Quem ensina', copy: 'Tem aula gravada esperando edição.' },
  { icon: Clapperboard, title: 'Quem cria conteúdo e anuncia', copy: 'Grava no domingo e só posta na quinta.' },
] as const;

export function ForWho({ destaque = '' }: { destaque?: string }) {
  const lista = [...personas].sort((a, b) => Number(b.title === destaque) - Number(a.title === destaque));
  return (
    <section className="section container" id="para-quem">
      <div className="section-heading reveal">
        <span className="eyebrow">É pra mim?</span>
        <h2>Se você explica o seu trabalho pra alguém, <em>é pra você.</em></h2>
        <p>Preparado pra quem atende paciente e cliente e precisa postar toda semana, mesmo com a agenda cheia.</p>
      </div>
      <div className="reveal"><div className="publico publico-8">
        {lista.map(p => (
          <div key={p.title} className={`publico-item ${p.title === destaque ? 'em-destaque' : ''}`}>
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
  { quem: 'Dentista', pedido: 'Corta as pausas, coloca legenda e, quando eu explicar a cárie, mostra o dente em corte do lado da minha cabeça', passos: ['Ouvi a gravação inteira e tirei as pausas', 'Achei o trecho em que você explica a cárie', 'Dente em corte ao lado de você, no tempo da fala'], video: '/videos/cenas/dente.mp4' },
  { quem: 'Psicóloga', pedido: 'Tira os meus "éééé", coloca o título "Parece grosseria, pode ser ansiedade" e, quando eu falar dos três sinais, mostra eles em lista', passos: ['Tirei as pausas e os "éééé"', 'Título grande no topo', 'Os três sinais acendem um a um enquanto você fala'], video: '/videos/cenas/titulo.mp4' },
  { quem: 'Fisioterapeuta', pedido: 'Legenda palavra por palavra e, quando eu falar do disco entre as vértebras, mostra a coluna em 3D sobre o meu tronco', passos: ['Legenda no tempo da sua fala', 'Achei o trecho do disco', 'Coluna em 3D sobre você, só nesse trecho'], video: '/videos/cenas/cerebro.mp4' },
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
        <span className="eyebrow">Como eu peço?</span>
        <h2>Do jeito que você pediria <em>a um editor.</em></h2>
        <p>Em português, sem termo técnico. Veja três pedidos reais de consultório e o que a IA faz com cada um. Se não souber o que pedir, o Gerador de Pedido monta o texto pra você em cliques.</p>
      </div>
      <div className="reveal"><div className="ia-chat" ref={ref}>
        <div className="ia-topo"><span className="ia-avatar"><Sparkles size={12} /></span><strong>Sua IA</strong><small>ChatGPT ou Claude · Modo Editor ativo</small></div>
        <div className="ia-conversa" aria-live="polite">
          {fase === 0 && <p className="ia-vazio">{c.quem} mandando a gravação e o pedido…</p>}
          {fase >= 1 && (
            <div className="ia-eu" key={`eu-${i}`}>
              <div className="ia-anexo"><Play size={14} /><div><strong>gravacao.mp4</strong><small>{c.quem} · gravado no celular</small></div></div>
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
        <span className="eyebrow">O que eu recebo?</span>
        <h2>Você entra hoje <em>e edita o primeiro vídeo hoje.</em></h2>
        <p>Não é um curso de edição. É um passo a passo curto, com a sua IA já preparada pra editar vídeo de consultório.</p>
      </div>
      <div className="reveal"><div className="unbox">
        <div className="unbox-mail"><KeyRound size={18} /><div><strong>Acesso na hora</strong><small>o login da área de membros chega no seu e-mail assim que o pagamento é aprovado</small></div></div>
        <div className="unbox-files">
          <div className="unbox-file"><span className="unbox-icon"><MonitorPlay size={20} /></span><div><strong>1 · Videoaulas que te guiam do zero</strong><p>Curtas e tela por tela: como preparar o computador, como colocar o Modo Editor na sua IA e como editar o seu primeiro vídeo. Quem nunca mexeu com IA acompanha.</p></div></div>
          <div className="unbox-file principal">
            <span className="unbox-icon unbox-marca" aria-hidden="true"><span className="brand-icon"><Play /><span className="brand-dot" /></span></span>
            <div><strong>2 · O Modo Editor <em>o treinamento da sua IA</em></strong><p>Você coloca na sua IA uma vez, seguindo a aula. A partir daí ela passa a editar como um editor que entende de consultório: corta os erros, legenda, coloca o título com a dúvida do paciente, mostra a anatomia e o antes e depois na tela. Pronto pra psicólogo, dentista, nutri, fisio, estética e arquiteto.</p></div>
          </div>
          <div className="unbox-file"><span className="unbox-icon"><WandSparkles size={20} /></span><div><strong>3 · Gerador de Pedido</strong><p>Se você não souber o que pedir, clica nas opções (legenda, título, o que mostrar na tela) e ele escreve o pedido pra você colar na IA. Dá até pra explicar por áudio.</p></div></div>
          <div className="unbox-file"><span className="unbox-icon"><Sparkles size={20} /></span><div><strong>4 · Suporte no WhatsApp</strong><p>Travou na instalação ou no primeiro vídeo? Você fala com a gente e resolve.</p></div></div>
          <div className="unbox-file bonus"><span className="unbox-icon"><FileText size={20} /></span><div><strong>Bônus · Revisão do roteiro</strong><p>Antes de gravar, você cola o que vai falar e a IA devolve com um começo mais forte e um final que chama o paciente pra agendar.</p></div></div>
        </div>
        <div className="unbox-works"><span>Funciona no</span><b>ChatGPT</b><span>e no</span><b>Claude</b><small>você usa a assinatura que já tem (plano pago, a partir de US$ 20/mês, contratado direto com eles)</small></div>
      </div></div>
    </section>
  );
}


/* ───────────── O que eu vou conseguir postar? (por profissão) ───────────── */

/** A pessoa escolhe a profissão e vê 4 vídeos que pode gravar esta semana: a pergunta do paciente, o que ela fala,
 *  o que a IA coloca na tela. Com ?p= a profissão já vem escolhida. */
export function OQueVouPostar({ inicial }: { inicial: Nicho }) {
  const lista = nichos.filter(n => n.ideias.length);
  const [slug, setSlug] = useState(inicial.ideias.length ? inicial.slug : 'psicologo');
  const n = lista.find(x => x.slug === slug) ?? lista[0]!;
  return (
    <section className="section container" id="postar">
      <div className="section-heading reveal">
        <span className="eyebrow">O que eu vou conseguir postar?</span>
        <h2>Quatro vídeos que você grava <em>esta semana.</em></h2>
        <p>Você grava respondendo a pergunta que o paciente faz no consultório. A IA coloca a resposta na tela. Escolha a sua profissão:</p>
      </div>
      <div className="reveal">
        <div className="prof-chips" role="tablist" aria-label="Profissão">
          {lista.map(x => <button key={x.slug} type="button" role="tab" aria-selected={x.slug === n.slug} className={x.slug === n.slug ? 'on' : ''} onClick={() => setSlug(x.slug)}>{x.nome}</button>)}
        </div>
        <div className="ideias" key={n.slug}>
          {n.ideias.map((v, i) => (
            <article className="ideia" key={v.pergunta} style={{ animationDelay: `${i * 70}ms` }}>
              <span className="ideia-num">Vídeo {i + 1}</span>
              <h3>“{v.pergunta}”</h3>
              <dl>
                <div><dt>Você fala</dt><dd>{v.fala}</dd></div>
                <div><dt>A IA coloca na tela</dt><dd>{v.tela}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        {n.regra && <p className="regra"><ShieldCheck size={16} /><span><strong>Dentro das regras do seu conselho.</strong> {n.regra}</span></p>}
      </div>
    </section>
  );
}

/* ───────────── Entenda em 30 segundos ───────────── */

/** O que a pessoa está comprando, dito de uma vez, pra quem nunca ouviu falar de IA editando vídeo. */
export function Entenda() {
  const passos = [
    ['Você já tem a ferramenta', 'O ChatGPT ou o Claude, no plano pago. É a mesma IA que você usa pra tirar dúvida. Se ainda não tem, assina direto com eles.'],
    ['Você coloca o Modo Editor nela, uma vez', 'É um treinamento pronto. Você segue a aula de 5 minutos e a sua IA passa a saber editar vídeo de consultório: cortar, legendar, mostrar a anatomia e o antes e depois na tela.'],
    ['Daí em diante, você só grava e pede', 'Grava no celular, manda a gravação pra sua IA e pede em português. Ela edita e devolve pronto pra postar. Quantos vídeos você quiser, sem pagar por vídeo.'],
  ] as const;
  return (
    <section className="section container" id="entenda">
      <div className="section-heading reveal">
        <span className="eyebrow">Como isso funciona?</span>
        <h2>Sua IA vira <em>o seu editor de vídeo.</em></h2>
        <p>Em três passos. Sem programa de edição, sem contratar ninguém.</p>
      </div>
      <div className="reveal"><ol className="entenda">
        {passos.map(([t, c], i) => (
          <li key={t}><span className="entenda-num">{i + 1}</span><div><strong>{t}</strong><p>{c}</p></div></li>
        ))}
      </ol></div>
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
        <span className="eyebrow">Quem está por trás disso?</span>
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
