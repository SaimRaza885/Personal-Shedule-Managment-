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
import { MILESTONE_PERIOD, MILESTONE_STATUS } from "@/lib/constants";
import {
  milestoneStatusLabel,
  periodLabel,
} from "./goalStatus";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Milestone title is required"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters"),
  periodType: z.enum(Object.values(MILESTONE_PERIOD)),
  targetDate: z
    .string()
    .trim()
    .refine((value) => value === "" || DATE_REGEX.test(value), {
      message: "Enter a valid date",
    }),
  status: z.enum(Object.values(MILESTONE_STATUS)),
});

const PERIOD_OPTIONS = Object.values(MILESTONE_PERIOD).map((value) => ({
  value,
  label: periodLabel(value),
}));

const STATUS_OPTIONS = Object.values(MILESTONE_STATUS).map((value) => ({
  value,
  label: milestoneStatusLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", title: string, description: string,
 *     periodType: string, targetDate: string | null, status: string },
 *   onSubmit: (values: { title: string, description: string,
 *     periodType: string, targetDate: string | null,
 *     status: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function MilestoneFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const modeTitle = isAdd ? "" : mode.title;
  const modeDescription = isAdd ? "" : (mode.description ?? "");
  const modePeriod = isAdd ? MILESTONE_PERIOD.MONTH : mode.periodType;
  const modeTargetDate = isAdd ? "" : (mode.targetDate ?? "");
  const modeStatus = isAdd ? MILESTONE_STATUS.PLANNED : mode.status;

  const form = useForm({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      periodType: MILESTONE_PERIOD.MONTH,
      targetDate: "",
      status: MILESTONE_STATUS.PLANNED,
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        description: modeDescription,
        periodType: modePeriod,
        targetDate: modeTargetDate,
        status: modeStatus,
      });
    }
  }, [
    open,
    modeTitle,
    modeDescription,
    modePeriod,
    modeTargetDate,
    modeStatus,
    form,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "Add milestone" : "Edit milestone"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Add a checkpoint to track progress on this goal."
              : mode.title}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                description: values.description,
                periodType: values.periodType,
                targetDate: values.targetDate === "" ? null : values.targetDate,
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
                    <Input placeholder="e.g. Finish chapter 3" {...field} />
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
                      rows={2}
                      placeholder="Anything worth noting about this checkpoint."
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
                name="periodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERIOD_OPTIONS.map((option) => (
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
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                    ? "Add milestone"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
