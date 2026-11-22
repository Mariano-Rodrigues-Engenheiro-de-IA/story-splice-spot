/* Gerador de Pedido em camadas, dentro do Catálogo de Estilos (21/11/2026, pedido dele: o Gerador antigo tinha 14
   etapas e a pessoa ficava com dúvida; o novo vai só no que interessa, mas o caminho DETALHADO tem de ser detalhado).

   Camadas: 1 Estilo · 2 Legenda · 3 Cores · 4 Elementos (+ trazer de fora) · 5 Gancho, meio e fim · 6 Som e entrega.
   O texto que sai começa com "PEDIDO DE EDIÇÃO" e segue os blocos que a skill já lê (biblioteca/pedido-do-gerador.md),
   mais três blocos novos: ESTILO DO CATÁLOGO, ROTEIRO (GANCHO, MEIO E FIM) e CORES. Mudou um bloco aqui? Mude a
   tabela "Onde cada bloco vai" do pedido-do-gerador.md na skill também. */

import { estilos, type Estilo } from '@/lib/estilos';

export type Op = { id: string; nome: string; det?: string; pedido?: string };

/* ---------- 2. Legenda ---------- */
export const LEGENDAS: Op[] = [
  { id: 'exemplo', nome: 'Como no exemplo', det: 'a mesma legenda do vídeo do estilo', pedido: 'igual à do vídeo do estilo escolhido' },
  { id: 'palavra', nome: 'Palavra por palavra', det: 'cada palavra acende na hora em que é falada', pedido: 'Palavra por palavra, animada (cada palavra acende na hora em que é falada)' },
  { id: 'classica', nome: 'Frase clássica', det: 'a frase inteira, discreta, com contorno fino', pedido: 'Frase inteira, estilo clássico (discreta, com contorno fino)' },
  { id: 'elegante', nome: 'Elegante', det: 'letra fina e itálica, sem caixa', pedido: 'Elegante: letra serifada fina e itálica, sem caixa' },
  { id: 'impacto', nome: 'Impacto', det: 'poucas palavras por vez, grandes e grossas', pedido: 'Só as palavras-chave, grandes e grossas (poucas palavras por vez)' },
  { id: 'caixa', nome: 'Em faixa', det: 'o texto dentro de uma faixa colorida', pedido: 'A frase dentro de uma faixa colorida (na cor de destaque)' },
  { id: 'sem', nome: 'Sem legenda', pedido: 'Sem legenda' },
];
export const LEG_POS: Op[] = [
  { id: 'baixo', nome: 'Embaixo', pedido: 'no terço de baixo, abaixo do queixo' },
  { id: 'centro', nome: 'No meio', pedido: 'no centro da tela' },
  { id: 'cima', nome: 'Em cima', pedido: 'acima da cabeça' },
];
export const LEG_TAM: Op[] = [
  { id: 'grande', nome: 'Grande' },
  { id: 'medio', nome: 'Médio' },
  { id: 'discreto', nome: 'Discreto' },
];
export const LEG_DEST: Op[] = [
  { id: 'cor', nome: 'Na cor de destaque', pedido: 'as palavras importantes na cor de destaque' },
  { id: 'maior', nome: 'Maiores', pedido: 'as palavras importantes maiores que o resto' },
  { id: 'emoji', nome: 'Com emoji', pedido: 'um emoji nas palavras importantes' },
  { id: 'nenhum', nome: 'Sem destaque', pedido: 'sem destaque' },
];
export const LEG_LETRAS: Op[] = [
  { id: 'normal', nome: 'Como se escreve', pedido: 'como se escreve' },
  { id: 'maiusculas', nome: 'MAIÚSCULAS', pedido: 'tudo em maiúsculas' },
  { id: 'minusculas', nome: 'minúsculas', pedido: 'tudo em minúsculas (siglas continuam em maiúsculas)' },
];

