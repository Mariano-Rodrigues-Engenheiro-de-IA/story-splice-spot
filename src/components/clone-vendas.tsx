import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock, Download, EyeOff, GraduationCap, Heart, Loader2, Lock, Megaphone, MessageCircle, Mic, PenLine, Play, ScanFace, Send, Stethoscope, Video, VideoOff, Volume2, Wallet, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { brl, useNaTelaClone, usePertoClone } from '@/components/clone-oferta';
import { cliqueComprar, evento, eventoProprio, linkCheckout } from '@/lib/pixel';
import { siteConfig } from '@/lib/site-config';

/* Seções só da página de vendas do Modo Clone (/clone), 24/11/2026. A página nasceu da /obrigado (galeria, lado a lado,
   você escreve, por dentro, uma gravação, pergunte ao clone) e aqui ganhou o que faltava para vender para quem nunca ouviu
   falar: a dor, como funciona em 3 passos, o cuidado para não sair com cara de robô, o que dá para gravar, para quem é,
   quem criou, o que recebe, oferta completa, dúvidas e fecho. A copy parte dos roteiros aprovados (recado do upsell e
   ROTEIRO-VENDAS-CLONE-v1) e do que as 3 aulas ensinam. Regras dele: frase com "você", sem nome da ferramenta, sem prometer
   resultado, letra mínima de 12 px, nada pula ao rolar (alturas fixas), animação só em CSS (o JS só liga a classe). */

/* ───────── Botão de compra ───────── */

/** De onde veio o clique de compra (para o pixel): barra fixa, ou a seção onde o botão está. */
function localDoBotao(el: HTMLElement) {
  if (el.closest('.sticky-bar')) return 'barra-fixa';
  return el.closest('section')?.id || 'meio';
}

/** Acima da oferta ele desce até o preço (a pessoa vê o pacote e a garantia antes de pagar); o da oferta e o do fim abrem
 *  o checkout da Kiwify com as UTMs de quem chegou. */
export function BotaoClone({ texto, destino = 'oferta', classe = '' }: { texto: string; destino?: 'oferta' | 'checkout'; classe?: string }) {
  const [abrindo, setAbrindo] = useState(false);
  useEffect(() => {
    const volta = () => setAbrindo(false); // voltou do checkout pelo botão de voltar
    window.addEventListener('pageshow', volta);
    return () => window.removeEventListener('pageshow', volta);
  }, []);
  const { checkoutUrl } = siteConfig.clone.vendas;
  if (destino === 'oferta' || !checkoutUrl)
    return <a href="#oferta-clone" className={`cv-botao ${classe}`} onClick={e => eventoProprio('IrParaOferta', { local: localDoBotao(e.currentTarget) }, false)}>{texto} <ArrowRight aria-hidden="true" /></a>;
  return <a href={checkoutUrl} className={`cv-botao ${abrindo ? 'abrindo' : ''} ${classe}`} aria-busy={abrindo}
    onClick={e => { e.currentTarget.href = linkCheckout(e.currentTarget.href); cliqueComprar(localDoBotao(e.currentTarget)); setAbrindo(true); window.setTimeout(() => setAbrindo(false), 8000); }}>
    {abrindo ? <><Loader2 className="cv-gira" aria-hidden="true" /> Abrindo o pagamento…</> : <>{texto} <ArrowRight aria-hidden="true" /></>}
  </a>;
}

function Titulo({ id, fina, forte, children }: { id: string; fina: string; forte: string; children?: React.ReactNode }) {
  return <div className="clone-secao-topo">
    <h2 id={id} className="clone-titulo-grande"><span className="clone-t-fina">{fina}</span> <span className="clone-t-forte">{forte}</span></h2>
    {children}
  </div>;
}

