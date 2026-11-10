// Single place to configure the sales page. Leave fields empty until the real values exist.
export type Testimonial = { result: string; quote: string; name: string; handle: string };
/** Depoimento em vídeo (real e autorizado): vídeo vertical em public/videos, com a capa .webp ao lado. */
export type VideoTestimonial = { name: string; role: string; quote: string; video: string; destaque?: boolean; /** vídeo que a pessoa editou com o Modo Editor (aparece junto do depoimento na /pro2) */ resultado?: string };

export const siteConfig = {
  /** Checkout link. Empty = every purchase button scrolls to the offer. */
  checkoutUrl: 'https://pay.kiwify.com.br/hFsZJIo',
  /** Preço da página geral (/). Tem que bater com o checkout da Kiwify acima. */
  price: 67,
  /** Página dos profissionais (/pro): oferta de R$ 97 do mesmo produto, com checkout próprio. O pixel é o mesmo. */
  pro: {
    price: 97,
    checkoutUrl: 'https://pay.kiwify.com.br/xNp75vQ',
    /** Parcela de 12x no cartão, lida no checkout da Kiwify em 9/11/2026 ("12x de R$ 10,03", parcelamento com acréscimo). 0 = some a linha. */
    installmentValue: 10.03,
    /** Depoimentos em vídeo só da /pro (o com `destaque` vira a vitrine). Vídeo vazio = não aparece. */
    videoTestimonials: [
      {
        name: 'Karina Guimarães',
        role: 'dona de clínica de estética · aluna do Modo Editor',
        quote: 'Eu tava quebrando a cabeça com vídeo, com edição, e não conseguia. Resultados extraordinários.',
        video: '/videos/depo-esteticista.mp4' as string, // capa: depo-esteticista.webp (vídeo 3:4, mandado pelo WhatsApp em 3/11)
        resultado: '/videos/karina-estria.mp4', // vídeo que ela editou com o Modo Editor (estria, pele em 3D)
        destaque: true,
      },
    ] as VideoTestimonial[],
    /** Prints de WhatsApp de alunos (autorizados), recortados só nos balões, em public/img/prints (9/11/2026). Vazio = não aparece. */
    prints: [
      { src: '/img/prints/print-4.webp', quem: 'Rafael · nutricionista' },
      { src: '/img/prints/print-1.webp', quem: 'Aluno do Modo Editor' },
      { src: '/img/prints/print-5.webp', quem: 'Rafael · nutricionista' },
      { src: '/img/prints/print-2.webp', quem: 'Profissional de marketing' },
      { src: '/img/prints/print-3.webp', quem: 'Aluno do Modo Editor' },
    ] as { src: string; quem: string }[],
  },
  /** Edição feita pela equipe, cobrada por vídeo. É a segunda porta da página: quem não quer editar fala no WhatsApp.
   *  `precoPorVideo` vazio = a página não mostra valor, só "peça o valor no WhatsApp". Ex.: 'a partir de R$ 60 por vídeo'. */
  servico: {
    ativo: true,
    precoPorVideo: '' as string,
    mensagem: 'Oi! Quero saber como funciona a edição por vídeo feita por vocês.',
  },
  /** Preço depois do lançamento (o preço da oferta gira dele até `price`). 0 = sem preço de depois. */
  priceAfterLaunch: 197,
  /** Pixel da Meta. id vazio = pixel desligado. Mapa dos eventos em src/lib/pixel.ts. */
  pixel: {
    id: '1455677936481047' as string,
    /** true = dispara InitiateCheckout no clique do botão (aí desligue esse evento na Kiwify para não contar duas vezes). */
    initiateCheckoutNoBotao: false as boolean,
  },
  /** Installment value for 12x on card, e.g. 6.93. 0 = installment line hidden. */
  installmentValue: 0,
  /** ISO date when the bonus ends, e.g. '2026-11-01T23:59:00-03:00'. Empty = no countdown. */
  bonusEndsAt: '',
  videos: {
    hero: '/videos/criativo06.mp4',
    /** Vídeo de vendas (player com aviso de som e barra sem duração). Preenchido, ele substitui o vídeo do topo. */
    vsl: '/videos/vsl.mp4' as string,
    vslPoster: '/videos/vsl_capa.webp' as string,
    raw: '/videos/antes_mapa.mp4',
    edited: '/videos/depois_mapa.mp4',
    gallery: [] as string[],
    /** Cenas do vídeo de vendas espalhadas pela página (cada lugar com uma cena diferente). */
    cenas: {
      pronto: '/videos/cenas/pronto.mp4',
      legendaTroca: '/videos/cenas/legenda_troca.mp4',
      zoom: '/videos/cenas/zoom.mp4',
      fundoBruto: '/videos/cenas/fundo_bruto.mp4',
      fundoNovo: '/videos/cenas/fundo_novo.mp4',
      aoVivoBruto: '/videos/cenas/ao_vivo_bruto.mp4',
      aoVivoPronto: '/videos/cenas/ao_vivo_pronto.mp4',
      cruModo: '/videos/cenas/cru_modo.mp4',
      comModo: '/videos/cenas/com_modo.mp4',
    },
  },
  /** Real numbers of the raw/edited pair above (shown in the stats and the live demo). Update when the videos change. */
  demo: { cuts: 68, rawLength: '5:09', editedLength: '1:50', secondsSaved: 199 },
  /** Números reais do vídeo de vendas (gravação de 17/10/2026), usados na demonstração "ao vivo" com as cenas dele. */
  vslDemo: { cuts: 119, rawLength: '13:13', editedLength: '5:25' },
  /** Seção do produtor: foto em public/img. */
  creator: { name: 'Mariano Rodrigues', photo: '/img/mariano.webp' },
  /** Depoimentos em texto, reais e autorizados (o Mariano tem vários no WhatsApp: colar aqui).
   *  result = uma linha curta com a profissão ou o resultado ("Psicóloga · 2 vídeos por semana"); handle = @ ou cidade. */
  testimonials: [] as Testimonial[],
  /** Depoimentos em vídeo (reais e autorizados). O primeiro com `destaque` vira a vitrine, acima dos outros.
   *  Vídeo vazio = o depoimento não aparece (fica aqui esperando o arquivo). */
  videoTestimonials: [
    {
      name: 'Isaque',
      role: 'aluno do Modo Editor',
      quote: 'Depois que eu deixei o primeiro vídeo do jeito que eu gostei, o segundo e o terceiro vieram com muito mais facilidade.',
      video: '/videos/depo-isaque.mp4',
    },
  ] as VideoTestimonial[],
  /** WhatsApp de dúvidas (DDI + DDD + número, só dígitos). Vazio = sem botão flutuante. */
  whatsapp: '5561983012868',
  legal: {
    termsUrl: '#',
    privacyUrl: '#',
    supportUrl: 'https://api.whatsapp.com/send?phone=5561983012868&text=Oi!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20Modo%20Editor.',
  },
};
