import { useState } from "react";
import { format } from "date-fns";
import { Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { TransactionCard } from "@/components/finance/TransactionCard";
import { TransactionFormDialog } from "@/components/finance/TransactionFormDialog";
import { Button } from "@/components/ui/button";
import { TRANSACTION_TYPE } from "@/lib/constants";
import { formatAmount } from "@/lib/utils";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/useFinance";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function summarizeMonth(transactions, monthKey) {
  let income = 0;
  let expenses = 0;
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(monthKey)) continue;
    if (transaction.type === TRANSACTION_TYPE.INCOME) {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
  }
  return { income, expenses, net: income - expenses };
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-md bg-surface-secondary p-3">
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export function Finance() {
  const { data: transactions, isLoading, isError, refetch } = useTransactions();
  const [dialog, setDialog] = useState(null);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await createTransaction.mutateAsync(values);
        toast.success("Transaction added");
      } else {
        await updateTransaction.mutateAsync({
          id: dialog.item.id,
          ...values,
        });
        toast.success("Transaction updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (transaction) => {
    try {
      await deleteTransaction.mutateAsync({ id: transaction.id });
      toast.success("Transaction removed");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const monthKey = format(new Date(), "yyyy-MM");
  const month = summarizeMonth(transactions ?? [], monthKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Finance</h1>
          <p className="text-sm text-text-muted">
            Track income and expenses so the month's picture stays honest.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
          <Plus className="size-4" />
          New transaction
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your transactions…" />
      ) : isError ? (
        <ErrorState
          title="Couldn't load your transactions"
          description="Something went wrong on the way to the database."
          onRetry={() => refetch()}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Log income and expenses here to see where your money actually goes."
          action={
            <Button size="sm" onClick={() => setDialog({ kind: "add" })}>
              <Plus className="size-4" />
              New transaction
            </Button>
          }
        />
      ) : (
        <>
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-text-primary">
              This month — {format(new Date(), "MMMM yyyy")}
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <StatTile label="Income" value={formatAmount(month.income)} />
              <StatTile label="Spent" value={formatAmount(month.expenses)} />
              <StatTile label="Net" value={formatAmount(month.net)} />
            </div>
          </section>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text-primary">
              All transactions
            </h2>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={(entry) => setDialog({ kind: "edit", item: entry })}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {dialog && (
        <TransactionFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  type: dialog.item.type,
                  amount: String(dialog.item.amount),
                  date: dialog.item.date,
                  category: dialog.item.category,
                  description: dialog.item.description,
                }
          }
          onSubmit={handleSubmit}
          isPending={createTransaction.isPending || updateTransaction.isPending}
        />
      )}
    </div>
  );
}
