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
import { GOAL_STATUS } from "@/lib/constants";
import { goalStatusLabel } from "./goalStatus";

const YEAR_REGEX = /^\d{4}$/;

const goalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters"),
  year: z
    .string()
    .trim()
    .refine((value) => value === "" || YEAR_REGEX.test(value), {
      message: "Enter a 4-digit year",
    }),
  status: z.enum(Object.values(GOAL_STATUS)),
});

const STATUS_OPTIONS = Object.values(GOAL_STATUS).map((value) => ({
  value,
  label: goalStatusLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", title: string, description: string,
 *     year: number | null, status: string },
 *   onSubmit: (values: { title: string, description: string,
 *     year: number | null, status: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function GoalFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const modeTitle = isAdd ? "" : mode.title;
  const modeDescription = isAdd ? "" : (mode.description ?? "");
  const modeYear = isAdd ? "" : mode.year == null ? "" : String(mode.year);
  const modeStatus = isAdd ? GOAL_STATUS.PLANNED : mode.status;

  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      year: "",
      status: GOAL_STATUS.PLANNED,
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        description: modeDescription,
        year: modeYear,
        status: modeStatus,
      });
    }
  }, [open, modeTitle, modeDescription, modeYear, modeStatus, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "New goal" : "Edit goal"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Set a goal you want to work toward."
              : "Update this goal's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                description: values.description,
                year: values.year === "" ? null : Number(values.year),
                status: values.status,
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
                    <Input placeholder="e.g. Run a half marathon" {...field} />
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
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="What does success look like?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        placeholder="2026"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
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
            </div>
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
                {isPending ? "Saving…" : isAdd ? "Create goal" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