/* ---------- 3. Cores ---------- */
export type Paleta = { id: string; nome: string; fundo: string; texto: string; destaque: string; apoio: string };
export const PALETAS: Paleta[] = [
  { id: 'roxo', nome: 'Roxo noturno', fundo: '#15102A', texto: '#FFFFFF', destaque: '#8B5CF6', apoio: '#C4B5FD' },
  { id: 'clinica', nome: 'Clínica clara', fundo: '#F7F5F0', texto: '#13294B', destaque: '#2E9E6B', apoio: '#B9C7D9' },
  { id: 'dourado', nome: 'Dourado elegante', fundo: '#121212', texto: '#F5EFE6', destaque: '#C8A45C', apoio: '#6B5B3E' },
  { id: 'agua', nome: 'Verde-água', fundo: '#0E1A1A', texto: '#FFFFFF', destaque: '#2DD4BF', apoio: '#99F6E4' },
  { id: 'amarelo', nome: 'Preto e amarelo', fundo: '#0A0A0A', texto: '#FFFFFF', destaque: '#FACC15', apoio: '#52525B' },
  { id: 'creme', nome: 'Editorial creme', fundo: '#EFE6D8', texto: '#1F1B16', destaque: '#B4532A', apoio: '#8C7B66' },
  { id: 'azul', nome: 'Azul tecnologia', fundo: '#0B1220', texto: '#E6F0FF', destaque: '#3B82F6', apoio: '#60A5FA' },
  { id: 'vermelho', nome: 'Vermelho impacto', fundo: '#111111', texto: '#FFFFFF', destaque: '#EF4444', apoio: '#FCA5A5' },
  { id: 'rosa', nome: 'Rosa suave', fundo: '#FFF5F7', texto: '#3B1F2B', destaque: '#E05A8A', apoio: '#F4C2D1' },
];
/** a paleta que vale nas prévias: "Como no exemplo" mostra o roxo; "Da minha marca" troca o destaque pela cor dela */
export function paletaAtiva(e: Estado): Paleta {
  if (e.paleta === 'marca') return { id: 'marca', nome: 'Da minha marca', fundo: '#111111', texto: '#FFFFFF', destaque: e.marca || '#8B5CF6', apoio: '#D4D4D8' };
  return PALETAS.find(p => p.id === e.paleta) ?? PALETAS[0]!;
}

/* ---------- 4. Elementos ---------- */
export const ELEMENTOS: Op[] = [
  { id: 'palavra-chave', nome: 'Palavra-chave grande', det: 'a palavra forte escrita na tela' },
  { id: 'titulos', nome: 'Títulos e chamadas', det: 'o assunto de cada parte' },
  { id: 'icones', nome: 'Ícones e painéis 2D', det: 'animados, no que você diz' },
  { id: 'lista', nome: 'Listas e passos', det: '1, 2, 3 aparecendo' },
  { id: 'numeros', nome: 'Números e gráficos', det: 'contando, subindo' },
  { id: 'objeto3d', nome: 'Objeto 3D realista', det: 'o objeto que você cita' },
  { id: 'corpo3d', nome: 'Anatomia em 3D', det: 'órgão, dente, músculo' },
  { id: 'celular3d', nome: 'Celular 3D com a tela', det: 'um print ou app dentro' },
  { id: 'mapa', nome: 'Mapa e satélite', det: 'descendo até a cidade' },
  { id: 'linha-tempo', nome: 'Linha do tempo', det: 'datas e marcos' },
  { id: 'imagens-banco', nome: 'Imagens e vídeos reais', det: 'de bancos grátis, com crédito' },
  { id: 'imagens-ia', nome: 'Imagens feitas por IA', det: 'cenas criadas para o assunto' },
  { id: 'prova', nome: 'Print ou prova', det: 'num celular, com você embaixo' },
  { id: 'setas', nome: 'Setas e marcações', det: 'círculos, riscos, destaques' },
  { id: 'emoji', nome: 'Emojis e figurinhas' },
  { id: 'troca-fundo', nome: 'Troca de fundo', det: 'cenário novo atrás de você' },
  { id: 'antes-depois', nome: 'Antes e depois', det: 'com cortina revelando' },
];
export const QUANTIDADE: Op[] = [
  { id: 'pouco', nome: 'Pouco', det: 'só nos momentos fortes', pedido: 'pouca, só nos momentos fortes' },
  { id: 'medio', nome: 'Médio', det: 'um a cada ideia nova', pedido: 'média, um elemento a cada ideia nova' },
  { id: 'muito', nome: 'Muito', det: 'algo novo a cada 1 ou 2 s', pedido: 'muita, algo novo na tela a cada 1 ou 2 segundos' },
];
export const COPIAR_REF: Op[] = [
  { id: 'movimento', nome: 'O movimento' },
  { id: 'elementos', nome: 'Os elementos' },
  { id: 'legenda', nome: 'A legenda' },
  { id: 'cores', nome: 'As cores' },
  { id: 'ritmo', nome: 'O ritmo' },
  { id: 'tudo', nome: 'Tudo' },
];

