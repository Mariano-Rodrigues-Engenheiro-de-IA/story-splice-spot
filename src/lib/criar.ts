import { ESTILOS_LEGENDA } from '@/components/legendas-modelos';
import { EFEITOS_MODELO, ESTILOS_EFEITO } from '@/components/efeitos-modelos';

/* "Criar meu vídeo" (21/11/2026): ferramenta SEPARADA do Catálogo (o catálogo são só referências; o "Usar" copia o
   prompt com o código). Duas portas: (1) tenho uma referência -> prompt pronto; (2) criar do zero -> o aluno monta o
   vídeo camada por camada em cima de um trecho CRU de 10 s dele (o vídeo "vai sendo construído").

   REGRA (dele): toda opção tem exemplo de verdade, e todo clique muda o vídeo na tela. Legenda e efeitos são desenhados
   ao vivo pelos MESMOS motores da skill (legendas-modelos.tsx = LegendaModelo, efeitos-modelos.tsx = EfeitoModelo): o
   que o aluno vê é o que a IA dele faz. Cada opção tem um CÓDIGO permanente que a skill liga à receita
   (biblioteca/criar-do-zero.md). Código novo = linha nova aqui + receita na skill. */

export type Formato = { codigo: string; id: 'cheia' | 'cartao' | 'dividida' | 'narracao'; nome: string; desc: string; pedido: string };

/** exemplo de cada formato = trecho de um vídeo DELE já aprovado, só a parte em que aquele formato aparece:
    public/videos/criar/fmt-0N.mp4 (FUN-03, MOT-02 12,4-20,4 s, MOT-01 4,8-9,8 s, COL-01 0-8 s) */
export const FORMATOS: Formato[] = [
  { codigo: 'FMT-01', id: 'cheia', nome: 'Tela cheia', desc: 'Você na tela toda, só com a legenda.', pedido: 'tela cheia, só com a legenda (nenhum elemento por cima de mim)' },
  { codigo: 'FMT-02', id: 'cartao', nome: 'Você no cartão', desc: 'Os efeitos em cima e você num cartão embaixo.', pedido: 'os efeitos em cima e eu num cartão embaixo' },
  { codigo: 'FMT-03', id: 'dividida', nome: 'Tela dividida', desc: 'Metade de cima para os efeitos, você na metade de baixo.', pedido: 'tela dividida: os efeitos na metade de cima e eu na metade de baixo' },
  { codigo: 'FMT-04', id: 'narracao', nome: 'Só narração', desc: 'Você não aparece: a sua voz e os efeitos na tela toda.', pedido: 'eu não apareço: a minha narração com os efeitos na tela toda' },
];

export type Legenda = { codigo: string; nome: string; desc: string };

/** 22/11 (ele): cada legenda DIFERENTE de verdade + a cor escolhida pela pessoa. Os estilos são desenhados ao vivo pelo
    motor src/components/legendas-modelos.tsx (o mesmo da skill: composição LegendaModelo). LEG-00 = sem legenda. */
export const LEGENDAS: Legenda[] = [{ codigo: 'LEG-00', nome: 'Sem legenda', desc: 'Só você falando.' }, ...ESTILOS_LEGENDA];

export const exemploFormato = (codigo: string) => ({ loop: `/videos/criar/${codigo.toLowerCase()}.mp4`, capa: `/videos/criar/${codigo.toLowerCase()}.webp` });

/** o vídeo cru (a legenda vai por cima, ao vivo); no formato só narração, o fundo roxo. O vídeo é sempre mudo: a voz
    (som/voz.m4a, a mesma do vídeo) toca na mesa de som da página, junto com a trilha e os efeitos sonoros. */
export const videoBase = (narracao: boolean) => ({ video: `/videos/criar/base${narracao ? '-n' : ''}.mp4`, capa: '/videos/criar/base.webp' });
export const VOZ = '/videos/criar/som/voz.m4a';
export const DURACAO = 10.3;

