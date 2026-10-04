import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const REASON_PRESETS = [
  "Phone",
  "People",
  "Notifications",
  "Noise",
  "Mind wandering",
];

const distractionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Pick or describe what pulled you away")
    .max(80, "Keep the reason short"),
  notes: z.string().trim().max(300, "Notes can be up to 300 characters"),
});

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   onSubmit: (values: { reason: string, notes: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function DistractionDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}) {
  const form = useForm({
    resolver: zodResolver(distractionSchema),
    defaultValues: { reason: "", notes: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ reason: "", notes: "" });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Log a distraction</DialogTitle>
          <DialogDescription>
            Note what pulled you away &mdash; for awareness, not judgment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What pulled you away?</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {REASON_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          form.setValue("reason", preset, {
                            shouldValidate: true,
                          })
                        }
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <FormControl>
                    <Input placeholder="e.g. Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Anything worth remembering about it"
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
                {isPending ? "Saving…" : "Log distraction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
