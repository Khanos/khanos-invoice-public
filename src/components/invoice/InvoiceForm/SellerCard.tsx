"use client";

import { SellerInfo } from "@/types/invoice";
import { Card, Input } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface SellerCardProps {
  seller: SellerInfo;
  onUpdate: (field: keyof SellerInfo, value: string) => void;
}

/**
 * Card for seller/issuer information
 */
export default function SellerCard({ seller, onUpdate }: SellerCardProps) {
  const { t } = useTranslation();

  return (
    <Card title={t("sellerInformation")}>
      <div className="space-y-4">
        <Input
          label={t("name")}
          value={seller.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Full name"
        />
        <Input
          label={t("address")}
          value={seller.address}
          onChange={(e) => onUpdate("address", e.target.value)}
          placeholder="Street, City, Postal Code"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("taxId")}
            value={seller.taxId}
            onChange={(e) => onUpdate("taxId", e.target.value)}
            placeholder="NIF/NIE"
          />
          <Input
            label={t("phone")}
            type="tel"
            value={seller.phone}
            onChange={(e) => onUpdate("phone", e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <Input
          label={t("email")}
          type="email"
          value={seller.email}
          onChange={(e) => onUpdate("email", e.target.value)}
          placeholder="email@example.com"
        />
        <Input
          label={t("website")}
          type="url"
          value={seller.website || ""}
          onChange={(e) => onUpdate("website", e.target.value)}
          placeholder="www.example.com"
        />
      </div>
    </Card>
  );
}
