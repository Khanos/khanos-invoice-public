"use client";

import { InvoiceData } from "@/types/invoice";
import { Card, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { formatEUR } from "@/lib/utils";

interface TotalsCardProps {
  data: InvoiceData;
  onUpdateTaxRate: (rate: number) => void;
  onUpdateExchangeRate: (rate: number) => void;
}

/**
 * Card for tax rate, exchange rate, and calculated totals
 */
export default function TotalsCard({
  data,
  onUpdateTaxRate,
  onUpdateExchangeRate,
}: TotalsCardProps) {
  const { t } = useTranslation();

  return (
    <Card title={t("tax")}>
      <div className="space-y-4">
        {/* Rates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("ivaRate")}
            type="number"
            value={data.taxRate}
            onChange={(e) => onUpdateTaxRate(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label={t("exchangeRate")}
            type="number"
            step="0.0001"
            value={data.exchangeRate}
            onChange={(e) => onUpdateExchangeRate(parseFloat(e.target.value) || 0)}
            placeholder="0.85"
          />
        </div>

        {/* Calculated Totals (read-only display) */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("subtotal")}</span>
            <span className="font-medium text-gray-900">{formatEUR(data.subtotalEUR)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("ivaPercent", { rate: data.taxRate })}</span>
            <span className="font-medium text-gray-900">{formatEUR(data.taxAmountEUR)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">{t("total")}</span>
            <span className="font-bold text-cyan-600">{formatEUR(data.totalEUR)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
