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

const learningSchema = z.object({
  title: z.string().trim().min(1, "Learning note title is required"),
  date: z
    .string()
    .trim()
    .min(1, "Pick a date for this learning note")
    .refine((value) => DATE_REGEX.test(value), {
      message: "Enter a valid date",
    }),
  content: z
    .string()
    .trim()
    .max(2000, "Keep the note under 2000 characters"),
});

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", title: string,
 *     date: string, content: string },
 *   onSubmit: (values: { title: string, date: string,
 *     content: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function LearningFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const today = format(new Date(), DATE_FORMATS.ISO);
  const modeTitle = isAdd ? "" : mode.title;
  const modeDate = isAdd ? today : mode.date;
  const modeContent = isAdd ? "" : (mode.content ?? "");

  const form = useForm({
    resolver: zodResolver(learningSchema),
    defaultValues: {
      title: "",
      date: today,
      content: "",
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        date: modeDate,
        content: modeContent,
      });
    }
  }, [open, modeTitle, modeDate, modeContent, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "New learning note" : "Edit learning note"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Write down what you figured out — no quizzes, no pressure."
              : "Update this note's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                date: values.date,
                content: values.content,
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Why SQLite defers foreign keys"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learned on</FormLabel>
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
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="What did you learn? What clicked?"
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
                    ? "Add note"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
