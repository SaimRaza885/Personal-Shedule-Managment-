import { TRANSACTION_TYPE } from "@/lib/constants";

const LABELS = {
  [TRANSACTION_TYPE.INCOME]: "Income",
  [TRANSACTION_TYPE.EXPENSE]: "Expense",
};

const AMOUNT_CLASSES = {
  [TRANSACTION_TYPE.INCOME]: "text-success-foreground",
  [TRANSACTION_TYPE.EXPENSE]: "text-error-foreground",
};

export function transactionTypeLabel(type) {
  return LABELS[type] ?? type;
}

export function transactionAmountClass(type) {
  return AMOUNT_CLASSES[type] ?? AMOUNT_CLASSES[TRANSACTION_TYPE.EXPENSE];
}
