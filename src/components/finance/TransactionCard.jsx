import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRANSACTION_TYPE } from "@/lib/constants";
import { formatDate, formatTimestamp } from "@/lib/datetime";
import { cn, formatAmount } from "@/lib/utils";
import { transactionAmountClass } from "./transactionType";

/**
 * @param {{ transaction: object, onEdit: (transaction: object) => void,
 *   onRemove: (transaction: object) => void }} props
 */
export function TransactionCard({ transaction, onEdit, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const isIncome = transaction.type === TRANSACTION_TYPE.INCOME;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
            {formatDate(transaction.date)}
          </span>
          {transaction.category && (
            <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-secondary">
              {transaction.category}
            </span>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 text-sm font-semibold",
            transactionAmountClass(transaction.type),
          )}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(transaction.amount)}
        </span>
      </div>

      {transaction.description && (
        <p className="break-words text-sm text-text-secondary">
          {transaction.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-text-muted">
          Added {formatTimestamp(transaction.createdAt)}
        </span>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">
              Remove this transaction?
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => {
                setConfirming(false);
                onRemove(transaction);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Edit transaction from ${formatDate(transaction.date)}`}
              onClick={() => onEdit(transaction)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remove transaction from ${formatDate(transaction.date)}`}
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
