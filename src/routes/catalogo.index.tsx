import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { tiposEstilo, type TipoEstilo } from '@/lib/estilos';
import { CartaoEstilo, ChamadaCompra, MarcaCatalogo, estilosVisiveis, usePrevia } from '@/components/catalogo';

/* /catalogo (17/11/2026): o Catálogo de Estilos do Modo Editor. Aberto para todo mundo (vitrine: quem chega vê o vídeo
   e quer o dele igual) e usado pelo aluno, que escolhe o número e pede à IA. Os estilos e as regras estão em
   src/lib/estilos.ts; só aparecem os estilos já testados (com ?previa aparecem todos). */
export const Route = createFileRoute('/catalogo/')({
  validateSearch: (s: Record<string, unknown>): { previa?: number } => ('previa' in s ? { previa: 1 } : {}),
  head: () => ({ meta: [
    { title: 'Catálogo de Estilos · Modo Editor' },
    { name: 'description', content: 'Escolha o estilo de edição e a IA edita o seu vídeo igual. Veja cada estilo funcionando.' },
    { property: 'og:title', content: 'Catálogo de Estilos · Modo Editor' },
    { property: 'og:description', content: 'Escolha o estilo. A IA edita o seu vídeo igual.' },
    { property: 'og:type', content: 'website' },
  ] }),
  component: Catalogo,
});

const passos = [
  { n: '1', t: 'Escolha o estilo', d: 'Assista aos exemplos e guarde o número.' },
  { n: '2', t: 'Mande para a IA', d: 'O seu vídeo e o pedido: “estilo 01”.' },
  { n: '3', t: 'Ela edita igual', d: 'Mostra uma prévia e entrega o vídeo pronto.' },
];

function Catalogo() {
  const previa = usePrevia();
  const lista = estilosVisiveis(previa);
  const [tipo, setTipo] = useState<TipoEstilo | 'todos'>('todos');
  const tipos = tiposEstilo.filter(t => lista.some(e => e.tipo === t.id));
  const mostrados = tipo === 'todos' ? lista : lista.filter(e => e.tipo === tipo);

  return (
    <div className="cat">
      <main className="cat-coluna">
        <header className="cat-topo">
          <MarcaCatalogo />
          <h1>Catálogo de <em>Estilos</em></h1>
          <p className="cat-sub">Escolha o estilo. A IA edita o seu vídeo igual.</p>
          {lista.length > 0 && <p className="cat-conta">{lista.length} {lista.length === 1 ? 'estilo' : 'estilos'} · novos estilos entram sempre</p>}
        </header>

        <ol className="cat-passos">
          {passos.map(p => <li key={p.n}><span>{p.n}</span><div><strong>{p.t}</strong><p>{p.d}</p></div></li>)}
        </ol>

        {lista.length === 0 ? (
          <p className="cat-vazio">Os primeiros estilos estão sendo testados. Volte em breve.</p>
        ) : <>
          {tipos.length > 1 && (
            <div className="cat-filtros" role="tablist" aria-label="Tipo de vídeo">
              {[{ id: 'todos' as const, nome: 'Todos' }, ...tipos].map(t => (
                <button key={t.id} type="button" role="tab" aria-selected={tipo === t.id} className={`cat-filtro ${tipo === t.id ? 'ativo' : ''}`} onClick={() => setTipo(t.id)}>{t.nome}</button>
              ))}
            </div>
          )}
          <div className="cat-grade">
            {mostrados.map(e => <CartaoEstilo key={e.numero} e={e} previa={previa} />)}
          </div>
          <p className="cat-ref">Quer um estilo que não está aqui? Mande um vídeo de referência para a IA junto com o seu, e ela faz no mesmo estilo.</p>
        </>}

        <ChamadaCompra />
        <p className="cat-rodape">© 2026 Mariano Rodrigues · Modo Editor</p>
      </main>
    </div>
  );
}
