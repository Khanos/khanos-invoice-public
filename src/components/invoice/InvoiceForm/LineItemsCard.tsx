"use client";

import { LineItem } from "@/types/invoice";
import { Card, Input, Textarea, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface LineItemsCardProps {
  lineItems: LineItem[];
  onUpdateItem: (id: string, field: keyof LineItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

/**
 * Card for managing invoice line items
 */
export default function LineItemsCard({
  lineItems,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}: LineItemsCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("lineItems")}
      headerAction={
        <Button variant="ghost" size="sm" onClick={onAddItem}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addItem")}
        </Button>
      }
    >
      <div className="space-y-4">
        {lineItems.map((item, index) => (
          <div
            key={item.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3"
          >
            {/* Item Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t("item")} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title={t("remove")}
                aria-label={`Remove item ${index + 1}`}
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            {/* Description */}
            <Textarea
              label={t("description")}
              value={item.description}
              onChange={(e) => onUpdateItem(item.id, "description", e.target.value)}
              placeholder="Service description..."
              rows={2}
            />

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("amountUSD")}
                type="number"
                value={item.amountUSD || ""}
                onChange={(e) =>
                  onUpdateItem(item.id, "amountUSD", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
              <Input
                label={t("amountEUR")}
                type="number"
                step="0.01"
                value={item.amountEUR || ""}
                onChange={(e) =>
                  onUpdateItem(item.id, "amountEUR", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
              />
            </div>
          </div>
        ))}

        {lineItems.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No items yet. Click &quot;{t("addItem")}&quot; to add one.
          </div>
        )}
      </div>
    </Card>
  );
}