/** Liga uma vez, quando o elemento aparece (as animações de entrada não voltam quando a pessoa sobe a página). */
function useViu<T extends HTMLElement>(limiar: number) {
  const [ref, na] = useNaTelaClone<T>(limiar);
  const [viu, setViu] = useState(false);
  useEffect(() => { if (na) setViu(true); }, [na]);
  return [ref, viu, na] as const;
}

/* ───────── A dor: a semana sem e com o clone ─────────
   Motivos do roteiro aprovado ("cansado, sem tempo, doente, viajando, ou só não quer aparecer") e "escrever os roteiros da
   semana inteira num domingo". As miniaturas são quadros de 6 vídeos diferentes gravados pelo clone. */
const semana = [
  { dia: 'Dom', sem: 'Descanso', com: 'Escreve os textos', nota: 'todos de uma vez', img: 0 },
  { dia: 'Seg', sem: 'Agenda cheia', com: 'Reels', nota: 'gravado pelo clone', img: 1 },
  { dia: 'Ter', sem: 'Sem energia', com: 'Anúncio', nota: 'gravado pelo clone', img: 2 },
  { dia: 'Qua', sem: 'Em viagem', com: 'Aula', nota: 'gravada pelo clone', img: 3 },
  { dia: 'Qui', sem: 'De cama', com: 'Vídeo do YouTube', nota: 'gravado pelo clone', img: 4 },
  { dia: 'Sex', sem: 'Sem vontade de aparecer', com: 'Reels', nota: 'gravado pelo clone', img: 5 },
  { dia: 'Sáb', sem: 'Folga', com: 'Recado em vídeo', nota: 'gravado pelo clone', img: 6 },
];

export function SemanaDoClone() {
  const [caixa, viu] = useViu<HTMLDivElement>(0.4);
  return <section className="clone-secao cv-semana" id="semana" aria-labelledby="cv-semana-t">
    <Titulo id="cv-semana-t" fina="O conteúdo para" forte="no dia em que você não grava">
      <p>Sem tempo, sem energia, em viagem, de cama, ou só sem vontade de aparecer. E cada semana sem postar é uma semana em que as pessoas esquecem de você e lembram de quem apareceu.</p>
    </Titulo>
    <div className={`cv-agenda${viu ? ' ligado' : ''}`} ref={caixa}>
      <div className="cv-agenda-topo"><CalendarDays aria-hidden="true" /><strong>A sua semana</strong>
        <span className="cv-estado" aria-hidden="true"><i>Sem o clone</i><i>Com o clone</i></span></div>
      <ol>
        {semana.map((d, i) => <li key={d.dia} style={{ '--i': i } as React.CSSProperties}>
          <b>{d.dia}</b>
          <span className="cv-sem"><X aria-hidden="true" />{d.sem}</span>
          <span className="cv-com">
            {d.img ? <img src={`/img/clone/semana-${d.img}.webp`} width={44} height={55} alt="" /> : <em aria-hidden="true"><PenLine /></em>}
            <span><strong>{d.com}</strong><small>{d.nota}</small></span><Check aria-hidden="true" />
          </span>
        </li>)}
      </ol>
      <p className="cv-agenda-fim">Um domingo escrevendo. <strong>A semana inteira gravada.</strong></p>
    </div>
  </section>;
}

/* ───────── Como funciona, em 3 passos ─────────
   Fatos das aulas: uma foto + cerca de 45 s falando para a câmera (a voz sai do áudio desse vídeo); depois é só texto; o
   vídeo sai em pé ou deitado e você baixa. */
