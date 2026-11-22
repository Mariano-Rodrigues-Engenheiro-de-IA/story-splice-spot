import { ESTILOS_LEGENDA } from '@/components/legendas-modelos';
import { arquivosEstilo, estilos as estilosCatalogo } from '@/lib/estilos';

/* "Criar meu vídeo" (21/11/2026): ferramenta SEPARADA do Catálogo (o catálogo são só referências; o "Usar" copia o
   prompt com o código). Duas portas: (1) tenho uma referência -> prompt pronto; (2) criar do zero -> o aluno monta o
   vídeo camada por camada em cima de um trecho CRU de 10 s dele (o vídeo "vai sendo construído").

   REGRA (dele): toda opção tem exemplo de verdade. Os exemplos de legenda saem do legendas.py da própria skill
   (D:/criar_do_zero/gerar_legendas.py): o que o aluno vê é o que a IA dele faz. Cada opção tem um CÓDIGO permanente
   que a skill liga à receita (biblioteca/criar-do-zero.md). Código novo = linha nova aqui + receita na skill. */

export type Formato = { codigo: string; id: 'cheia' | 'cartao' | 'dividida' | 'narracao'; nome: string; desc: string; pedido: string };

/** exemplo de cada formato = trecho de um vídeo DELE já aprovado, só a parte em que aquele formato aparece:
    public/videos/criar/fmt-0N.mp4 (FUN-03, MOT-02 12,4-20,4 s, MOT-01 4,8-9,8 s, COL-01 0-8 s) */
export const FORMATOS: Formato[] = [
  { codigo: 'FMT-01', id: 'cheia', nome: 'Tela cheia', desc: 'Você na tela toda, só com a legenda.', pedido: 'tela cheia, só com a legenda (nenhum elemento por cima de mim)' },
  { codigo: 'FMT-02', id: 'cartao', nome: 'Você no cartão', desc: 'Os motions em cima e você num cartão embaixo.', pedido: 'os motions em cima e eu num cartão embaixo' },
  { codigo: 'FMT-03', id: 'dividida', nome: 'Tela dividida', desc: 'Metade de cima para os motions, você na metade de baixo.', pedido: 'tela dividida: os motions na metade de cima e eu na metade de baixo' },
  { codigo: 'FMT-04', id: 'narracao', nome: 'Só narração', desc: 'Você não aparece: a sua voz e os motions na tela toda.', pedido: 'eu não apareço: a minha narração com os motions na tela toda' },
];

export type Legenda = { codigo: string; nome: string; desc: string };

/** 22/11 (ele): cada legenda DIFERENTE de verdade + a cor escolhida pela pessoa. Os estilos são desenhados ao vivo pelo
    motor src/components/legendas-modelos.tsx (o mesmo da skill: composição LegendaModelo). LEG-00 = sem legenda. */
export const LEGENDAS: Legenda[] = [{ codigo: 'LEG-00', nome: 'Sem legenda', desc: 'Só você falando.' }, ...ESTILOS_LEGENDA];

export const exemploFormato = (codigo: string) => ({ loop: `/videos/criar/${codigo.toLowerCase()}.mp4`, capa: `/videos/criar/${codigo.toLowerCase()}.webp` });

/** o vídeo cru (a legenda vai por cima, ao vivo); no formato só narração, o fundo roxo com a voz */
export const videoBase = (narracao: boolean) => ({ video: `/videos/criar/base${narracao ? '-n' : ''}.mp4`, capa: '/videos/criar/base.webp' });