/* ---------- 5. Gancho, meio e fim ---------- */
export const GANCHO: Op[] = [
  { id: 'forte', nome: 'A frase mais forte primeiro', det: 'a IA escolhe', pedido: 'começar pela frase mais forte do vídeo (você escolhe)' },
  { id: 'gravado', nome: 'Do jeito que eu gravei', pedido: 'do jeito que eu gravei' },
  { id: 'frase', nome: 'Com esta frase', pedido: 'começar com esta frase' },
];
export const CHAMADA: Op[] = [
  { id: 'seguir', nome: 'Seguir o perfil', pedido: 'seguir o perfil' },
  { id: 'comentar', nome: 'Comentar uma palavra', pedido: 'comentar uma palavra' },
  { id: 'link', nome: 'Clicar no link da bio', pedido: 'clicar no link da bio' },
  { id: 'whatsapp', nome: 'Chamar no WhatsApp', pedido: 'chamar no WhatsApp' },
  { id: 'comprar', nome: 'Comprar', pedido: 'comprar (botão do anúncio)' },
  { id: 'nenhuma', nome: 'Sem chamada', pedido: 'sem chamada no fim' },
];
export const RITMO: Op[] = [
  { id: 'padrao', nome: 'Padrão', det: 'o normal para onde vai', pedido: 'padrão para onde o vídeo vai ser postado' },
  { id: 'acelerado', nome: 'Acelerado', det: 'sem respiro', pedido: 'acelerado, cortes rápidos, sem respiro' },
  { id: 'dinamico', nome: 'Dinâmico', det: 'respiro curto', pedido: 'dinâmico, ritmo de Reels, respiro curto' },
  { id: 'calmo', nome: 'Calmo', det: 'pausas naturais', pedido: 'calmo, mantém as pausas naturais' },
  { id: 'emocional', nome: 'Emocional', det: 'pausas de emoção', pedido: 'emocional, mantém as pausas de emoção' },
];
export const DURACAO: Op[] = [
  { id: 'livre', nome: 'O que precisar', pedido: 'o tempo que precisar' },
  { id: '30', nome: 'Até 30 s', pedido: 'até 30 segundos' },
  { id: '60', nome: 'Até 60 s', pedido: 'até 60 segundos' },
  { id: '90', nome: 'Até 90 s', pedido: 'até 90 segundos' },
];