export function ComoFuncionaClone() {
  const [caixa, viu, naTela] = useViu<HTMLDivElement>(0.12);
  const perto = usePertoClone(caixa);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { const v = video.current; if (!v) return; if (naTela) void v.play().catch(() => undefined); else v.pause(); }, [naTela]);
  return <section className="clone-secao cv-como" id="como-funciona" aria-labelledby="cv-como-t">
    <Titulo id="cv-como-t" fina="Como funciona" forte="o seu clone"><p>Você grava uma vez. Depois, é só escrever.</p></Titulo>
    <div className={`cv-passos${viu ? ' ligado' : ''}`} ref={caixa}>
      <article className="cv-passo">
        <div className="cv-arte cv-arte-grava" aria-hidden="true">
          <div className="cv-visor"><img src="/videos/clone/gravacao-real.webp" width={540} height={960} alt="" loading="lazy" /><span className="cv-rec">REC</span><i className="cv-canto a" /><i className="cv-canto b" /><i className="cv-canto c" /><i className="cv-canto d" /><span className="cv-varre" /></div>
          <ul>
            <li style={{ '--i': 0 } as React.CSSProperties}><ScanFace />Seu rosto<Check /></li>
            <li style={{ '--i': 1 } as React.CSSProperties}><Video />Seu jeito<Check /></li>
            <li style={{ '--i': 2 } as React.CSSProperties}><Mic />Sua voz<Check /></li>
          </ul>
        </div>
        <div className="cv-passo-txt"><b>1</b><div><h3>Você grava uma vez</h3><p>Uma foto sua e uns 45 segundos de você falando para a câmera. É daí que saem o seu rosto, o seu jeito e a sua voz.</p></div></div>
      </article>
      <article className="cv-passo">
        <div className="cv-arte cv-arte-escreve" aria-hidden="true">
          <div className="cv-nota"><span className="cv-nota-topo"><PenLine />O texto do seu vídeo</span>
            <p><span>Três erros que eu vejo</span><span>toda semana, e como</span><span>você evita cada um.</span></p>
          </div>
        </div>
        <div className="cv-passo-txt"><b>2</b><div><h3>Você escreve o texto</h3><p>Do jeito que você fala. Dá para escrever os vídeos da semana inteira de uma vez só.</p></div></div>
      </article>
      <article className="cv-passo">
        <div className="cv-arte cv-arte-fala" aria-hidden="true">
          <div className="cv-celular"><video ref={video} src="/videos/clone/passo-fala.mp4" poster="/videos/clone/passo-fala.webp" muted loop playsInline preload={perto ? 'auto' : 'none'} />
            <span className="cv-gerando"><i /><b>Gerando o vídeo</b><b><Download />Vídeo pronto</b></span></div>
        </div>
        <div className="cv-passo-txt"><b>3</b><div><h3>O clone fala por você</h3><p>Com o seu rosto e a sua voz, em pé para o Reels ou deitado para o YouTube. Você só baixa e posta.</p></div></div>
      </article>
    </div>
  </section>;
}

/* ───────── Não sai com cara de robô: o que você aprende a conferir antes de gerar (aula 3) ───────── */
const ditos = [
  { escrito: 'R$ 1.250', dito: 'mil duzentos e cinquenta reais' },
  { escrito: 'Dra. Ana', dito: 'doutora Ana' },
  { escrito: '2ª a 6ª', dito: 'segunda a sexta' },
];