/** as palavras do trecho cru (public/videos/criar/base.mp4, 10,3 s), tempo de cada uma: a legenda ao vivo usa isto */
export const TRECHO_PALAVRAS = [{"t": "Gravar,", "ini": 0.06, "fim": 0.84}, {"t": "ligar", "ini": 1.1, "fim": 1.5}, {"t": "a", "ini": 1.5, "fim": 1.64}, {"t": "câmera,", "ini": 1.64, "fim": 2.0}, {"t": "acertar", "ini": 2.3, "fim": 2.74}, {"t": "a", "ini": 2.74, "fim": 2.84}, {"t": "luz,", "ini": 2.84, "fim": 3.18}, {"t": "errar", "ini": 3.46, "fim": 3.76}, {"t": "a", "ini": 3.76, "fim": 3.92}, {"t": "fala,", "ini": 3.92, "fim": 4.26}, {"t": "gravar", "ini": 4.56, "fim": 4.94}, {"t": "de", "ini": 4.94, "fim": 5.04}, {"t": "novo.", "ini": 5.04, "fim": 5.28}, {"t": "E", "ini": 5.5, "fim": 5.92}, {"t": "tem", "ini": 5.92, "fim": 6.02}, {"t": "dia", "ini": 6.02, "fim": 6.18}, {"t": "que", "ini": 6.18, "fim": 6.3}, {"t": "você", "ini": 6.3, "fim": 6.48}, {"t": "está", "ini": 6.48, "fim": 6.68}, {"t": "cansado,", "ini": 6.68, "fim": 7.42}, {"t": "sem", "ini": 7.58, "fim": 7.7}, {"t": "tempo,", "ini": 7.7, "fim": 8.22}, {"t": "doente", "ini": 8.42, "fim": 8.84}, {"t": "ou", "ini": 8.84, "fim": 9.26}, {"t": "só", "ini": 9.26, "fim": 9.4}, {"t": "não", "ini": 9.4, "fim": 9.52}, {"t": "quer", "ini": 9.52, "fim": 9.68}, {"t": "aparecer.", "ini": 9.68, "fim": 10.06}];
/** palavras fortes do trecho (ganham a cor nos estilos que destacam) */
export const TRECHO_DESTAQUES = ['câmera', 'luz', 'cansado', 'aparecer'];

/** Estilo do vídeo (pedido dele, 22/11): antes dos efeitos a pessoa escolhe o estilo, com o exemplo de cada um. São os
    estilos do Catálogo que têm vídeo; o código vai no pedido e a skill segue a receita dele (estilos-catalogo/codigos.md). */
export type EstiloVideo = { id: string; codigo: string; nome: string; dark: boolean };
export const ESTILOS_VIDEO: EstiloVideo[] = estilosCatalogo
  .filter(x => x.temExemplo && x.testado && x.exemplos[0])
  .map(x => ({ id: x.id, codigo: x.exemplos[0]!.codigo, nome: x.nome, dark: x.grupo === 'dark' }));
export const exemploEstilo = (id: string) => {
  const e = estilosCatalogo.find(x => x.id === id);
  return arquivosEstilo(e?.exemplos[0]?.id ?? id);
};

/** Os motions: cada um renderizado PELA SKILL (modelo-motion) sobre as palavras do trecho, no fundo da zona
    (#110c22). Arquivos em public/videos/criar/motions/<codigo>.mp4 (gerador: D:/criar_do_zero/motions.mjs). */
