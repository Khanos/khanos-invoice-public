"use client";

import { ClientInfo } from "@/types/invoice";
import { Card, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface ClientCardProps {
  client: ClientInfo;
  onUpdate: (field: keyof ClientInfo, value: string) => void;
}

/**
 * Card for client/recipient information
 */
export default function ClientCard({ client, onUpdate }: ClientCardProps) {
  const { t } = useTranslation();

  return (
    <Card title={t("clientInformation")}>
      <div className="space-y-4">
        <Input
          label={t("companyName")}
          value={client.companyName}
          onChange={(e) => onUpdate("companyName", e.target.value)}
          placeholder="Company Name, LLC"
        />
        <Input
          label={t("address")}
          value={client.address}
          onChange={(e) => onUpdate("address", e.target.value)}
          placeholder="Street, City, Postal Code"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("country")}
            value={client.country}
            onChange={(e) => onUpdate("country", e.target.value)}
            placeholder="Country"
          />
          <Input
            label={t("phone")}
            type="tel"
            value={client.phone}
            onChange={(e) => onUpdate("phone", e.target.value)}
            placeholder="+1 000 000 0000"
          />
        </div>
        <Input
          label={t("email")}
          type="email"
          value={client.email}
          onChange={(e) => onUpdate("email", e.target.value)}
          placeholder="email@company.com"
        />
      </div>
    </Card>
  );
}
