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
import { priorityLabel, energyLabel } from "@/components/tasks/taskMeta";
import { ENERGY_LEVEL, TASK_PRIORITY } from "@/lib/constants";

// Radix Select rejects empty-string values, so "none" marks "not set".
const NO_VALUE = "none";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeFields = {
  startTime: z.string().regex(TIME_REGEX, "Enter a valid start time"),
  endTime: z.string().regex(TIME_REGEX, "Enter a valid end time"),
};

const afterStart = (schema) =>
  schema.refine((values) => values.endTime > values.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const addSchema = afterStart(
  z.object({
    title: z.string().trim().min(1, "Task title is required"),
    priority: z.enum(Object.values(TASK_PRIORITY)),
    energyLevel: z.string(),
    ...timeFields,
  }),
);

const editSchema = afterStart(z.object({ ...timeFields }));

const PRIORITY_OPTIONS = Object.values(TASK_PRIORITY).map((value) => ({
  value,
  label: priorityLabel(value),
}));

const ENERGY_OPTIONS = Object.values(ENERGY_LEVEL).map((value) => ({
  value,
  label: energyLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", title: string, startTime: string, endTime: string },
 *   onSubmit: (values: object) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function ScheduleBlockDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const modeTitle = isAdd ? "" : mode.title;
  const modeStart = isAdd ? "" : mode.startTime;
  const modeEnd = isAdd ? "" : mode.endTime;
  const form = useForm({
    resolver: zodResolver(isAdd ? addSchema : editSchema),
    defaultValues: {
      title: "",
      priority: TASK_PRIORITY.MEDIUM,
      energyLevel: NO_VALUE,
      startTime: "",
      endTime: "",
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        priority: TASK_PRIORITY.MEDIUM,
        energyLevel: NO_VALUE,
        startTime: modeStart,
        endTime: modeEnd,
      });
    }
  }, [open, modeTitle, modeStart, modeEnd, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {isAdd ? "Add task to schedule" : "Edit schedule block"}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Create a task and place it in a fixed time block today."
              : mode.title}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                priority: values.priority,
                energyLevel:
                  values.energyLevel === NO_VALUE ? null : values.energyLevel,
                startTime: values.startTime,
                endTime: values.endTime,
              });
            })}
            className="space-y-4"
          >
            {isAdd && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Review project proposal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isAdd && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
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
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy (optional)</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NO_VALUE}>No preference</SelectItem>
                          {ENERGY_OPTIONS.map((option) => (
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
            )}
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
                {isPending ? "Saving…" : isAdd ? "Add to schedule" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
