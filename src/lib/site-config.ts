// Single place to configure the sales page. Leave fields empty until the real values exist.
export type Testimonial = { result: string; quote: string; name: string; handle: string };

export const siteConfig = {
  /** Checkout link. Empty = every purchase button scrolls to the offer. */
  checkoutUrl: 'https://pay.kiwify.com.br/hFsZJIo',
  price: 67,
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
      semModo: '/videos/cenas/sem_modo.mp4',
      comModo: '/videos/cenas/com_modo.mp4',
    },
  },
  /** Real numbers of the raw/edited pair above (shown in the stats and the live demo). Update when the videos change. */
  demo: { cuts: 68, rawLength: '5:09', editedLength: '1:50', secondsSaved: 199 },
  /** Números reais do vídeo de vendas (gravação de 17/10/2026), usados na demonstração "ao vivo" com as cenas dele. */
  vslDemo: { cuts: 119, rawLength: '13:13', editedLength: '5:25' },
  /** Owner section. Shown only when a real video of the owner is set. */
  creator: { name: 'Mariano Rodrigues', video: '/videos/cenas/criador.mp4' },
  /** Only real, authorized testimonials. Empty list hides the section. */
  testimonials: [] as Testimonial[],
  /** WhatsApp de dúvidas (DDI + DDD + número, só dígitos). Vazio = sem botão flutuante. */
  whatsapp: '5561983012868',
  legal: {
    termsUrl: '#',
    privacyUrl: '#',
    supportUrl: 'https://api.whatsapp.com/send?phone=5561983012868&text=Oi!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20Modo%20Editor.',
  },
};