/* ---------- 6. Som e entrega ---------- */
export const TRILHA: Op[] = [
  { id: 'ia', nome: 'A IA escolhe', pedido: 'você escolhe, combinando com o estilo' },
  { id: 'calma', nome: 'Calma' }, { id: 'animada', nome: 'Animada' }, { id: 'emocional', nome: 'Emocional' },
  { id: 'inspiradora', nome: 'Inspiradora' }, { id: 'tecnologia', nome: 'Tecnologia' }, { id: 'suspense', nome: 'Suspense' },
  { id: 'sem', nome: 'Sem trilha' },
];
export const SFX: Op[] = [
  { id: 'suaves', nome: 'Suaves', det: 'só nos momentos principais', pedido: 'suaves, só nos momentos principais' },
  { id: 'cada', nome: 'Em cada elemento', det: 'tudo o que entra tem som', pedido: 'em cada elemento que entra na tela, com presença sobre a voz' },
  { id: 'nenhum', nome: 'Nenhum', pedido: 'nenhum' },
];
export const ONDE: Op[] = [
  { id: 'reels', nome: 'Reels, TikTok, Shorts' },
  { id: 'anuncio', nome: 'Anúncio pago' },
  { id: 'stories', nome: 'Stories' },
  { id: 'youtube', nome: 'YouTube' },
  { id: 'aula', nome: 'Aula ou curso' },
  { id: 'vendas', nome: 'Vídeo de vendas' },
];
export const FORMATO: Op[] = [
  { id: '9:16', nome: 'Vertical 9:16', det: 'tela cheia do celular' },
  { id: '16:9', nome: 'Horizontal 16:9', det: 'YouTube, computador' },
  { id: '4:5', nome: 'Retrato 4:5', det: 'feed do Instagram' },
  { id: '1:1', nome: 'Quadrado 1:1' },
];
export const CAPRICHO: Op[] = [
  { id: 'profissional', nome: 'Profissional', det: 'o padrão do Modo Editor', pedido: 'Profissional (cortes, legenda, zoom, trilha e efeitos nos momentos-chave)' },
  { id: 'maximo', nome: 'Capricho máximo', det: 'demora mais e usa mais o plano', pedido: 'Capricho máximo (cada detalhe trabalhado; pode levar mais tempo)' },
];
export const QUALIDADE: Op[] = [
  { id: 'maxima', nome: 'Máxima', det: '4K, se gravou em 4K', pedido: 'Máxima (4K, se o vídeo foi gravado em 4K)' },
  { id: 'fullhd', nome: 'Full HD', det: 'arquivo mais leve', pedido: 'Full HD (1080p, arquivo mais leve)' },
];
export const FLUXO: Op[] = [
  { id: 'plano', nome: 'Plano e prévia', det: 'para nos dois e espera eu aprovar' },
  { id: 'previa', nome: 'Só a prévia', det: 'segue direto e para na prévia' },
  { id: 'direto', nome: 'Direto', det: 'faz tudo e me entrega pronto' },
];
const FLUXO_TEXTO: Record<string, string[]> = {
  plano: [
    'Antes de editar, me mostre o plano: o que vai cortar e o que entra em cada cena. Espere eu aprovar.',
    'Depois, faça uma prévia de 10 segundos com tudo (corte, legenda, efeito e som), num trecho que tenha efeito. Espere eu aprovar.',
    'Quando eu aprovar, faça o vídeo inteiro e confira tudo antes de me entregar.',
  ],
  previa: [
    'Escreva o plano (o que vai cortar e o que entra em cada cena), mas não pare para eu aprovar: siga direto.',
    'Faça uma prévia de 10 segundos com tudo (corte, legenda, efeito e som), num trecho que tenha efeito. Pare só aí e espere eu aprovar.',
    'Quando eu aprovar, faça o vídeo inteiro e confira tudo antes de me entregar.',
  ],
  direto: ['Faça tudo direto, sem parar para aprovação: escreva o plano, edite o vídeo inteiro, confira tudo e me entregue pronto. Eu peço os ajustes depois.'],
};
/* Mais opções (fechadas por padrão) */
export const ZOOM: Op[] = [
  { id: 'ia', nome: 'A IA decide' },
  { id: 'alternado', nome: 'Alternado a cada corte', pedido: 'alternado a cada corte (disfarça os cortes)' },
  { id: 'lento', nome: 'Lento e suave', pedido: 'lento e suave, nos momentos fortes' },
  { id: 'impacto', nome: 'Rápido, de impacto', pedido: 'rápido, de impacto, nas frases fortes' },
  { id: 'sem', nome: 'Sem zoom', pedido: 'sem zoom' },
];
export const FUNDO: Op[] = [
  { id: 'manter', nome: 'Manter como está' },
  { id: 'desfocar', nome: 'Desfocar', pedido: 'desfocar o fundo atrás de mim' },
];
export const COR: Op[] = [
  { id: 'natural', nome: 'Natural, como gravei' },
  { id: 'viva', nome: 'Mais viva', pedido: 'mais viva, sem exagero' },
  { id: 'quente', nome: 'Quente', pedido: 'quente, sem exagero' },
  { id: 'fria', nome: 'Fria', pedido: 'fria, sem exagero' },
  { id: 'cinema', nome: 'Cinema', pedido: 'cinema, sem exagero' },
  { id: 'pb', nome: 'Preto e branco', pedido: 'preto e branco' },
];