export function SemCaraDeRobo() {
  const [caixa, viu, naTela] = useViu<HTMLDivElement>(0.15);
  return <section className="clone-secao cv-robo" id="sem-robo" aria-labelledby="cv-robo-t">
    <Titulo id="cv-robo-t" fina="O que separa" forte="um clone de um robô"><p>É o que você confere antes de gerar o vídeo. No curso, você aprende os três cuidados que eu uso com o meu clone.</p></Titulo>
    <div className={`cv-tres${viu ? ' ligado' : ''}${naTela ? ' rodando' : ''}`} ref={caixa}>
      <article className="cv-cuidado">
        <div className="cv-onda" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ '--i': i, '--a': `${28 + Math.round(Math.abs(Math.sin(i * 1.7) * 52) + (i % 3) * 7)}%` } as React.CSSProperties} />)}</div>
        <h3><Volume2 aria-hidden="true" />A voz</h3>
        <p>Você ouve a fala inteira antes de gerar, e ouvir não gasta nada. Se uma frase soar estranha, você ajusta ali mesmo.</p>
      </article>
      <article className="cv-cuidado">
        <ul className="cv-ditos" aria-hidden="true">{ditos.map((d, i) => <li key={d.escrito} style={{ '--i': i } as React.CSSProperties}><span>{d.escrito}</span><ArrowRight /><b>{d.dito}</b></li>)}</ul>
        <h3><Mic aria-hidden="true" />A pronúncia</h3>
        <p>Número, sigla, nome próprio e palavra em inglês. Você aprende a acertar cada um até ele falar do seu jeito.</p>
      </article>
      <article className="cv-cuidado">
        <div className="cv-teste" aria-hidden="true">
          <span className="cv-anel"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="42" pathLength={100} /></svg><b>10<small>s</small></b></span>
          <ul>{['Boca', 'Olhar', 'Gestos'].map((t, i) => <li key={t} style={{ '--i': i } as React.CSSProperties}><Check />{t}</li>)}</ul>
        </div>
        <h3><ScanFace aria-hidden="true" />O rosto</h3>
        <p>Um teste de 10 segundos mostra se a boca, o olhar e os gestos estão certos, antes de você gerar o vídeo inteiro.</p>
      </article>
    </div>
  </section>;
}

/* ───────── O que o seu clone pode gravar: um celular que troca de cena (Reels, anúncio, aula, YouTube, vendas, recado) ─────────
   O mesmo clone em 6 usos. Linha do tempo só em CSS: 18 s, 3 s por uso; a lista acende junto. Vídeos: clone da aula 3
   (em pé) e da aula 1 (deitado), sem legenda nem painel. */
const usos = [
  { nome: 'Reels', texto: 'O vídeo da semana pronto, sem ligar a câmera.' },
  { nome: 'Anúncio', texto: 'Vários começos para testar, mudando só o texto.' },
  { nome: 'Aula', texto: 'Você explica o que domina quantas vezes precisar.' },
  { nome: 'YouTube', texto: 'O mesmo clone, com o vídeo deitado.' },
  { nome: 'Vídeo de vendas', texto: 'A apresentação do seu produto, com o seu rosto.' },
  { nome: 'Recado em vídeo', texto: 'A resposta que você manda para o seu cliente.' },
];

export function UsosDoClone() {
  const [caixa, naTela] = useNaTelaClone<HTMLDivElement>(0.25);
  const perto = usePertoClone(caixa);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => { videos.current.forEach(v => { if (!v) return; if (naTela) void v.play().catch(() => undefined); else v.pause(); }); }, [naTela]);
  const v = (i: number, src: string, classe?: string) => <video ref={el => { videos.current[i] = el; }} className={classe} src={`${src}.mp4`} poster={`${src}.webp`} muted loop playsInline preload={perto ? 'auto' : 'none'} />;
  const cena = (i: number) => ({ '--i': i }) as React.CSSProperties;
  return <section className="clone-secao cv-usos" id="usos" aria-labelledby="cv-usos-t">
    <Titulo id="cv-usos-t" fina="O que o seu clone" forte="pode gravar"><p>Um clone só, em todo lugar onde você precisa aparecer.</p></Titulo>
    <div className={`cv-usos-palco${naTela ? ' rodando' : ''}`} ref={caixa}>
      <div className="cv-fone" aria-hidden="true">
        <div className="cv-fone-tela">
          {v(0, '/videos/clone/usos', 'cv-fone-v')}
          <div className="cv-uso-cena cv-c-reels" style={cena(0)}><span className="cv-lado"><i><Heart /></i><i><MessageCircle /></i><i><Send /></i></span><span className="cv-arroba"><i />@voce<b>Seguir</b></span></div>
          <div className="cv-uso-cena cv-c-anuncio" style={cena(1)}><span className="cv-arroba"><i /><span>sua empresa<small>Patrocinado</small></span></span><span className="cv-saiba">Saiba mais<ChevronRight /></span></div>
          <div className="cv-uso-cena cv-c-aula" style={cena(2)}><span className="cv-aula-nome"><b>Aula 1</b>Comece por aqui</span><span className="cv-player"><Play /><i><em /></i></span></div>
          <div className="cv-uso-cena cv-c-yt" style={cena(3)}>{v(1, '/videos/clone/usos-deitado')}<span className="cv-yt-barra"><em /></span><b>O título do seu vídeo</b><span className="cv-arroba"><i />Seu canal<b>Inscrever-se</b></span><span className="cv-linhas"><i /><i /><i /></span></div>
          <div className="cv-uso-cena cv-c-vendas" style={cena(4)}><b>O nome do seu produto</b><span className="cv-comprar">Quero agora</span></div>
          <div className="cv-uso-cena cv-c-recado" style={cena(5)}><span className="cv-bolha">Oi! Como funciona o seu atendimento?</span><span className="cv-redondo">{v(2, '/videos/clone/usos')}</span></div>
        </div>
      </div>
      <ol className="cv-usos-lista">{usos.map((u, i) => <li key={u.nome} style={cena(i)}><b>{i + 1}</b><div><strong>{u.nome}</strong><p>{u.texto}</p></div></li>)}</ol>
    </div>
  </section>;
}