/** as palavras do trecho cru (public/videos/criar/base.mp4, 10,3 s), tempo de cada uma: a legenda ao vivo usa isto */
export const TRECHO_PALAVRAS = [{"t": "Gravar,", "ini": 0.06, "fim": 0.84}, {"t": "ligar", "ini": 1.1, "fim": 1.5}, {"t": "a", "ini": 1.5, "fim": 1.64}, {"t": "câmera,", "ini": 1.64, "fim": 2.0}, {"t": "acertar", "ini": 2.3, "fim": 2.74}, {"t": "a", "ini": 2.74, "fim": 2.84}, {"t": "luz,", "ini": 2.84, "fim": 3.18}, {"t": "errar", "ini": 3.46, "fim": 3.76}, {"t": "a", "ini": 3.76, "fim": 3.92}, {"t": "fala,", "ini": 3.92, "fim": 4.26}, {"t": "gravar", "ini": 4.56, "fim": 4.94}, {"t": "de", "ini": 4.94, "fim": 5.04}, {"t": "novo.", "ini": 5.04, "fim": 5.28}, {"t": "E", "ini": 5.5, "fim": 5.92}, {"t": "tem", "ini": 5.92, "fim": 6.02}, {"t": "dia", "ini": 6.02, "fim": 6.18}, {"t": "que", "ini": 6.18, "fim": 6.3}, {"t": "você", "ini": 6.3, "fim": 6.48}, {"t": "está", "ini": 6.48, "fim": 6.68}, {"t": "cansado,", "ini": 6.68, "fim": 7.42}, {"t": "sem", "ini": 7.58, "fim": 7.7}, {"t": "tempo,", "ini": 7.7, "fim": 8.22}, {"t": "doente", "ini": 8.42, "fim": 8.84}, {"t": "ou", "ini": 8.84, "fim": 9.26}, {"t": "só", "ini": 9.26, "fim": 9.4}, {"t": "não", "ini": 9.4, "fim": 9.52}, {"t": "quer", "ini": 9.52, "fim": 9.68}, {"t": "aparecer.", "ini": 9.68, "fim": 10.06}];
/** palavras fortes do trecho (ganham a cor nos estilos que destacam) */
export const TRECHO_DESTAQUES = ['câmera', 'luz', 'cansado', 'aparecer'];
/** o começo de cada pedaço da fala: é onde entram os efeitos sonoros e os cortes de câmera */
export const FRASES = [0.06, 1.1, 2.3, 3.46, 4.56, 5.5, 6.68, 7.58, 8.42, 9.26];

/* ---------- Câmera (camera.py da skill) ---------- */
export type Camera = { codigo: string; nome: string; desc: string; pedido: string };
export const CAMERAS: Camera[] = [
  { codigo: 'CAM-00', nome: 'Parada', desc: 'Sem zoom: o enquadramento da gravação.', pedido: 'sem zoom' },
  { codigo: 'CAM-01', nome: 'Zoom a cada corte', desc: 'Alterna 100% e 112% a cada pedaço da fala.', pedido: 'alterna 100% e 112% a cada corte' },
  { codigo: 'CAM-02', nome: 'Zoom nas palavras fortes', desc: 'Aproxima devagar nas palavras que pesam.', pedido: 'zoom de ênfase nas palavras fortes' },
  { codigo: 'CAM-03', nome: 'Os dois juntos', desc: 'Zoom a cada corte e ênfase nas palavras fortes.', pedido: 'zoom a cada corte e ênfase nas palavras fortes' },
];
const suave = (x: number) => { const k = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - k, 3); };
/** a escala do rosto no tempo t (o mesmo desenho do camera.py: corte seco 100/112, ênfase 100 -> 108% em 0,4 s) */
export function escalaCamera(codigo: string, t: number): number {
  let s = 1;
  if (codigo === 'CAM-01' || codigo === 'CAM-03') {
    const k = FRASES.filter(x => t >= x).length;
    s = k % 2 === 0 ? 1 : 1.12;
  }
  if (codigo === 'CAM-02' || codigo === 'CAM-03') {
    const fortes = TRECHO_PALAVRAS.filter(p => TRECHO_DESTAQUES.some(d => p.t.toLowerCase().startsWith(d)));
    let enf = 0;
    for (const p of fortes) enf = Math.max(enf, Math.min(suave((t - p.ini) / 0.4), 1 - suave((t - p.ini - 1.3) / 0.5)));
    s *= 1 + 0.08 * enf;
  }
  return Math.min(s, 1.15); // como no camera.py: 1080p não passa de 115%
}

/* ---------- Efeitos na tela ---------- */