export type Motion = { codigo: string; nome: string; cat: string };
export const CATEGORIAS_MOTION = ['Texto e 2D', 'Chamadas', 'Dados e painéis', '3D', 'Cenas e transições'] as const;
/** os TIPOS de efeito (um passo antes dos motions), cada um com um motion de exemplo */
export const TIPOS: { cat: string; nome: string; desc: string; exemplo: string }[] = [
  { cat: 'Texto e 2D', nome: 'Motion gráfico 2D', desc: 'Títulos, listas, ícones, números e setas animados no que você fala.', exemplo: 'PEC-02' },
  { cat: 'Chamadas', nome: 'Chamadas e destaques', desc: 'Gancho grande, palavra em destaque, chamada final com botão, selo.', exemplo: 'PEC-08' },
  { cat: 'Dados e painéis', nome: 'Dados e painéis', desc: 'Gráficos, cartões de passo, painéis de bastidor e de aula.', exemplo: 'PEC-12' },
  { cat: '3D', nome: '3D realista', desc: 'Celular, lâmpada, produto, casa, anatomia, obra: objetos 3D com luz de estúdio.', exemplo: 'PEC-15' },
  { cat: 'Cenas e transições', nome: 'Cenas e transições', desc: 'Imagens contando a história, troca em quadrados, troca com scan.', exemplo: 'PEC-22' },
];
export const MOTIONS: Motion[] = [
  { codigo: 'PEC-01', nome: 'Título com subtítulo', cat: 'Texto e 2D' },
  { codigo: 'PEC-02', nome: 'Lista que vai marcando', cat: 'Texto e 2D' },
  { codigo: 'PEC-03', nome: 'Ícones animados', cat: 'Texto e 2D' },
  { codigo: 'PEC-04', nome: 'Número que conta', cat: 'Texto e 2D' },
  { codigo: 'PEC-05', nome: 'Seta desenhada', cat: 'Texto e 2D' },
  { codigo: 'PEC-06', nome: 'Texto digitando', cat: 'Texto e 2D' },
  { codigo: 'PEC-07', nome: 'Cartela de tela cheia', cat: 'Texto e 2D' },
  { codigo: 'PEC-08', nome: 'Gancho em linhas grandes', cat: 'Chamadas' },
  { codigo: 'PEC-09', nome: 'Palavra em pílula de vidro', cat: 'Chamadas' },
  { codigo: 'PEC-10', nome: 'Chamada final com botão', cat: 'Chamadas' },
  { codigo: 'PEC-11', nome: 'Selo de vidro', cat: 'Chamadas' },
  { codigo: 'PEC-12', nome: 'Gráfico de vidro', cat: 'Dados e painéis' },
  { codigo: 'PEC-13', nome: 'Cartões de passo', cat: 'Dados e painéis' },
  { codigo: 'PEC-14', nome: 'Painel de bastidor', cat: 'Dados e painéis' },
  { codigo: 'PEC-25', nome: 'Painel com imagem e itens', cat: 'Dados e painéis' },
  { codigo: 'PEC-15', nome: 'Celular 3D', cat: '3D' },
  { codigo: 'PEC-16', nome: 'Lâmpada que acende', cat: '3D' },
  { codigo: 'PEC-17', nome: 'Produto girando', cat: '3D' },
  { codigo: 'PEC-18', nome: 'Casa montando em 3D', cat: '3D' },
  { codigo: 'PEC-19', nome: 'Objeto dando a volta', cat: '3D' },
  { codigo: 'PEC-20', nome: 'Anatomia com corte', cat: '3D' },
  { codigo: 'PEC-21', nome: 'Obra sendo construída', cat: '3D' },
  { codigo: 'PEC-22', nome: 'Cenas que contam a história', cat: 'Cenas e transições' },
  { codigo: 'PEC-23', nome: 'Fundo que se desfaz em quadrados', cat: 'Cenas e transições' },
  { codigo: 'PEC-24', nome: 'Troca com linha de scan', cat: 'Cenas e transições' },
];
export const videoMotion = (codigo: string) => ({ video: `/videos/criar/motions/${codigo.toLowerCase()}.mp4`, capa: `/videos/criar/motions/${codigo.toLowerCase()}.webp` });

/** Em que segundos do trecho cada motion tem algo na tela (medido no vídeo: D:/criar_do_zero/janelas_motions.py). */
export const JANELAS: Record<string, [number, number][]> = {"PEC-01":[[0.0,10.0]],"PEC-02":[[1.0,10.25]],"PEC-03":[[0.25,2.0],[2.75,5.0],[6.75,10.0]],"PEC-04":[[1.0,10.0]],"PEC-05":[[0.0,4.75],[6.25,10.0]],"PEC-06":[[1.5,5.25],[6.75,10.0]],"PEC-07":[[0.25,4.75],[5.5,9.75]],"PEC-08":[[0.25,9.75]],"PEC-09":[[6.75,9.75]],"PEC-10":[[0.25,10.25]],"PEC-11":[[0.5,9.75]],"PEC-12":[[0.5,10.25]],"PEC-13":[[1.0,10.25]],"PEC-14":[[1.5,10.25]],"PEC-15":[[0.0,10.25]],"PEC-16":[[0.0,10.25]],"PEC-17":[[0.0,10.25]],"PEC-18":[[0.25,10.25]],"PEC-19":[[0.0,10.25]],"PEC-20":[[0.0,10.25]],"PEC-21":[[0.0,10.25]],"PEC-22":[[0.0,10.25]],"PEC-23":[[0.0,10.25]],"PEC-24":[[0.0,10.25]],"PEC-25":[[0.5,10.0]]};

/** Vários motions no mesmo vídeo: um depois do outro, cada um no momento em que ele tem algo na tela; cada um fica
    pelo menos ~2,5 s antes de dar a vez ao próximo (como numa edição de verdade). */
