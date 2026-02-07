import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, GripVertical } from 'lucide-react';
import { TimelineEntry } from '@/lib/pdfTemplates';

interface TimelineEditorProps {
  value: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
  maxEntries?: number;
  disabled?: boolean;
}

export function TimelineEditor({ 
  value, 
  onChange, 
  maxEntries = 20,
  disabled 
}: TimelineEditorProps) {
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const addEntry = () => {
    if (!newDate.trim() || !newDescription.trim()) return;
    if (value.length >= maxEntries) return;

    onChange([...value, { date: newDate.trim(), description: newDescription.trim() }]);
    setNewDate('');
    setNewDescription('');
  };

  const removeEntry = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: 'date' | 'description', newValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const canAdd = value.length < maxEntries && newDate.trim() && newDescription.trim();

  return (
    <div className="space-y-4">
      <Label>Timeline Entries</Label>
      
      {/* Existing entries */}
      {value.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {value.map((entry, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 p-2 rounded-lg border border-border bg-muted/30"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-[100px_1fr] gap-2">
                <Input
                  value={entry.date}
                  onChange={(e) => updateEntry(index, 'date', e.target.value)}
                  placeholder="Date"
                  className="text-xs h-8"
                  disabled={disabled}
                />
                <Input
                  value={entry.description}
                  onChange={(e) => updateEntry(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="text-xs h-8"
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeEntry(index)}
                disabled={disabled}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new entry form */}
      {value.length < maxEntries && (
        <div className="flex items-end gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/20">
          <div className="flex-1 grid grid-cols-[100px_1fr] gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="Jan 2024"
                className="text-xs h-8"
                disabled={disabled}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="First companion: Elder Smith"
                className="text-xs h-8"
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdd) {
                    e.preventDefault();
                    addEntry();
                  }
                }}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 h-8"
            onClick={addEntry}
            disabled={disabled || !canAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      )}

      {/* Entry count */}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxEntries} entries
      </p>
    </div>
  );
}