/** Estilo do efeito (pedido dele, 22/11: "esquece o catálogo"): cada estilo com o seu fundo, a sua letra e o seu jeito
    de mexer. Os 6 primeiros são desenhados ao vivo pelo motor efeitos-modelos.tsx (FX-01 a FX-36); vidro, 3D e cenas
    são vídeos renderizados pela skill (PEC). `demo` = o que entra no vídeo quando a pessoa clica no estilo. */
export type EstiloFx = { id: string; nome: string; desc: string; demo: string[] };
const DEMO: Record<string, string[]> = {
  grafico: ['FX-01', 'FX-02', 'FX-05'],
  design: ['FX-07', 'FX-09', 'FX-12'],
  desenho: ['FX-13', 'FX-15', 'FX-16'],
  documental: ['FX-19', 'FX-20', 'FX-21'],
  tech: ['FX-25', 'FX-26', 'FX-28'],
  minimal: ['FX-31', 'FX-35', 'FX-36'],
};
export const ESTILOS: EstiloFx[] = [
  ...ESTILOS_EFEITO.map(s => ({ ...s, demo: DEMO[s.id] ?? [] })),
  { id: 'vidro', nome: 'Vidro roxo', desc: 'Painéis, pílulas e selos de vidro com brilho roxo.', demo: ['PEC-08', 'PEC-13', 'PEC-09'] },
  { id: '3d', nome: '3D realista', desc: 'Celular, lâmpada, produto, casa e anatomia em 3D, com luz de estúdio.', demo: ['PEC-16', 'PEC-15', 'PEC-17'] },
  { id: 'cenas', nome: 'Cenas e transições', desc: 'Imagens contando a história, troca em quadrados e com scan.', demo: ['PEC-22', 'PEC-23', 'PEC-24'] },
];

/** Todos os efeitos: os FX (ao vivo, na cor que a pessoa escolher) e os PEC (vídeos renderizados pela skill sobre as
    palavras do trecho: public/videos/criar/motions/<codigo>.mp4, gerador D:/criar_do_zero/motions.mjs). */
export type Efeito = { codigo: string; nome: string; estilo: string; video: boolean };
const PEC: [string, string, string][] = [
  ['PEC-01', 'Título com subtítulo', 'vidro'], ['PEC-02', 'Lista que vai marcando', 'vidro'], ['PEC-03', 'Ícones animados', 'vidro'],
  ['PEC-04', 'Número que conta', 'vidro'], ['PEC-05', 'Seta desenhada', 'vidro'], ['PEC-06', 'Texto digitando', 'vidro'],
  ['PEC-07', 'Cartela de tela cheia', 'vidro'], ['PEC-08', 'Gancho em linhas grandes', 'vidro'], ['PEC-09', 'Palavra em pílula de vidro', 'vidro'],
  ['PEC-10', 'Chamada final com botão', 'vidro'], ['PEC-11', 'Selo de vidro', 'vidro'], ['PEC-12', 'Gráfico de vidro', 'vidro'],
  ['PEC-13', 'Cartões de passo', 'vidro'], ['PEC-14', 'Painel de bastidor', 'vidro'], ['PEC-25', 'Painel com imagem e itens', 'vidro'],
  ['PEC-15', 'Celular 3D', '3d'], ['PEC-16', 'Lâmpada que acende', '3d'], ['PEC-17', 'Produto girando', '3d'],
  ['PEC-18', 'Casa montando em 3D', '3d'], ['PEC-19', 'Objeto dando a volta', '3d'], ['PEC-20', 'Anatomia com corte', '3d'],
  ['PEC-21', 'Obra sendo construída', '3d'],
  ['PEC-22', 'Cenas que contam a história', 'cenas'], ['PEC-23', 'Fundo que se desfaz em quadrados', 'cenas'], ['PEC-24', 'Troca com linha de scan', 'cenas'],
];
export const EFEITOS: Efeito[] = [
  ...EFEITOS_MODELO.map(x => ({ ...x, video: false })),
  ...PEC.map(([codigo, nome, estilo]) => ({ codigo, nome, estilo, video: true })),
];
export const efeito = (codigo: string) => EFEITOS.find(x => x.codigo === codigo);
export const videoMotion = (codigo: string) => ({ video: `/videos/criar/motions/${codigo.toLowerCase()}.mp4`, capa: `/videos/criar/motions/${codigo.toLowerCase()}.webp` });
/** a imagem que um efeito ao vivo usa (FX-20 polaroid) */
export const imgEfeito = (nome: string) => `/videos/criar/img/${nome}`;