export function agendaMotions(cods: string[], dur = 10.3, passo = 0.25, fica = 2.5): { ini: number; fim: number; c: string }[] {
  const ativo = (c: string, t: number) => (JANELAS[c] ?? []).some(([a, b]) => t >= a && t < b);
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

/** Trilhas: originais do sons.py da skill (sem licença), no nível de fundo. Efeitos: a paleta aprovada da skill,
    misturada com a voz do trecho nos momentos da fala (public/videos/criar/som/). */
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
export const EFEITOS: Som[] = [
  { codigo: 'EFE-01', nome: 'Cliques suaves', desc: 'um clique leve em cada coisa que entra' },
  { codigo: 'EFE-02', nome: 'Cliques firmes', desc: 'cada texto bate com força' },
  { codigo: 'EFE-03', nome: 'Whoosh leve', desc: 'passagens de ar suaves' },
  { codigo: 'EFE-04', nome: 'Whoosh forte', desc: 'viradas rápidas e graves' },
  { codigo: 'EFE-05', nome: 'Lápis e rabisco', desc: 'som de risco e desenho' },
  { codigo: 'EFE-06', nome: 'Tecnologia', desc: 'deslizes, notificação e "ligar"' },
  { codigo: 'EFE-07', nome: 'Interface', desc: 'toques de tela e seleção' },
  { codigo: 'EFE-08', nome: 'Toque na tela', desc: 'toque de dedo e clique de botão' },
  { codigo: 'EFE-09', nome: 'Impacto grave', desc: 'poucos sons, fortes, nos picos' },
  { codigo: 'EFE-10', nome: 'Sem efeitos', desc: 'só a voz e a trilha' },
];
export const audioTrilha = (codigo: string) => (codigo === 'SOM-00' ? null : `/videos/criar/som/${codigo.toLowerCase()}.m4a`);
export const audioEfeitos = (codigo: string) => `/videos/criar/som/${codigo.toLowerCase()}.m4a`;

export type Escolhas = { formato: string; estilo: string; legenda: string; cor: string; tipos: string[]; motions: string[]; trilha: string; efeitos: string };

export function montarPedidoZero(e: Escolhas): string {
  const f = FORMATOS.find(x => x.codigo === e.formato);
  const l = LEGENDAS.find(x => x.codigo === e.legenda);
  const linhas = [
    'PEDIDO DE EDIÇÃO · CRIAR DO ZERO',
    'Monte o meu vídeo do zero no Modo Editor com estas escolhas. Cada código tem uma receita pronta: siga a receita de cada código. O que eu não escolhi, decida você no padrão profissional.',
    '',
  ];
  if (f) linhas.push(`- Formato: ${f.codigo} · ${f.nome} (${f.pedido})`);
  const est = ESTILOS_VIDEO.find(x => x.id === e.estilo);
  if (est) linhas.push(`- Estilo do vídeo: ${est.nome} (código ${est.codigo} do Catálogo de Estilos: siga a receita dele)`);
  if (l) linhas.push(l.codigo === 'LEG-00' ? '- Legenda: LEG-00 · sem legenda' : `- Legenda: ${l.codigo} · ${l.nome} · cor ${(e.cor || '#8B5CF6').toUpperCase()}`);
  if (e.tipos?.length) linhas.push(`- Tipos de efeito: ${e.tipos.join(', ')}`);
  const ms = (e.motions ?? []).map(c => MOTIONS.find(m => m.codigo === c)).filter((m): m is Motion => !!m);
  if (ms.length) linhas.push(`- Efeitos na tela (um depois do outro, cada um no momento certo da fala): ${ms.map(m => `${m.codigo} · ${m.nome}`).join('; ')}. Adapte os textos à minha fala.`);
  const tr = TRILHAS.find(x => x.codigo === e.trilha);
  if (tr) linhas.push(tr.codigo === 'SOM-00' ? '- Trilha: SOM-00 · sem trilha' : `- Trilha: ${tr.codigo} · ${tr.nome}`);
  const ef = EFEITOS.find(x => x.codigo === e.efeitos);
  if (ef) linhas.push(`- Efeitos sonoros: ${ef.codigo} · ${ef.nome}`);
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
