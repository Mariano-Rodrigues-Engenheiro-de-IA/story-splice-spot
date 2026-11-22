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

/** arquivos em public/videos/criar/<codigo minúsculo>.mp4 (sobre você), -n.mp4 (sobre o fundo da narração) e .webp */
export const LEGENDAS: Legenda[] = [
  { codigo: 'LEG-00', nome: 'Sem legenda', desc: 'Só você falando.' },
  { codigo: 'LEG-01', nome: 'Pop verde', desc: 'Palavra por palavra, destaque verde-água.' },
  { codigo: 'LEG-02', nome: 'Pop amarelo', desc: 'Palavra por palavra, destaque amarelo.' },
  { codigo: 'LEG-03', nome: 'Pop roxo', desc: 'Em maiúsculas, destaque roxo.' },
  { codigo: 'LEG-04', nome: 'Karaokê laranja', desc: 'A frase inteira, a palavra falada acende.' },
  { codigo: 'LEG-05', nome: 'Clássica discreta', desc: 'Frase pequena, branca, contorno fino.' },
  { codigo: 'LEG-06', nome: 'Elegante creme', desc: 'Letra serifada itálica, sem caixa.' },
  { codigo: 'LEG-07', nome: 'Impacto amarelo', desc: 'Uma ou duas palavras, grandes.' },
  { codigo: 'LEG-08', nome: 'Faixa roxa', desc: 'O texto dentro de uma faixa roxa.' },
  { codigo: 'LEG-09', nome: 'Faixa amarela', desc: 'O texto dentro de uma faixa amarela.' },
];

export const exemploFormato = (codigo: string) => ({ loop: `/videos/criar/${codigo.toLowerCase()}.mp4`, capa: `/videos/criar/${codigo.toLowerCase()}.webp` });

export const videoLegenda = (codigo: string, narracao: boolean) => {
  const base = codigo === 'LEG-00' ? 'base' : codigo.toLowerCase();
  return { video: `/videos/criar/${base}${narracao ? '-n' : ''}.mp4`, capa: `/videos/criar/${base}.webp` };
};

export type Escolhas = { formato: string; legenda: string };

export function montarPedidoZero(e: Escolhas): string {
  const f = FORMATOS.find(x => x.codigo === e.formato);
  const l = LEGENDAS.find(x => x.codigo === e.legenda);
  const linhas = [
    'PEDIDO DE EDIÇÃO · CRIAR DO ZERO',
    'Monte o meu vídeo do zero no Modo Editor com estas escolhas. Cada código tem uma receita pronta: siga a receita de cada código. O que eu não escolhi, decida você no padrão profissional.',
    '',
  ];
  if (f) linhas.push(`- Formato: ${f.codigo} · ${f.nome} (${f.pedido})`);
  if (l) linhas.push(`- Legenda: ${l.codigo} · ${l.nome}`);
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