/** Em que segundos do trecho cada efeito tem algo na tela (PEC medido no vídeo: D:/criar_do_zero/janelas_motions.py;
    os FX acompanham a fala inteira). */
const JANELAS: Record<string, [number, number][]> = {"PEC-01":[[0.0,10.0]],"PEC-02":[[1.0,10.25]],"PEC-03":[[0.25,2.0],[2.75,5.0],[6.75,10.0]],"PEC-04":[[1.0,10.0]],"PEC-05":[[0.0,4.75],[6.25,10.0]],"PEC-06":[[1.5,5.25],[6.75,10.0]],"PEC-07":[[0.25,4.75],[5.5,9.75]],"PEC-08":[[0.25,9.75]],"PEC-09":[[6.75,9.75]],"PEC-10":[[0.25,10.25]],"PEC-11":[[0.5,9.75]],"PEC-12":[[0.5,10.25]],"PEC-13":[[1.0,10.25]],"PEC-14":[[1.5,10.25]],"PEC-15":[[0.0,10.25]],"PEC-16":[[0.0,10.25]],"PEC-17":[[0.0,10.25]],"PEC-18":[[0.25,10.25]],"PEC-19":[[0.0,10.25]],"PEC-20":[[0.0,10.25]],"PEC-21":[[0.0,10.25]],"PEC-22":[[0.0,10.25]],"PEC-23":[[0.0,10.25]],"PEC-24":[[0.0,10.25]],"PEC-25":[[0.5,10.0]]};
const janelas = (c: string): [number, number][] => JANELAS[c] ?? [[0, DURACAO]];

/** Vários efeitos no mesmo vídeo: um depois do outro, cada um no momento em que ele tem algo na tela; cada um fica
    pelo menos ~2,5 s antes de dar a vez ao próximo (como numa edição de verdade). */
export function agendaMotions(cods: string[], dur = DURACAO, passo = 0.25, fica = 2.5): { ini: number; fim: number; c: string }[] {
  const ativo = (c: string, t: number) => janelas(c).some(([a, b]) => t >= a && t < b);
  const segs: { ini: number; fim: number; c: string }[] = [];
  let atual = '';
  let desde = 0;
  let k = -1;
  for (let t = 0; t < dur; t += passo) {
    const vivos = cods.filter(c => ativo(c, t));
    let prox = atual;
    if (!vivos.length) prox = '';
    else if (!atual || !vivos.includes(atual) || (t - desde >= fica && vivos.length > 1)) {
      for (let j = 1; j <= cods.length; j++) {
        const c = cods[(k + j) % cods.length]!;
        if (vivos.includes(c) && (c !== atual || vivos.length === 1)) { prox = c; k = (k + j) % cods.length; break; }
      }
    }
    if (prox !== atual) {
      const ult = segs[segs.length - 1];
      if (ult && ult.fim === 0) ult.fim = t;
      if (prox) segs.push({ ini: t, fim: 0, c: prox });
      atual = prox;
      desde = t;
    }
  }
  const ult = segs[segs.length - 1];
  if (ult && ult.fim === 0) ult.fim = dur;
  return segs;
}

/* ---------- Som ---------- */

