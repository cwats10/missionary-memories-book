import { PageTemplate, TEMPLATE_SPECS } from '@/lib/pdfTemplates';
import { cn } from '@/lib/utils';
import { Image, Layout, FileText, List } from 'lucide-react';

interface TemplateSelectorProps {
  value: PageTemplate;
  onChange: (template: PageTemplate) => void;
  disabled?: boolean;
}

const TEMPLATE_ICONS = {
  hero_image: Image,
  image_reflection: Layout,
  story: FileText,
  timeline: List,
};

const TEMPLATE_DIAGRAMS: Record<PageTemplate, React.ReactNode> = {
  hero_image: (
    <div className="w-full h-full bg-muted/50 flex items-end p-1">
      <div className="w-full h-1 bg-muted-foreground/20 rounded-sm" />
    </div>
  ),
  image_reflection: (
    <div className="w-full h-full flex flex-col p-1 gap-1">
      <div className="flex-1 bg-muted/50 rounded-sm" />
      <div className="h-1/3 space-y-0.5">
        <div className="h-0.5 bg-muted-foreground/20 w-full" />
        <div className="h-0.5 bg-muted-foreground/20 w-4/5" />
        <div className="h-0.5 bg-muted-foreground/20 w-3/5" />
      </div>
    </div>
  ),
  story: (
    <div className="w-full h-full p-1.5 space-y-1">
      <div className="flex gap-1">
        <div className="w-3 h-3 bg-gold/30 rounded-sm" />
        <div className="flex-1 space-y-0.5">
          <div className="h-0.5 bg-muted-foreground/20 w-full" />
          <div className="h-0.5 bg-muted-foreground/20 w-full" />
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="h-0.5 bg-muted-foreground/20 w-full" />
        <div className="h-0.5 bg-muted-foreground/20 w-full" />
        <div className="h-0.5 bg-muted-foreground/20 w-4/5" />
        <div className="h-0.5 bg-muted-foreground/20 w-full" />
        <div className="h-0.5 bg-muted-foreground/20 w-3/5" />
      </div>
    </div>
  ),
  timeline: (
    <div className="w-full h-full p-1.5 space-y-1">
      <div className="h-0.5 bg-gold/40 w-2/3 mb-1" />
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
        <div className="h-0.5 bg-muted-foreground/20 flex-1" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
        <div className="h-0.5 bg-muted-foreground/20 flex-1" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
        <div className="h-0.5 bg-muted-foreground/20 w-3/4" />
      </div>
    </div>
  ),
};

export function TemplateSelector({ value, onChange, disabled }: TemplateSelectorProps) {
  const templates: PageTemplate[] = ['hero_image', 'image_reflection', 'story', 'timeline'];

  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((template) => {
        const spec = TEMPLATE_SPECS[template];
        const Icon = TEMPLATE_ICONS[template];
        const isSelected = value === template;

        return (
          <button
            key={template}
            type="button"
            onClick={() => onChange(template)}
            disabled={disabled}
            className={cn(
              'relative flex flex-col rounded-lg border-2 p-3 text-left transition-all',
              'hover:border-gold/50 hover:bg-gold/5',
              'focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2',
              isSelected 
                ? 'border-gold bg-gold/10 ring-1 ring-gold/30' 
                : 'border-border bg-background',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Template diagram preview */}
            <div className="w-full aspect-[3/4] mb-2 rounded border border-border/50 bg-background overflow-hidden">
              {TEMPLATE_DIAGRAMS[template]}
            </div>

            {/* Template info */}
            <div className="flex items-start gap-2">
              <Icon className={cn(
                'h-4 w-4 mt-0.5 flex-shrink-0',
                isSelected ? 'text-gold' : 'text-muted-foreground'
              )} />
              <div className="min-w-0">
                <p className={cn(
                  'font-medium text-sm leading-tight',
                  isSelected ? 'text-foreground' : 'text-foreground/80'
                )}>
                  {spec.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {spec.description}
                </p>
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
            )}
          </button>
        );
      })}
    </div>
  );
}
