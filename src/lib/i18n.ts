/**
 * Lightweight i18n system for the Invoice Generator
 * Supports English (en) and Spanish (es)
 */

export type Locale = "en" | "es";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_STORAGE_KEY = "lang";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
};

/**
 * Translation dictionary with all UI text
 * Organized by feature/section for maintainability
 */
export const translations = {
  en: {
    // General
    loading: "Loading...",
    redirecting: "Redirecting...",

    // Navigation / Header
    invoiceGenerator: "Invoice Generator",
    signOut: "Sign out",
    resetToDefaults: "Reset to defaults",
    resetConfirmation: "Are you sure you want to reset all data to defaults?",
    editDefaults: "Edit defaults",
    editDefaultsDescription: "These values will be used for every new invoice.",
    saveDefaults: "Save defaults",
    savingDefaults: "Saving...",
    defaultsLoadFailed: "Could not load your defaults. Please try again.",
    defaultsSaveFailed: "Could not save your defaults. Please try again.",
    cancel: "Cancel",
    close: "Close",

    // Login Page
    signInToAccess: "Sign in with Google to create and manage your invoices",
    signInWithGoogle: "Sign in with Google",
    accountPrivacyNotice: "Anyone with a verified Google account can sign in. Your invoices are private to your account.",
    accessDenied: "This account cannot sign in. Please use a verified, active Google account.",
    signInError: "An error occurred during sign in. Please try again.",

    // Invoice Form - Section Headers
    invoiceDetails: "Invoice Details",
    invoiceInformation: "Invoice Information",
    sellerInformation: "Seller Information",
    clientInformation: "Client Information",
    lineItems: "Line Items",
    tax: "Tax",
    notes: "Notes",

    // Invoice Form - Labels
    title: "Title",
    invoiceNumber: "Invoice Number",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    name: "Name",
    address: "Address",
    taxId: "Tax ID (NIE)",
    email: "Email",
    phone: "Phone",
    website: "Website",
    companyName: "Company Name",
    country: "Country",
    description: "Description",
    amountUSD: "Amount (USD)",
    amountEUR: "Amount (EUR)",
    ivaRate: "IVA Rate (%)",
    exchangeRate: "Exchange Rate (USD → EUR)",

    // Invoice Form - Buttons
    addItem: "+ Add Item",
    addNote: "+ Add Note",
    remove: "Remove",
    item: "Item",

    // Invoice Preview - Headers
    invoice: "INVOICE",
    invoiceNumberLabel: "Invoice number:",
    invoiceDateLabel: "Invoice date:",
    dueDateLabel: "Due date:",
    nie: "NIE:",
    countryLabel: "Country:",

    // Invoice Preview - Table Headers
    descriptionHeader: "Description",
    amountUSDHeader: "Amount (USD)",
    amountEURHeader: "Amount (EUR)",

    // Invoice Preview - Summary
    subtotal: "SUBTOTAL",
    ivaPercent: "IVA ({rate}%)",
    total: "TOTAL",
    note: "Note",

    // Print Button
    downloadPrintPdf: "Download",

    // Preview Section
    preview: "Preview",
    previewDescription: "This is how your invoice will look when exported",

    // Invoice Management
    saveInvoice: "Save Invoice",
    saving: "Saving...",
    saved: "Saved",
    saveFailed: "Save failed",
    selectInvoice: "Select Invoice",
    newInvoice: "New Invoice",
    unsavedInvoice: "New Invoice · Unsaved",
    noSavedInvoices: "No saved invoices",
    loadingInvoices: "Loading invoices...",
    deleteInvoice: "Delete Invoice",
    deleteConfirmation: "Are you sure you want to delete this invoice?",

    // Misc
    engineer: "Eng.",
    exchangeRateNote: "Amount originally received in USD. Conversion to EUR made at exchange rate of {rate} as per the official rate of the European Central Bank (ECB) on the date of issue.",
  },
  es: {
    // General
    loading: "Cargando...",
    redirecting: "Redirigiendo...",

    // Navigation / Header
    invoiceGenerator: "Generador de Facturas",
    signOut: "Cerrar sesión",
    resetToDefaults: "Restablecer valores",
    resetConfirmation: "¿Estás seguro de que quieres restablecer todos los datos a los valores predeterminados?",
    editDefaults: "Editar valores predeterminados",
    editDefaultsDescription: "Estos valores se usarán en cada factura nueva.",
    saveDefaults: "Guardar valores",
    savingDefaults: "Guardando...",
    defaultsLoadFailed: "No se pudieron cargar tus valores. Inténtalo de nuevo.",
    defaultsSaveFailed: "No se pudieron guardar tus valores. Inténtalo de nuevo.",
    cancel: "Cancelar",
    close: "Cerrar",

    // Login Page
    signInToAccess: "Inicia sesión con Google para crear y gestionar tus facturas",
    signInWithGoogle: "Iniciar sesión con Google",
    accountPrivacyNotice: "Cualquier persona con una cuenta de Google verificada puede iniciar sesión. Tus facturas son privadas para tu cuenta.",
    accessDenied: "No se puede iniciar sesión con esta cuenta. Usa una cuenta de Google verificada y activa.",
    signInError: "Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.",

    // Invoice Form - Section Headers
    invoiceDetails: "Detalles de la Factura",
    invoiceInformation: "Información de la Factura",
    sellerInformation: "Información del Emisor",
    clientInformation: "Información del Cliente",
    lineItems: "Líneas de Factura",
    tax: "Impuesto",
    notes: "Notas",

    // Invoice Form - Labels
    title: "Título",
    invoiceNumber: "Número de Factura",
    issueDate: "Fecha de Emisión",
    dueDate: "Fecha de Vencimiento",
    name: "Nombre",
    address: "Dirección",
    taxId: "NIF/NIE",
    email: "Correo electrónico",
    phone: "Teléfono",
    website: "Sitio web",
    companyName: "Nombre de la Empresa",
    country: "País",
    description: "Descripción",
    amountUSD: "Importe (USD)",
    amountEUR: "Importe (EUR)",
    ivaRate: "Tipo de IVA (%)",
    exchangeRate: "Tipo de cambio (USD → EUR)",

    // Invoice Form - Buttons
    addItem: "+ Añadir línea",
    addNote: "+ Añadir nota",
    remove: "Eliminar",
    item: "Línea",

    // Invoice Preview - Headers
    invoice: "FACTURA",
    invoiceNumberLabel: "Número de factura:",
    invoiceDateLabel: "Fecha de factura:",
    dueDateLabel: "Fecha de vencimiento:",
    nie: "NIE:",
    countryLabel: "País:",

    // Invoice Preview - Table Headers
    descriptionHeader: "Descripción",
    amountUSDHeader: "Importe (USD)",
    amountEURHeader: "Importe (EUR)",

    // Invoice Preview - Summary
    subtotal: "SUBTOTAL",
    ivaPercent: "IVA ({rate}%)",
    total: "TOTAL",
    note: "Nota",

    // Print Button
    downloadPrintPdf: "Descargar",

    // Preview Section
    preview: "Vista Previa",
    previewDescription: "Así es como se verá tu factura cuando la exportes",

    // Invoice Management
    saveInvoice: "Guardar Factura",
    saving: "Guardando...",
    saved: "Guardado",
    saveFailed: "Error al guardar",
    selectInvoice: "Seleccionar Factura",
    newInvoice: "Nueva Factura",
    unsavedInvoice: "Nueva Factura · Sin guardar",
    noSavedInvoices: "Sin facturas guardadas",
    loadingInvoices: "Cargando facturas...",
    deleteInvoice: "Eliminar Factura",
    deleteConfirmation: "¿Estás seguro de que quieres eliminar esta factura?",

    // Misc
    engineer: "Ing.",
    exchangeRateNote: "Importe originalmente percibido en USD. Conversión a EUR realizada al tipo de cambio de {rate} según el tipo de cambio oficial del Banco Central Europeo (BCE) a la fecha de emisión.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Get a translation for a given locale and key
 * Supports interpolation with {placeholder} syntax
 */
export function getTranslation(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const value: string = translations[locale][key] || translations.en[key] || key;

  if (!params) return value;

  return Object.entries(params).reduce<string>(
    (str, [param, val]) => str.replace(`{${param}}`, String(val)),
    value
  );
}