/** Trilhas: originais do sons.py da skill (sem licença), no nível de fundo (public/videos/criar/som/). */
export type Som = { codigo: string; nome: string; desc: string };
export const TRILHAS: Som[] = [
  { codigo: 'SOM-00', nome: 'Sem trilha', desc: 'Só a voz.' },
  { codigo: 'SOM-01', nome: 'Calma I', desc: 'calma · 78 bpm · dó' },
  { codigo: 'SOM-02', nome: 'Calma II', desc: 'calma · 86 bpm · lá menor' },
  { codigo: 'SOM-03', nome: 'Calma III', desc: 'calma · 92 bpm · fá' },
  { codigo: 'SOM-04', nome: 'Tecnologia I', desc: 'tecnologia · 108 bpm · lá menor' },
  { codigo: 'SOM-05', nome: 'Tecnologia II', desc: 'tecnologia · 116 bpm · mi menor' },
  { codigo: 'SOM-06', nome: 'Tecnologia III', desc: 'tecnologia · 122 bpm · dó' },
  { codigo: 'SOM-07', nome: 'Energia I', desc: 'energética · 124 bpm · mi menor' },
  { codigo: 'SOM-08', nome: 'Energia II', desc: 'energética · 128 bpm · sol' },
  { codigo: 'SOM-09', nome: 'Energia III', desc: 'energética · 132 bpm · lá menor' },
  { codigo: 'SOM-10', nome: 'Emoção I', desc: 'emocional · 72 bpm · lá menor' },
  { codigo: 'SOM-11', nome: 'Emoção II', desc: 'emocional · 80 bpm · fá' },
  { codigo: 'SOM-12', nome: 'Emoção III', desc: 'emocional · 88 bpm · ré menor' },
  { codigo: 'SOM-13', nome: 'IA I', desc: 'clima de IA · 100 bpm · fá# menor' },
  { codigo: 'SOM-14', nome: 'IA II', desc: 'clima de IA · 110 bpm · si menor' },
  { codigo: 'SOM-15', nome: 'IA III', desc: 'clima de IA · 118 bpm · lá menor' },
];
export const audioTrilha = (codigo: string) => (codigo === 'SOM-00' ? null : `/videos/criar/som/${codigo.toLowerCase()}.m4a`);

/** Efeitos sonoros soltos, todos CC0 (Kenney e Freesound: podem ir na página E dentro da skill, em
    ferramentas/sons/cc0/<id>.ogg com o CREDITOS.txt). Gerador: D:/criar_do_zero/gerar_sfx.py. A pessoa marca quantos
    quiser; no vídeo eles entram nos começos de frase, revezando. */
export type Sfx = { id: string; nome: string; grupo: string };
export const SFX: Sfx[] = [
  { id: 'clique-suave', nome: 'Clique suave', grupo: 'Cliques e toques' },
  { id: 'clique-firme', nome: 'Clique firme', grupo: 'Cliques e toques' },
  { id: 'toque', nome: 'Toque', grupo: 'Cliques e toques' },
  { id: 'interruptor', nome: 'Interruptor', grupo: 'Cliques e toques' },
  { id: 'selecao', nome: 'Seleção', grupo: 'Cliques e toques' },
  { id: 'alternar', nome: 'Alternar', grupo: 'Cliques e toques' },
  { id: 'pop', nome: 'Pop', grupo: 'Pop e bolha' },
  { id: 'gota', nome: 'Gota', grupo: 'Pop e bolha' },
  { id: 'beliscada', nome: 'Corda beliscada', grupo: 'Pop e bolha' },
  { id: 'confirmacao', nome: 'Confirmação', grupo: 'Interface' },
  { id: 'notificacao', nome: 'Notificação', grupo: 'Interface' },
  { id: 'erro', nome: 'Erro', grupo: 'Interface' },
  { id: 'vidro', nome: 'Vidro', grupo: 'Interface' },
  { id: 'abrir', nome: 'Abrir janela', grupo: 'Interface' },
  { id: 'fechar', nome: 'Fechar janela', grupo: 'Interface' },
  { id: 'whoosh', nome: 'Whoosh', grupo: 'Whoosh' },
  { id: 'swoosh', nome: 'Swoosh rápido', grupo: 'Whoosh' },
  { id: 'maquina', nome: 'Máquina de escrever', grupo: 'Papel e escrita' },
  { id: 'lapis', nome: 'Lápis', grupo: 'Papel e escrita' },
  { id: 'papel', nome: 'Papel deslizando', grupo: 'Papel e escrita' },
  { id: 'pagina', nome: 'Virar página', grupo: 'Papel e escrita' },
  { id: 'carimbo', nome: 'Carimbo', grupo: 'Papel e escrita' },
  { id: 'foto', nome: 'Foto (obturador)', grupo: 'Papel e escrita' },
  { id: 'glitch', nome: 'Glitch', grupo: 'Tecnologia' },
  { id: 'laser', nome: 'Scan', grupo: 'Tecnologia' },
  { id: 'liga', nome: 'Ligando', grupo: 'Tecnologia' },
  { id: 'zap', nome: 'Zap', grupo: 'Tecnologia' },
  { id: 'impacto', nome: 'Impacto grave', grupo: 'Impacto' },
];
export const GRUPOS_SFX = [...new Set(SFX.map(x => x.grupo))];
export const audioSfx = (id: string) => `/videos/criar/sfx/${id}.mp3`;