/* ---------- o que cada estilo já traz e o que vem marcado ---------- */
type Padrao = { jaVem: string; elementos: string[]; quantidade: string; onde?: string };
const PADRAO: Record<string, Padrao> = {
  documentario: { jaVem: 'a mesa de investigador, os papéis datilografados, os carimbos e o fio vermelho', elementos: ['linha-tempo', 'setas'], quantidade: 'muito' },
  'motion-3d': { jaVem: 'os objetos 3D no estúdio, um virando o outro', elementos: ['objeto3d', 'palavra-chave'], quantidade: 'muito' },
  'ilustracao-3d': { jaVem: 'a ilustração 3D do que você cita, sem cobrir o rosto', elementos: ['objeto3d', 'corpo3d'], quantidade: 'medio' },
  'antes-e-depois': { jaVem: 'as fotos alinhadas, as marcações elegantes e o nome da clínica no fim', elementos: ['antes-depois', 'setas'], quantidade: 'medio' },
  youtube: { jaVem: 'o zoom com ritmo, os painéis do que você explica e a abertura', elementos: ['titulos', 'icones'], quantidade: 'medio', onde: 'youtube' },
  aula: { jaVem: 'os painéis com os passos e os termos ao seu lado', elementos: ['lista', 'titulos'], quantidade: 'pouco', onde: 'aula' },
  'troca-de-fundo': { jaVem: 'o fundo trocado, desfazendo em quadradinhos', elementos: ['troca-fundo'], quantidade: 'pouco' },
  'motion-design': { jaVem: 'os elementos 2D animados no que você diz', elementos: ['icones', 'lista', 'numeros'], quantidade: 'medio' },
  dark: { jaVem: 'a colagem de imagens e vídeos com as palavras-chave', elementos: ['imagens-banco', 'imagens-ia', 'palavra-chave'], quantidade: 'muito' },
  'dark-desenho': { jaVem: 'o desenho em traço acompanhando a história', elementos: ['palavra-chave'], quantidade: 'medio' },
  clean: { jaVem: 'os cortes limpos e a legenda discreta', elementos: ['palavra-chave'], quantidade: 'pouco' },
  'imagens-e-videos': { jaVem: 'as imagens e os vídeos reais do que você fala', elementos: ['imagens-banco'], quantidade: 'medio' },
};
export const padraoDo = (id: string | null): Padrao | undefined => (id ? PADRAO[id] : undefined);

/* ---------- o estado do pedido ---------- */
export type Momento = { fala: string; quero: string };
export type Estado = {
  estilo: string | null; // id do estilo, 'livre' (sem estilo do catálogo) ou null (ainda não escolheu)
  codigo: string | null;
  legenda: string; legPos: string; legTam: string; legDest: string; legLetras: string;
  paleta: string; marca: string;
  elementos: string[]; quantidade: string; links: string; copiar: string[];
  assunto: string; publico: string;
  gancho: string; ganchoFrase: string; ganchoTela: boolean;
  meio: string; momentos: Momento[];
  chamada: string; chamadaTexto: string;
  ritmo: string; duracao: string;
  trilha: string; sfx: string; onde: string; formato: string; capricho: string; qualidade: string; fluxo: string;
  zoom: string; fundo: string; cor: string; naoPode: string; obs: string;
};

export const ESTADO_VAZIO: Estado = {
  estilo: null, codigo: null,
  legenda: 'exemplo', legPos: 'baixo', legTam: 'medio', legDest: 'cor', legLetras: 'normal',
  paleta: 'exemplo', marca: '#8B5CF6',
  elementos: [], quantidade: 'medio', links: '', copiar: [],
  assunto: '', publico: '',
  gancho: 'forte', ganchoFrase: '', ganchoTela: true,
  meio: '', momentos: [],
  chamada: 'seguir', chamadaTexto: '',
  ritmo: 'padrao', duracao: 'livre',
  trilha: 'ia', sfx: 'suaves', onde: 'reels', formato: '9:16', capricho: 'profissional', qualidade: 'maxima', fluxo: 'plano',
  zoom: 'ia', fundo: 'manter', cor: 'natural', naoPode: '', obs: '',
};

export const formatoDoLugar = (onde: string) => (onde === 'youtube' || onde === 'aula' ? '16:9' : '9:16');

