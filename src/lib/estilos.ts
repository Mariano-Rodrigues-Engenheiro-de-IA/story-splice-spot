/* Catálogo de Estilos do Modo Editor (17/11/2026). Biblioteca de estilos de EDIÇÃO (não de produção de vídeo):
   a pessoa vê o exemplo, toca em "Usar", copia o prompt e manda para a IA junto com o vídeo. Os estilos são camadas
   que se misturam (ex.: troca de fundo + motion design). O Dark tem variações.

   Regras dele (17/11): nome genérico (sem cor nem objeto: "Ilustração 3D", não "estúdio roxo com iPhone"), nada de
   explicar demais na página; o texto que explica vai dentro do prompt.

   REGRA ("ele tem que funcionar"): um estilo só aparece para o público depois de TESTADO numa instalação limpa, só com
   o que o aluno recebe, editando uma gravação que não é a do exemplo. Enquanto `testado` for false ele só aparece com
   ?previa no endereço.

   Estilo novo: uma ficha abaixo + em public/videos/catalogo/ os arquivos <id>.mp4 (6-14 s sem som, 360x640),
   <id>-som.mp4 (o mesmo com som, 720x1280) e <id>.webp (capa). A skill precisa da ficha com o mesmo nome em
   biblioteca/estilos-catalogo/. */

export type GrupoEstilo = 'voce' | 'dark';

export const gruposEstilo: { id: GrupoEstilo; nome: string }[] = [
  { id: 'voce', nome: 'Você aparece' },
  { id: 'dark', nome: 'Dark' },
];

/** exemplo: id do vídeo curto em public/videos/catalogo/ (aparece na janela do Usar quando o tipo é escolhido) */
export type Variante = { id: string; nome: string; instrucao: string; exemplo?: string };

export type Estilo = {
  id: string;
  nome: string;
  grupo: GrupoEstilo;
  /** o que a IA tem que fazer, em palavras simples (vai dentro do prompt) */
  instrucao: string;
  variantes?: Variante[];
  /** false = ainda sem vídeo de exemplo */
  temExemplo: boolean;
  testado: boolean;
  novo?: boolean;
};

export const estilos: Estilo[] = [
  {
    id: 'motion-design',
    nome: 'Motion design',
    grupo: 'voce',
    instrucao: 'enquanto eu falo, aparecem na tela elementos animados em 2D ligados ao que eu digo (textos, ícones, listas, gráficos, setas, passos), nos momentos certos e sem cobrir o meu rosto.',
    temExemplo: true,
    testado: false,
  },
  {
    id: 'imagens-e-videos',
    nome: 'Imagens e vídeos',
    grupo: 'voce',
    instrucao: 'quando eu falar de algo que dá para mostrar, entra por cima um vídeo ou uma imagem real daquilo (em tela cheia ou recortado ao meu lado) e depois volta para mim. Busque em bancos gratuitos com licença de uso comercial e anote os créditos.',
    temExemplo: true,
    testado: false,
  },
  {
    id: 'ilustracao-3d',
    nome: 'Ilustração 3D',
    grupo: 'voce',
    instrucao: 'quando eu citar um objeto, um produto ou uma parte do corpo, aparece uma ilustração 3D realista dele na tela, no momento em que eu falo, sem cobrir o meu rosto.',
    temExemplo: true,
    testado: false,
  },
  {
    id: 'troca-de-fundo',
    nome: 'Troca de fundo',
    grupo: 'voce',
    instrucao: 'troque o fundo atrás de mim por um cenário bonito e realista, sem mexer na minha imagem. Se eu não disser qual cenário, me mostre 3 opções antes.',
    temExemplo: true,
    testado: false,
  },
  {
    id: 'clean',
    nome: 'Clean',
    grupo: 'voce',
    instrucao: 'edição limpa e profissional: cortes nas pausas e nos erros, legenda discreta, luz, cor e som ajustados de leve e, só de vez em quando, um elemento simples na tela. Nada espalhafatoso.',
    temExemplo: true,
    // 18/11: passou no teste em instalação limpa (rodada 3: só a ficha, sem ajuste à mão; ~2 min de processamento)
    testado: true,
    novo: true,
  },
  {
    id: 'motion-3d',
    nome: 'Motion 3D',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração. Tudo o que é falado vira um objeto 3D grande e brilhante na cor da minha marca, num estúdio claro, um virando o outro no ritmo da fala e com a câmera sempre em movimento. Os objetos são criados do zero para o meu assunto e para o que o meu público precisa (me pergunte a minha profissão, o meu público, a cor da marca e o formato antes de começar).',
    temExemplo: true,
    // 19/11: passou no teste em instalação limpa (IA só com a skill, assunto novo: nutricionista; 27 min) e ele aprovou
    testado: true,
    novo: true,
  },
  {
    id: 'dark',
    nome: 'Dark',
    grupo: 'dark',
    instrucao: 'ninguém aparece, só a narração, e tudo o que é falado vira imagem na tela.',
    variantes: [
      { id: 'imagens', nome: 'Com imagens e vídeos', exemplo: 'dark', instrucao: 'tudo o que é narrado aparece em imagens e vídeos, montados em colagem com movimento e com as palavras-chave na tela.' },
      { id: 'desenho', nome: 'Em desenho', exemplo: 'dark-desenho', instrucao: 'tudo o que é narrado vai sendo desenhado na tela, em traço, como se alguém desenhasse a história enquanto ela é contada.' },
      { id: 'motion', nome: 'Em motion 3D', exemplo: 'motion-3d', instrucao: 'tudo o que é narrado vira um objeto 3D grande na cor da minha marca, num estúdio claro, um virando o outro no ritmo da fala.' },
    ],
    temExemplo: true,
    testado: false,
  },
];

export const arquivosEstilo = (id: string) => ({
  loop: `/videos/catalogo/${id}.mp4`,
  som: `/videos/catalogo/${id}-som.mp4`,
  capa: `/videos/catalogo/${id}.webp`,
});

const PREVIA = 'Antes de fazer o vídeo inteiro, me mostre uma prévia de 10 segundos.';

/** O prompt que a pessoa copia: um estilo, uma mistura de estilos ou o Dark numa variação. */
export function montarPrompt(principal: Estilo, extras: Estilo[], variante?: Variante): string {
  if (principal.grupo === 'dark') {
    const v = variante ?? principal.variantes?.[0];
    return [
      `Faça um vídeo no estilo "${principal.nome}${v ? ` (${v.nome.charAt(0).toLowerCase()}${v.nome.slice(1)})` : ''}" do Catálogo de Estilos do Modo Editor, com a narração que eu vou te mandar.`,
      `Como eu quero: ${principal.instrucao}${v ? ` ${v.instrucao.charAt(0).toUpperCase()}${v.instrucao.slice(1)}` : ''}`,
      PREVIA,
    ].join('\n\n');
  }
  if (extras.length === 0) {
    return [
      `Edite o vídeo que eu vou te mandar no estilo "${principal.nome}" do Catálogo de Estilos do Modo Editor.`,
      `Como eu quero: ${principal.instrucao}`,
      PREVIA,
    ].join('\n\n');
  }
  const todos = [principal, ...extras];
  return [
    `Edite o vídeo que eu vou te mandar misturando estes estilos do Catálogo de Estilos do Modo Editor: ${todos.map(e => `"${e.nome}"`).join(' + ')}.`,
    todos.map(e => `- ${e.nome}: ${e.instrucao}`).join('\n'),
    PREVIA,
  ].join('\n\n');
}
