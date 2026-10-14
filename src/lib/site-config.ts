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
    hero: '',
    raw: '',
    edited: '',
    gallery: ['', '', '', '', '', ''] as string[],
  },
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