/** Troca o estilo e põe o que ele traz marcado (elementos, quantidade, lugar), sem mexer no resto. */
export function comEstilo(e: Estado, id: string | null, codigo?: string | null): Estado {
  const est = estilos.find(x => x.id === id);
  const p = padraoDo(id);
  const onde = p?.onde ?? (e.onde === 'youtube' || e.onde === 'aula' ? 'reels' : e.onde);
  return {
    ...e,
    estilo: id,
    codigo: codigo ?? est?.exemplos[0]?.codigo ?? null,
    elementos: p ? [...p.elementos] : e.elementos,
    quantidade: p?.quantidade ?? e.quantidade,
    onde,
    formato: formatoDoLugar(onde),
    // sem estilo do catálogo não existe "como no exemplo": vira uma escolha de verdade
    legenda: id === 'livre' && e.legenda === 'exemplo' ? 'palavra' : e.legenda,
    paleta: id === 'livre' && e.paleta === 'exemplo' ? 'roxo' : e.paleta,
  };
}

const nome = (lista: Op[], id: string) => lista.find(o => o.id === id);
const txt = (lista: Op[], id: string) => { const o = nome(lista, id); return o ? (o.pedido ?? o.nome) : ''; };

/** O texto que a pessoa copia e cola na IA. Só entra o que foi escolhido; o resto a IA decide no padrão. */
export function montarPedido(e: Estado): string {
  const est: Estilo | undefined = estilos.find(x => x.id === e.estilo);
  const dark = est?.grupo === 'dark';
  const L: string[] = ['PEDIDO DE EDIÇÃO', 'O que eu não escolhi, decida você no padrão profissional.'];
  const bloco = (titulo: string, linhas: string[]) => { const l = linhas.filter(Boolean); if (l.length) L.push('', titulo, ...l); };

  if (est) {
    bloco('ESTILO DO CATÁLOGO', [
      `- Estilo: "${est.nome}"${e.codigo ? ` (código ${e.codigo})` : ''} do Catálogo de Estilos do Modo Editor. Siga a receita desse código.`,
      `- Como eu quero: ${est.instrucao}`,
      dark ? '- Ninguém aparece: eu vou mandar a narração (áudio ou texto).' : '',
    ]);
  } else if (e.estilo === 'livre') {
    bloco('ESTILO DO CATÁLOGO', ['- Nenhum: siga o que eu escolhi abaixo e a referência, se eu mandar uma.']);
  }

  bloco('SOBRE O VÍDEO', [
    e.assunto.trim() ? `- Assunto, em uma frase: ${e.assunto.trim()}` : '',
    e.publico.trim() ? `- Para quem é: ${e.publico.trim()}` : '',
    `- Onde vai ser postado: ${nome(ONDE, e.onde)?.nome ?? ''}`,
    `- Formato: ${nome(FORMATO, e.formato)?.nome ?? e.formato}`,
  ]);

  bloco('NÍVEL DE EDIÇÃO', [`- Quanto capricho: ${txt(CAPRICHO, e.capricho)}`]);

  bloco('CORTES E RITMO', [
    `- Ritmo: ${txt(RITMO, e.ritmo)}`,
    `- Duração final: ${txt(DURACAO, e.duracao)}`,
  ]);

  const momentos = e.momentos.filter(m => m.fala.trim() || m.quero.trim());
  bloco('ROTEIRO (GANCHO, MEIO E FIM)', [
    `- Gancho: ${e.gancho === 'frase' && e.ganchoFrase.trim() ? `começar com esta frase: “${e.ganchoFrase.trim()}”` : txt(GANCHO, e.gancho === 'frase' ? 'forte' : e.gancho)}${e.ganchoTela ? '; a frase do gancho escrita grande na tela' : ''}`,
    e.meio.trim() ? `- No meio: ${e.meio.trim()}` : '',
    ...momentos.map(m => `- Quando eu falo “${m.fala.trim() || '…'}”: ${m.quero.trim() || '…'}`),
    `- Final: ${e.chamada === 'nenhuma' ? 'sem chamada no fim' : `chamar para ${txt(CHAMADA, e.chamada)}`}${e.chamadaTexto.trim() && e.chamada !== 'nenhuma' ? ` (${e.chamadaTexto.trim()})` : ''}`,
  ]);

  if (e.zoom !== 'ia' && !dark) bloco('CÂMERA', [`- Zoom: ${txt(ZOOM, e.zoom)}`]);

  if (e.legenda === 'exemplo') {
    if (est) bloco('LEGENDA', ['- Tipo: igual à do vídeo do estilo escolhido']);
  } else if (e.legenda === 'sem') {
    bloco('LEGENDA', ['- Tipo: Sem legenda']);
  } else {
    bloco('LEGENDA', [
      `- Tipo: ${txt(LEGENDAS, e.legenda)}`,
      `- Posição: ${txt(LEG_POS, e.legPos)}`,
      `- Tamanho: ${nome(LEG_TAM, e.legTam)?.nome ?? ''}`,
      `- Destaque: ${txt(LEG_DEST, e.legDest)}`,
      `- Letras: ${txt(LEG_LETRAS, e.legLetras)}`,
    ]);
  }

  if (e.paleta === 'marca') {
    bloco('CORES', [`- A cor da minha marca é ${e.marca.toUpperCase()}: use como destaque nos textos, legendas e elementos, com neutros que combinem. Nunca mude a cor da minha imagem.`]);
  } else if (e.paleta !== 'exemplo') {
    const p = paletaAtiva(e);
    bloco('CORES', [`- Paleta "${p.nome}": fundo ${p.fundo}, texto ${p.texto}, destaque ${p.destaque}, apoio ${p.apoio}. Use nos textos, legendas, painéis e elementos. Nunca mude a cor da minha imagem.`]);
  }

  const els = e.elementos.map(id => nome(ELEMENTOS, id)?.nome.toLowerCase()).filter(Boolean);
  bloco('EFEITOS VISUAIS', [
    els.length ? `- O que pode aparecer na tela: ${els.join('; ')}` : '',
    `- Quantidade: ${txt(QUANTIDADE, e.quantidade)}`,
  ]);

  const links = e.links.split(/\s+/).map(s => s.trim()).filter(s => /^https?:\/\//i.test(s));
  if (links.length) {
    const cop = e.copiar.includes('tudo') ? 'tudo (o estilo, nunca o conteúdo)' : e.copiar.map(id => nome(COPIAR_REF, id)?.nome.toLowerCase()).filter(Boolean).join(', ');
    bloco('REFERÊNCIA', [
      ...links.map(l => `- Link: ${l}`),
      `- O que copiar: ${cop || 'o que combinar com o meu vídeo (o estilo, nunca o conteúdo)'}`,
      '- Analise a referência antes: diga o que você consegue fazer igual com as suas ferramentas e o que vai ficar diferente.',
    ]);
  }

  if (e.fundo !== 'manter' && !dark) bloco('FUNDO', [`- ${txt(FUNDO, e.fundo)}`]);
  if (e.cor !== 'natural') bloco('COR', [`- Tratamento de cor: ${txt(COR, e.cor)}`]);

  bloco('SOM', [
    `- Trilha: ${txt(TRILHA, e.trilha)}${e.trilha !== 'sem' ? ' (sempre baixa, abaixando quando eu falo)' : ''}`,
    `- Efeitos sonoros: ${txt(SFX, e.sfx)}`,
  ]);

  if (e.naoPode.trim()) bloco('O QUE NÃO PODE', [`- ${e.naoPode.trim()}`]);
  if (e.obs.trim()) bloco('OBSERVAÇÕES', [e.obs.trim()]);

  bloco('ENTREGA', [`- Qualidade final: ${txt(QUALIDADE, e.qualidade)}`, ...(FLUXO_TEXTO[e.fluxo] ?? FLUXO_TEXTO['plano']!).map(f => `- ${f}`)]);
  return L.join('\n');
}

/** O pedido do caminho rápido para quem tem um vídeo de referência de fora (o "modo preguiçoso" com referência). */
export const PROMPT_REFERENCIA = [
  'Vou te mandar o meu vídeo e um vídeo de referência (o arquivo ou o link). Também posso mandar um áudio explicando como eu quero.',
  'Primeiro, transcreva e analise a referência: o que ela faz nos cortes, na legenda, nos elementos que aparecem na tela, na câmera, nas cores e no som.',
  'Me diga o que você consegue fazer igual com as suas ferramentas e o que não consegue. Se faltar alguma coisa, procure uma ferramenta que resolva ou me diga com clareza o que vai ficar diferente.',
  'Depois, edite o meu vídeo no mesmo estilo da referência (o estilo, nunca o conteúdo dela). Antes de fazer o vídeo inteiro, me mostre uma prévia de 10 segundos.',
].join('\n\n');