/* ───────── Para quem é ───────── */
const quem = [
  { Icone: VideoOff, t: 'Quem trava na frente da câmera', p: 'Você escreve com calma, revisa, e o clone fala.' },
  { Icone: Clock, t: 'Quem não tem tempo de gravar', p: 'Você escreve os textos da semana de uma vez, e os vídeos saem deles.' },
  { Icone: Stethoscope, t: 'Quem atende o dia inteiro', p: 'Dentista, psicólogo, nutricionista, advogado: o conteúdo sai sem tirar você da agenda.' },
  { Icone: Megaphone, t: 'Quem faz anúncio', p: 'Criativo novo toda semana e vários começos para testar, mudando só o texto.' },
  { Icone: GraduationCap, t: 'Quem dá aula ou vende curso', p: 'Aula nova sem montar câmera, luz e microfone toda vez.' },
  { Icone: EyeOff, t: 'Quem não quer aparecer todo dia', p: 'O rosto é o seu, e você não precisa se arrumar para gravar.' },
];
export function ParaQuemClone() {
  return <section className="clone-secao cv-quem" id="para-quem" aria-labelledby="cv-quem-t">
    <Titulo id="cv-quem-t" fina="Para quem é" forte="o Modo Clone?"><p>Para quem precisa aparecer em vídeo e não consegue gravar sempre.</p></Titulo>
    <ul className="cv-quem-lista">{quem.map(({ Icone, t, p }) => <li key={t}><span aria-hidden="true"><Icone /></span><div><strong>{t}</strong><p>{p}</p></div></li>)}</ul>
  </section>;
}

/* ───────── Quem criou (história do recado aprovado em 16/11) ───────── */
export function CriadorClone() {
  return <section className="clone-secao cv-criador" id="criador" aria-labelledby="cv-criador-t">
    <figure className="cv-criador-foto"><img src="/img/clone/eu-e-clone.webp" width={1080} height={993} alt="Mariano Rodrigues e o clone dele" loading="lazy" /><span>Eu</span><span>Meu clone</span></figure>
    <div className="cv-criador-txt">
      <h2 id="cv-criador-t">Prazer, eu sou o <em>{siteConfig.creator.name}.</em></h2>
      <p className="cv-mono">Creator e estrategista de IA</p>
      <p>Para os meus anúncios funcionarem, eu preciso de vídeo novo a cada dois, três dias. E gravar virou o gargalo do meu negócio.</p>
      <p>Foi aí que eu criei o meu clone. Hoje ele grava por mim anúncios, aulas e até vídeo para o YouTube, e um dos meus anúncios que mais vendem foi gravado por ele.</p>
      <p>O Modo Clone é o caminho que eu fiz, tela por tela, do zero até o primeiro vídeo. <strong>E quem dá as aulas é o meu clone.</strong></p>
    </div>
  </section>;
}

