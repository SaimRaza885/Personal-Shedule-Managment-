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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DATE_FORMATS } from "@/lib/constants";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const diarySchema = z.object({
  date: z
    .string()
    .trim()
    .min(1, "Pick a date for this entry")
    .refine((value) => DATE_REGEX.test(value), {
      message: "Enter a valid date",
    }),
  content: z
    .string()
    .trim()
    .min(1, "Write something before saving")
    .max(5000, "Keep the entry under 5000 characters"),
});

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", date: string, content: string },
 *   onSubmit: (values: { date: string, content: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function DiaryFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const today = format(new Date(), DATE_FORMATS.ISO);
  const modeDate = isAdd ? today : mode.date;
  const modeContent = isAdd ? "" : (mode.content ?? "");

  const form = useForm({
    resolver: zodResolver(diarySchema),
    defaultValues: {
      date: today,
      content: "",
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        date: modeDate,
        content: modeContent,
      });
    }
  }, [open, modeDate, modeContent, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "New diary entry" : "Edit entry"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Free-form and completely private — no format, no prompts."
              : "Update this entry."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                date: values.date,
                content: values.content,
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="How was today? Write freely…"
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
                    ? "Save entry"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
