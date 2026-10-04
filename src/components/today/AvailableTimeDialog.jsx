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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const MIN_HOURS = 0.25;
const MAX_HOURS = 24;

const schema = z.object({
  hours: z
    .string()
    .trim()
    .min(1, "Available time is required")
    .refine((value) => {
      const hours = Number(value);
      return (
        Number.isFinite(hours) && hours >= MIN_HOURS && hours <= MAX_HOURS
      );
    }, `Enter between ${MIN_HOURS} and ${MAX_HOURS} hours`),
});

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   currentMinutes: number,
 *   onSubmit: (values: { minutes: number }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function AvailableTimeDialog({
  open,
  onOpenChange,
  currentMinutes,
  onSubmit,
  isPending = false,
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { hours: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ hours: String(currentMinutes / 60) });
    }
  }, [open, currentMinutes, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Available time</DialogTitle>
          <DialogDescription>
            How much time do you actually have for planned work today? Used
            only for the overload warning.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({ minutes: Math.round(Number(values.hours) * 60) });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours available</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={MIN_HOURS}
                      max={MAX_HOURS}
                      step={0.25}
                      placeholder="e.g. 5"
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
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