/* ───────── O que você vai receber ───────── */
const aulas = [
  { capa: '/img/clone/modulo-01.webp', n: '01', t: 'Comece aqui', p: 'O que é um clone, as três partes dele e o que você precisa ter, para não perder tempo nem dinheiro testando no escuro.' },
  { capa: '/img/clone/modulo-02.webp', n: '02', t: 'Criando o seu avatar', p: 'Tela por tela: a sua conta, a sua foto, a gravação do seu movimento e a sua voz clonada. Cada botão explicado.' },
  { capa: '/img/clone/modulo-03.webp', n: '03', t: 'Criando o vídeo', p: 'Do texto ao vídeo pronto: a voz em português, a pronúncia certa, o teste de 10 segundos e o download.' },
];
export function ReceberClone() {
  const [caixa, viu] = useViu<HTMLDivElement>(0.2);
  return <section className="clone-secao cv-receber" id="receber" aria-labelledby="cv-receber-t">
    <Titulo id="cv-receber-t" fina="O que você" forte="vai receber"><p>Acesso na hora: o login chega no seu e-mail assim que o pagamento é aprovado.</p></Titulo>
    <div className="cv-navegador" aria-hidden="true">
      <div className="cv-nav-topo"><i /><i /><i /><span><Lock />Sua área de membros</span></div>
      <div className="cv-nav-corpo">
        <div className="cv-nav-banner"><img src="/img/clone/arte-larga.webp" width={1120} height={630} alt="" loading="lazy" /><b>Modo Clone</b><small>Do zero ao seu primeiro vídeo</small></div>
        <div className="cv-nav-capas">{aulas.map(a => <img key={a.n} src={a.capa} width={640} height={960} alt="" loading="lazy" />)}</div>
      </div>
    </div>
    <div className={`clone-modulos${viu ? ' revelado' : ''}`} ref={caixa}>
      {aulas.map((m, i) => <article key={m.n} className="clone-modulo" style={{ '--i': i } as React.CSSProperties}>
        <span className="clone-modulo-capa"><img src={m.capa} width={640} height={960} alt={`Aula ${m.n}: ${m.t}`} loading="lazy" /></span>
        <div><span>Aula {m.n}</span><strong>{m.t}</strong><p>{m.p}</p></div>
      </article>)}
    </div>
    <ul className="cv-extras">
      <li><span aria-hidden="true"><ScanFace /></span><div><strong>O clone é seu</strong><p>Ele fica na sua conta, pronto para gravar sempre que você precisar.</p></div></li>
      <li><span aria-hidden="true"><Wallet /></span><div><strong>Comece no plano grátis da ferramenta</strong><p>Você cria o clone e testa sem cadastrar cartão.</p></div></li>
      <li><span aria-hidden="true"><MessageCircle /></span><div><strong>Suporte no WhatsApp</strong><p>Travou em alguma tela? Você chama e a gente resolve.</p></div></li>
    </ul>
  </section>;
}

