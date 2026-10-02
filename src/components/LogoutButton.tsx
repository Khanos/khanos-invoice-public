"use client";

import { signOut } from "next-auth/react";
import { clearInvoiceDrafts } from "@/lib/invoiceDrafts";
import { useTranslation } from "@/hooks/useTranslation";

interface LogoutButtonProps {
  className?: string;
}

/**
 * Logout button component
 * Triggers NextAuth signOut and redirects to login page
 */
export default function LogoutButton({ className }: LogoutButtonProps) {
  const { t } = useTranslation();

  const handleLogout = () => {
    clearInvoiceDrafts();
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "text-sm text-gray-500 hover:text-gray-700 underline"
      }
    >
      {t("signOut")}
    </button>
  );
}
