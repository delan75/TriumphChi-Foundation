import { useParams } from 'react-router-dom';

export function PageLoading() {
  const { locale } = useParams();

  return (
    <div role="status" className="px-4 py-12 text-center text-sm text-ink-600">
      {locale === 'fr' ? 'Chargement…' : 'Loading…'}
    </div>
  );
}
