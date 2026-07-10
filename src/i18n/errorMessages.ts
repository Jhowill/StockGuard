type TranslateFn = (key: string, params?: Record<string, string | number | null | undefined>) => string;

const errorKeyMap: Record<string, string> = {
  ALERTS_LOAD_FAILED: 'errors.alertsLoadFailed',
  ADS_ACCESS_LOAD_FAILED: 'errors.adsAccessLoadFailed',
  ADS_NOT_CONFIGURED: 'errors.adsNotConfigured',
  BACKUP_LOAD_FAILED: 'errors.backupLoadFailed',
  BACKUP_FOLDER_UNAVAILABLE: 'errors.backupFolderUnavailable',
  INVALID_BACKUP_FILE: 'errors.invalidBackupFile',
  INCOMPATIBLE_BACKUP_SCHEMA: 'errors.incompatibleBackupSchema',
  INVALID_BACKUP_SCHEMA: 'errors.invalidBackupSchema',
  INVALID_BACKUP_CATEGORY: 'errors.invalidBackupCategory',
  INVALID_BACKUP_SUPPLIER: 'errors.invalidBackupSupplier',
  INVALID_BACKUP_PRODUCT: 'errors.invalidBackupProduct',
  INVALID_BACKUP_MOVEMENT: 'errors.invalidBackupMovement',
  BACKUP_PASSWORD_TOO_SHORT: 'errors.backupPasswordTooShort',
  BACKUP_PASSWORD_REQUIRED: 'errors.backupPasswordRequired',
  BACKUP_PASSWORD_INVALID: 'errors.backupPasswordInvalid',
  SHARING_UNAVAILABLE: 'errors.sharingUnavailable',
  BACKUP_FILE_NOT_FOUND: 'errors.backupFileNotFound',
  DASHBOARD_LOAD_FAILED: 'errors.dashboardLoadFailed',
  CATEGORIES_LOAD_FAILED: 'errors.categoriesLoadFailed',
  SUPPLIERS_LOAD_FAILED: 'errors.suppliersLoadFailed',
  PRODUCTS_LOAD_FAILED: 'errors.productsLoadFailed',
  REPORTS_LOAD_FAILED: 'errors.reportsLoadFailed',
  SETTINGS_LOAD_FAILED: 'errors.settingsLoadFailed',
  FEATURE_GATE_LOAD_FAILED: 'errors.featureGateLoadFailed',
  PRODUCT_DETAIL_FAILED: 'errors.productDetailLoadFailed',
  PRODUCT_LOAD_FAILED: 'errors.productLoadFailed',
  PRODUCT_UPDATE_FAILED: 'errors.productSaveFailed',
  EXPORT_FOLDER_UNAVAILABLE: 'errors.exportFolderUnavailable',
  EXPORT_FILE_NOT_FOUND: 'errors.exportFileNotFound',
  REPORT_SUMMARY_INVALID: 'errors.reportSummaryInvalid',
  INVALID_QUANTITY: 'errors.invalidQuantity',
  INSUFFICIENT_STOCK: 'errors.insufficientStock',
  INVALID_SUPPLIER_EMAIL: 'errors.invalidSupplierEmail',
  PRODUCT_NAME_REQUIRED: 'errors.productNameRequired',
  INVALID_PRODUCT_QUANTITY: 'errors.invalidProductQuantity',
  INVALID_PRODUCT_MIN_QUANTITY: 'errors.invalidProductMinQuantity',
  INVALID_PRODUCT_COST_PRICE: 'errors.invalidProductCostPrice',
  INVALID_PRODUCT_SALE_PRICE: 'errors.invalidProductSalePrice',
  INVALID_UNIT_COST: 'errors.invalidUnitCost',
  INVALID_UNIT_SALE_PRICE: 'errors.invalidUnitSalePrice',
  CATEGORY_NAME_REQUIRED: 'errors.categoryNameRequired',
  SUPPLIER_NAME_REQUIRED: 'errors.supplierNameRequired',
  CATEGORY_ALREADY_EXISTS: 'errors.categoryAlreadyExists',
  SUPPLIER_ALREADY_EXISTS: 'errors.supplierAlreadyExists',
  CATEGORY_HAS_PRODUCTS: 'errors.categoryHasProducts',
  SUPPLIER_HAS_PRODUCTS: 'errors.supplierHasProducts',
  PRODUCT_NOT_FOUND: 'productDetail.notFound',
  PRODUCT_ID_MISSING: 'productDetail.missing',
  PRODUCT_BARCODE_ALREADY_EXISTS: 'productNew.barcodeExists',
  PRODUCT_SKU_ALREADY_EXISTS: 'productNew.skuExists',
  CATEGORY_NOT_FOUND: 'productNew.categoryMissing',
  SUPPLIER_NOT_FOUND: 'productNew.supplierMissing',
};

export function translateAppError(error: unknown, t: TranslateFn) {
  if (error == null) {
    return '';
  }

  const code = error instanceof Error ? error.message : String(error);
  const key = errorKeyMap[code];
  if (key) {
    return t(key);
  }

  return t('errors.genericBody');
}