/* ───────── Oferta ───────── */
function Selo7() {
  const t = '7 DIAS DE GARANTIA • REEMBOLSO TOTAL • ';
  return <div className="spin-seal cv-selo" aria-label="7 dias de garantia"><svg viewBox="0 0 100 100" className="spin-ring" aria-hidden="true"><defs><path id="cv-selo-circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><circle cx="50" cy="50" r="31" /><text><textPath href="#cv-selo-circ" textLength="238" lengthAdjust="spacing">{t}</textPath></text></svg><span>7</span></div>;
}
const inclui = ['3 aulas, do zero ao seu primeiro vídeo, tela por tela', 'O seu clone com o seu rosto e a sua voz, na sua conta', 'Os cuidados para ele não sair com cara de robô', 'Suporte no WhatsApp'];
export function OfertaClone() {
  const { price, installmentValue } = siteConfig.clone.vendas;
  const caixa = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { eventoProprio('ViuOferta'); io.disconnect(); } }, { threshold: .3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <section className="clone-secao cv-oferta" id="oferta-clone" ref={caixa} aria-labelledby="cv-oferta-t">
    <Titulo id="cv-oferta-t" fina="Crie o seu" forte="clone hoje"><p>Pagamento único, sem mensalidade. 7 dias de garantia.</p></Titulo>
    <div className="cv-oferta-caixa">
      <div className="cv-oferta-arte"><img src="/img/clone/arte-larga.webp" width={1120} height={630} alt="" loading="lazy" /></div>
      <div className="cv-oferta-corpo">
        <h3>Modo Clone</h3>
        <p className="cv-oferta-frase">Grave uma vez. <em>Depois, é só escrever.</em></p>
        <ul>{inclui.map(i => <li key={i}><Check aria-hidden="true" />{i}</li>)}</ul>
        <div className="cv-preco"><span><sup>R$</sup><strong>{price}</strong><i>à vista</i></span>{installmentValue > 0 && <p>ou <b>12x de {brl(installmentValue)}</b> no cartão</p>}</div>
        <BotaoClone texto="Quero o Modo Clone" destino="checkout" classe="grande" />
        <p className="cv-selos"><span><CheckCircle2 aria-hidden="true" />Pagamento único</span><span><Lock aria-hidden="true" />Compra segura</span></p>
      </div>
      <div className="cv-garantia"><Selo7 /><div><strong>Garantia de 7 dias</strong><p>Entrou, assistiu, criou o seu clone e achou que não é para você? Peça o reembolso dentro de 7 dias e receba tudo de volta.</p></div></div>
    </div>
  </section>;
}

/* ───────── Dúvidas em texto (as em vídeo, com o clone respondendo, vêm antes) ───────── */
const duvidas: [string, string][] = [
  ['O que exatamente eu estou comprando?', 'O Modo Clone, um curso direto ao ponto em 3 aulas. Ele te leva, tela por tela, da criação do seu clone até o seu primeiro vídeo gravado por ele.'],
  ['Fica com cara de robô?', 'Você está vendo a resposta nesta página: o vídeo do topo, os anúncios e as aulas foram gravados pelo meu clone. No curso, você aprende a conferir a voz, a pronúncia e o rosto antes de gerar cada vídeo.'],
  ['Preciso pagar a ferramenta do clone?', 'Dá para começar no plano grátis da ferramenta, sem cadastrar cartão. No grátis, são até 3 vídeos por mês, de até um minuto, com marca d’água. Para vídeos maiores e sem marca, é o plano pago dela, que não está incluído no valor do Modo Clone.'],
  ['O que eu preciso gravar?', 'Uma foto sua e cerca de 45 segundos de você falando para a câmera. A voz sai do áudio dessa gravação.'],
  ['Fica mesmo com a minha voz?', 'Fica. A ferramenta cria 3 opções a partir da sua gravação, e você escolhe a que soa mais como você. Se nenhuma agradar, a aula mostra como regravar e ajustar.'],
  ['Preciso entender de tecnologia?', 'Não. Foi para quem não entende que as aulas foram gravadas tela por tela, com cada botão explicado, na ordem.'],
  ['Preciso de computador?', 'Sim, para seguir as aulas e gerar os vídeos. A sua foto e a sua gravação podem ser feitas no celular.'],
  ['Serve para Reels e para o YouTube?', 'Serve. Você escolhe o vídeo em pé ou deitado e pode trocar o fundo.'],
  ['Preciso saber editar vídeo?', 'Para gerar o vídeo, não: ele sai falando, pronto para baixar e postar. Legenda, ilustração e efeitos são outra etapa, a edição.'],
  ['O clone é meu?', 'É. Ele fica na sua conta, e você grava com ele sempre que precisar.'],
  ['Posso fazer o clone de outra pessoa?', 'O curso é para você criar o seu, com o seu rosto e a sua voz.'],
  ['Como recebo o acesso?', 'O login da área de membros chega no seu e-mail assim que o pagamento é aprovado. No PIX e no cartão é na hora.'],
  ['E se eu não gostar?', 'Você tem 7 dias de garantia. Pede o reembolso e recebe 100% do valor de volta.'],
];
export function PerguntasClone() {
  return <section className="clone-secao cv-faq" id="duvidas" aria-labelledby="cv-faq-t">
    <Titulo id="cv-faq-t" fina="O que vale saber" forte="antes de comprar" />
    <Accordion type="single" collapsible className="faq-list">{duvidas.map(([p, r], i) => <AccordionItem key={p} value={`d${i}`}><AccordionTrigger>{p}</AccordionTrigger><AccordionContent className="faq-answer">{r}</AccordionContent></AccordionItem>)}</Accordion>
  </section>;
}