/* ---------- O pedido ---------- */

export type Escolhas = {
  formato: string; legenda: string; cor: string; camera: string;
  estilos: string[]; motions: string[]; corFx: string; trilha: string; sfx: string[];
};

export function montarPedidoZero(e: Escolhas): string {
  const f = FORMATOS.find(x => x.codigo === e.formato);
  const l = LEGENDAS.find(x => x.codigo === e.legenda);
  const linhas = [
    'PEDIDO DE EDIÇÃO · CRIAR DO ZERO',
    'Monte o meu vídeo do zero no Modo Editor com estas escolhas. Cada código tem uma receita pronta: siga a receita de cada código. O que eu não escolhi, decida você no padrão profissional.',
    '',
  ];
  if (f) linhas.push(`- Formato: ${f.codigo} · ${f.nome} (${f.pedido})`);
  if (l) linhas.push(l.codigo === 'LEG-00' ? '- Legenda: LEG-00 · sem legenda' : `- Legenda: ${l.codigo} · ${l.nome} · cor ${(e.cor || '#8B5CF6').toUpperCase()}`);
  const c = CAMERAS.find(x => x.codigo === e.camera);
  if (c) linhas.push(`- Câmera: ${c.codigo} · ${c.nome} (${c.pedido})`);
  const est = e.estilos.map(id => ESTILOS.find(x => x.id === id)).filter((x): x is EstiloFx => !!x);
  if (est.length) linhas.push(`- Estilo dos efeitos: ${est.map(x => x.nome).join(', ')}`);
  const ms = e.motions.map(efeito).filter((m): m is Efeito => !!m);
  if (ms.length) linhas.push(`- Efeitos na tela (um depois do outro, cada um no momento certo da fala; cor dos efeitos ${(e.corFx || '#8B5CF6').toUpperCase()}): ${ms.map(m => `${m.codigo} · ${m.nome}`).join('; ')}. Adapte os textos à minha fala.`);
  else if (est.length && f?.id !== 'cheia') linhas.push(`- Efeitos na tela: escolha você os efeitos desses estilos (cor dos efeitos ${(e.corFx || '#8B5CF6').toUpperCase()}), adaptados à minha fala.`);
  const tr = TRILHAS.find(x => x.codigo === e.trilha);
  if (tr) linhas.push(tr.codigo === 'SOM-00' ? '- Trilha: SOM-00 · sem trilha' : `- Trilha: ${tr.codigo} · ${tr.nome}`);
  const sf = e.sfx.map(id => SFX.find(x => x.id === id)).filter((x): x is Sfx => !!x);
  linhas.push(sf.length ? `- Efeitos sonoros (SFX, revezando nos momentos da fala): ${sf.map(x => `${x.id} · ${x.nome}`).join('; ')}` : '- Efeitos sonoros: nenhum');
  linhas.push('');
  if (f?.id === 'narracao') linhas.push('Eu não apareço: vou te mandar a narração (áudio ou texto).');
  linhas.push('Antes de fazer o vídeo inteiro, me mostre uma prévia de 10 segundos.');
  return linhas.join('\n');
}

/** Porta 1: a pessoa já tem uma referência (um vídeo do catálogo, um vídeo dela ou um de fora). */
export const PROMPT_REFERENCIA = [
  'Vou te mandar o meu vídeo e um vídeo de referência (o arquivo ou o link). Também posso mandar um áudio explicando como eu quero.',
  'Primeiro, transcreva e analise a referência: o que ela faz nos cortes, na legenda, nos elementos que aparecem na tela, na câmera, nas cores e no som.',
  'Me diga o que você consegue fazer igual com as suas ferramentas e o que não consegue. Se faltar alguma coisa, procure uma ferramenta que resolva ou me diga com clareza o que vai ficar diferente.',
  'Depois, edite o meu vídeo no mesmo estilo da referência (o estilo, nunca o conteúdo dela). Antes de fazer o vídeo inteiro, me mostre uma prévia de 10 segundos.',
].join('\n\n');
