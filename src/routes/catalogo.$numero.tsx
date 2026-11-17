import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { arquivosEstilo, estilos, nomeTipo } from '@/lib/estilos';
import { CartaoEstilo, ChamadaCompra, MarcaCatalogo, PedidoEstilo, estilosVisiveis, usePrevia } from '@/components/catalogo';
import { eventoProprio } from '@/lib/pixel';

/* /catalogo/NN (17/11/2026): um estilo do catálogo. Cada estilo tem endereço próprio para o anúncio daquele estilo
   (ex.: o criativo do Dark leva direto ao estilo Dark). Vídeo com som + ficha + "copiar pedido" + compra. */
export const Route = createFileRoute('/catalogo/$numero')({
  validateSearch: (s: Record<string, unknown>): { previa?: number } => ('previa' in s ? { previa: 1 } : {}),
  head: ({ params }) => {
    const e = estilos.find(x => x.numero === params.numero);
    const titulo = e ? `Estilo ${e.numero}: ${e.nome} · Catálogo de Estilos` : 'Catálogo de Estilos · Modo Editor';
    return { meta: [
      { title: titulo },
      { name: 'description', content: e ? e.frase : 'Escolha o estilo. A IA edita o seu vídeo igual.' },
      { property: 'og:title', content: titulo },
      { property: 'og:type', content: 'website' },
    ] };
  },
  component: PaginaEstilo,
});

function PaginaEstilo() {
  const { numero } = Route.useParams();
  const previa = usePrevia();
  const e = estilos.find(x => x.numero === numero);
  const visivel = !!e && (e.testado || previa);
  useEffect(() => { if (e && visivel) eventoProprio('Catalogo_Estilo', { estilo: e.numero }, false); }, [e, visivel]);
  const voltar = <Link to="/catalogo" search={previa ? { previa: 1 } : {}} className="cat-voltar"><ArrowLeft aria-hidden="true" /> Catálogo de Estilos</Link>;

  if (!e || !visivel) {
    return (
      <div className="cat"><main className="cat-coluna">
        {voltar}
        <p className="cat-vazio">{e ? 'Esse estilo ainda está em teste. Volte em breve.' : 'Não achamos esse estilo.'}</p>
      </main></div>
    );
  }

  const a = arquivosEstilo(e.numero);
  const outros = estilosVisiveis(previa).filter(x => x.numero !== e.numero);
  const ficha = [
    { r: 'Para quem', t: e.paraQuem },
    { r: 'O que você grava', t: e.voceGrava },
    { r: 'Do que precisa', t: e.precisa },
    { r: 'No exemplo', t: e.feitoCom === 'clone' ? 'Feito com o meu clone de IA.' : 'Gravado por mim, de verdade.' },
    ...(e.teste ? [{ r: 'No teste', t: e.teste.tempo + (e.teste.observacao ? ` ${e.teste.observacao}` : '') }] : []),
  ];

  return (
    <div className="cat">
      <main className="cat-coluna">
        {voltar}
        <div className={`cat-estilo ${e.formato === '16:9' ? 'cat-estilo-largo' : ''}`}>
          <div className="cat-player">
            <video key={e.numero} src={a.video} poster={a.capa} controls playsInline preload="metadata" />
          </div>
          <div className="cat-info">
            <MarcaCatalogo />
            <p className="cat-info-num">Estilo {e.numero}{!e.testado && <span className="cat-teste">em teste</span>}</p>
            <h1>{e.nome}</h1>
            <p className="cat-info-tipo">{nomeTipo(e.tipo)} · {e.formato}</p>
            <p className="cat-info-frase">{e.frase}</p>
            <dl className="cat-ficha">
              {ficha.map(f => <div key={f.r}><dt>{f.r}</dt><dd>{f.t}</dd></div>)}
            </dl>
            <PedidoEstilo e={e} />
          </div>
        </div>

        <ChamadaCompra estilo={e.numero} />

        {outros.length > 0 && (
          <section className="cat-outros">
            <h2>Outros estilos</h2>
            <div className="cat-grade">{outros.map(x => <CartaoEstilo key={x.numero} e={x} previa={previa} />)}</div>
          </section>
        )}
        <p className="cat-rodape">© 2026 Mariano Rodrigues · Modo Editor</p>
      </main>
    </div>
  );
}