/* ───────── Fecho: o feixe de luz da arte ───────── */
export function FimClone() {
  return <section className="cv-fim" id="fim" aria-labelledby="cv-fim-t">
    <span className="cv-fim-luz" aria-hidden="true" />
    <h2 id="cv-fim-t" className="clone-titulo-grande"><span className="clone-t-fina">O seu conteúdo</span> <span className="clone-t-forte">não para mais</span></h2>
    <p>Continue gravando todos os vídeos na mão, ou tenha um clone gravando por você.</p>
    <BotaoClone texto={`Quero o meu clone · ${brl(siteConfig.clone.vendas.price)}`} destino="checkout" classe="grande" />
    <small>Pagamento único · 7 dias de garantia</small>
  </section>;
}

/* ───────── Barra fixa e WhatsApp: só depois da prova (o lado a lado); a barra some na oferta e no fim ───────── */
function passouProva() {
  const p = document.querySelector('.clone-lado');
  return !!p && p.getBoundingClientRect().bottom < window.innerHeight * .35;
}
export function BarraClone() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const vendo = new Set<Element>();
    const ver = () => setOn(passouProva() && vendo.size === 0);
    const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? vendo.add(e.target) : vendo.delete(e.target)); ver(); });
    ['oferta-clone', 'fim'].forEach(i => { const el = document.getElementById(i); if (el) io.observe(el); });
    window.addEventListener('scroll', ver, { passive: true }); ver();
    return () => { io.disconnect(); window.removeEventListener('scroll', ver); };
  }, []);
  return <div className={`sticky-bar cv-barra ${on ? 'on' : ''}`} aria-hidden={!on}><div><strong>Modo Clone</strong><p>7 dias de garantia</p></div><BotaoClone texto="Quero" classe="curto" /></div>;
}
export function WhatsClone() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ver = () => setOn(passouProva());
    ver(); window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, []);
  if (!siteConfig.whatsapp) return null;
  const href = `https://api.whatsapp.com/send?phone=${siteConfig.whatsapp}&text=${encodeURIComponent('Oi! Tenho uma dúvida sobre o Modo Clone.')}`;
  return <a className={`whats ${on ? 'on' : ''}`} aria-hidden={!on} tabIndex={on ? 0 : -1} href={href} target="_blank" rel="noopener noreferrer" aria-label="Tirar dúvidas no WhatsApp" onClick={() => evento('Contact', { content_name: 'Modo Clone' })}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="whats-verde-c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#20b038" /><stop offset="1" stopColor="#60d66a" /></linearGradient></defs>
      <path fill="url(#whats-verde-c)" d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z" />
      <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  </a>;
}
