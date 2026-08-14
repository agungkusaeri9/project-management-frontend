import { StandardCategory } from '@/features/standard';
import { StandardCard } from './standard-card';

interface StandardCardListProps {
  categories: StandardCategory[];
}

export function StandardCardList({ categories }: StandardCardListProps) {
  return (
    <section aria-label="Engineering Standard Categories" className="w-full max-w-2xl mx-auto">
      <div className="space-y-3 sm:space-y-4">
        {categories.map((category) => (
          <StandardCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
