"use client";

import { InvoiceData } from "@/types/invoice";
import { Card, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface InvoiceInfoCardProps {
  data: InvoiceData;
  onUpdate: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
}

/**
 * Card for invoice metadata: title, number, dates
 */
export default function InvoiceInfoCard({ data, onUpdate }: InvoiceInfoCardProps) {
  const { t } = useTranslation();

  return (
    <Card title={t("invoiceInformation")}>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t("title")}
          value={data.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="FACTURA"
        />
        <Input
          label={t("invoiceNumber")}
          value={data.invoiceNumber}
          onChange={(e) => onUpdate("invoiceNumber", e.target.value)}
          placeholder="2025-01-A"
        />
        <Input
          label={t("issueDate")}
          type="date"
          value={data.issueDate}
          onChange={(e) => onUpdate("issueDate", e.target.value)}
        />
        <Input
          label={t("dueDate")}
          type="date"
          value={data.dueDate}
          onChange={(e) => onUpdate("dueDate", e.target.value)}
        />
      </div>
    </Card>
  );
}
