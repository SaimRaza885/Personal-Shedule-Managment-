import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DATE_FORMATS, TRANSACTION_TYPE } from "@/lib/constants";
import { transactionTypeLabel } from "./transactionType";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const transactionSchema = z.object({
  type: z.enum(Object.values(TRANSACTION_TYPE)),
  amount: z
    .string()
    .trim()
    .min(1, "Enter an amount")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: "Enter an amount greater than zero",
    }),
  date: z.string().trim().regex(DATE_REGEX, "Pick a date for this transaction"),
  category: z.string().trim().max(60, "Keep the category under 60 characters"),
  description: z.string().trim().max(300, "Keep the note under 300 characters"),
});

const TYPE_OPTIONS = Object.values(TRANSACTION_TYPE).map((value) => ({
  value,
  label: transactionTypeLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", type: string, amount: string,
 *     date: string, category: string, description: string },
 *   onSubmit: (values: { type: string, amount: number, date: string,
 *     category: string, description: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function TransactionFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const today = format(new Date(), DATE_FORMATS.ISO);
  const modeType = isAdd ? TRANSACTION_TYPE.EXPENSE : mode.type;
  const modeAmount = isAdd ? "" : mode.amount;
  const modeDate = isAdd ? today : mode.date;
  const modeCategory = isAdd ? "" : mode.category;
  const modeDescription = isAdd ? "" : mode.description;

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: TRANSACTION_TYPE.EXPENSE,
      amount: "",
      date: today,
      category: "",
      description: "",
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        type: modeType,
        amount: modeAmount,
        date: modeDate,
        category: modeCategory,
        description: modeDescription,
      });
    }
  }, [
    open,
    modeType,
    modeAmount,
    modeDate,
    modeCategory,
    modeDescription,
    form,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "New transaction" : "Edit transaction"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Log income or an expense — keep the month's picture honest."
              : "Update this transaction's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                type: values.type,
                amount: Number(values.amount),
                date: values.date,
                category: values.category,
                description: values.description,
              });
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Weekly grocery run"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending
                  ? "Saving…"
                  : isAdd
                    ? "Add transaction"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
