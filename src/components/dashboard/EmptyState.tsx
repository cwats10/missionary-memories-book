import { BookOpen } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-primary/5 rounded-full mb-6">
        <BookOpen className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="font-serif text-2xl mb-2">No vaults yet</h3>
      <p className="text-muted-foreground max-w-md">
        Create your first memory vault to start collecting messages, photos, and memories 
        from friends and family.
      </p>
    </div>
  );
}
