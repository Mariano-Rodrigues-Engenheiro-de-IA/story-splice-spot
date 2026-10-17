// Single place to configure the sales page. Leave fields empty until the real values exist.
export type Testimonial = { result: string; quote: string; name: string; handle: string };

export const siteConfig = {
  /** Checkout link. Empty = every purchase button scrolls to the offer. */
  checkoutUrl: '',
  price: 67,
  /** Installment value for 12x on card, e.g. 6.93. 0 = installment line hidden. */
  installmentValue: 0,
  /** ISO date when the bonus ends, e.g. '2026-11-01T23:59:00-03:00'. Empty = no countdown. */
  bonusEndsAt: '',
  videos: {
    hero: '/videos/criativo06.mp4',
    raw: '/videos/antes.mp4',
    edited: '/videos/depois.mp4',
    gallery: ['', '', '', '', '', ''] as string[],
  },
  /** Real numbers of the raw/edited pair above (shown in the stats and the live demo). Update when the videos change. */
  demo: { cuts: 68, rawLength: '5:09', editedLength: '1:50', secondsSaved: 199 },
  /** Owner section. Shown only when a real video of the owner is set. */
  creator: { name: 'Mariano Rodrigues', video: '' },
  /** Only real, authorized testimonials. Empty list hides the section. */
  testimonials: [] as Testimonial[],
  legal: {
    companyName: '[Razão social]',
    cnpj: '[00.000.000/0000-00]',
    city: '[Cidade/UF]',
    termsUrl: '#',
    privacyUrl: '#',
    supportUrl: '#',
  },
};
