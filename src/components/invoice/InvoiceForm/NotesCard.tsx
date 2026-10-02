"use client";

import { Card, Textarea, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface NotesCardProps {
  notes: string[];
  onUpdateNote: (index: number, value: string) => void;
  onAddNote: () => void;
  onRemoveNote: (index: number) => void;
}

/**
 * Card for managing invoice notes
 */
export default function NotesCard({
  notes,
  onUpdateNote,
  onAddNote,
  onRemoveNote,
}: NotesCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("notes")}
      headerAction={
        <Button variant="ghost" size="sm" onClick={onAddNote}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addNote")}
        </Button>
      }
    >
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <Textarea
                value={note}
                onChange={(e) => onUpdateNote(index, e.target.value)}
                placeholder="Add a note..."
                rows={2}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveNote(index)}
              className="p-1.5 mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title={t("remove")}
              aria-label={`Remove note ${index + 1}`}
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No notes yet. Click &quot;{t("addNote")}&quot; to add one.
          </div>
        )}
      </div>
    </Card>
  );
}
