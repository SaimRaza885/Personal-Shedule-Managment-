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
import { statusLabel } from "@/components/today/taskStatus";
import {
  DEFAULT_VALUES,
  ENERGY_LEVEL,
  TASK_PRIORITY,
  TASK_STATUS,
} from "@/lib/constants";
import { energyLabel, priorityLabel } from "./taskMeta";

// Radix Select rejects empty-string values, so "none" marks "not linked".
const NO_VALUE = "none";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters"),
  projectId: z.string(),
  goalId: z.string(),
  priority: z.enum(Object.values(TASK_PRIORITY)),
  status: z.enum(Object.values(TASK_STATUS)),
  plannedMinutes: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter minutes as a number")
    .refine((value) => {
      const minutes = Number(value);
      return minutes >= 1 && minutes <= 1440;
    }, "Enter 1 to 1440 minutes"),
  energyLevel: z.string(),
});

const STATUS_OPTIONS = Object.values(TASK_STATUS).map((value) => ({
  value,
  label: statusLabel(value),
}));

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
 *   mode: { kind: "add" } | { kind: "edit", task: object },
 *   projects: { id: string, name: string }[],
 *   goals: { id: string, title: string }[],
 *   defaultProjectId?: string | null,
 *   onSubmit: (values: object) => Promise<void>, isPending?: boolean }} props
 */
export function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  projects,
  goals,
  defaultProjectId = null,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const task = isAdd ? null : mode.task;
  const modeTitle = task?.title ?? "";
  const modeDescription = task?.description ?? "";
  const modeProjectId = isAdd
    ? (defaultProjectId ?? NO_VALUE)
    : (task.projectId ?? NO_VALUE);
  const modeGoalId = task?.goalId ?? NO_VALUE;
  const modePriority = task?.priority ?? TASK_PRIORITY.MEDIUM;
  const modeStatus = task?.status ?? TASK_STATUS.NOT_STARTED;
  const modePlannedMinutes = String(
    task?.plannedMinutes ?? DEFAULT_VALUES.PLANNED_MINUTES,
  );
  const modeEnergyLevel = task?.energyLevel ?? NO_VALUE;

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: NO_VALUE,
      goalId: NO_VALUE,
      priority: TASK_PRIORITY.MEDIUM,
      status: TASK_STATUS.NOT_STARTED,
      plannedMinutes: String(DEFAULT_VALUES.PLANNED_MINUTES),
      energyLevel: NO_VALUE,
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        description: modeDescription,
        projectId: modeProjectId,
        goalId: modeGoalId,
        priority: modePriority,
        status: modeStatus,
        plannedMinutes: modePlannedMinutes,
        energyLevel: modeEnergyLevel,
      });
    }
  }, [
    open,
    modeTitle,
    modeDescription,
    modeProjectId,
    modeGoalId,
    modePriority,
    modeStatus,
    modePlannedMinutes,
    modeEnergyLevel,
    form,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "New task" : "Edit task"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Add a task, then break it into steps once it's on your list."
              : "Update this task's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                description: values.description,
                projectId:
                  values.projectId === NO_VALUE ? null : values.projectId,
                goalId: values.goalId === NO_VALUE ? null : values.goalId,
                priority: values.priority,
                status: values.status,
                plannedMinutes: Number(values.plannedMinutes),
                energyLevel:
                  values.energyLevel === NO_VALUE ? null : values.energyLevel,
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
                    <Input placeholder="e.g. Draft the project brief" {...field} />
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
                      placeholder="What does done look like?"
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_VALUE}>No project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
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
                name="goalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal (optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_VALUE}>No goal</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plannedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned minutes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        step={1}
                        placeholder="30"
                        {...field}
                      />
                    </FormControl>
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
                    ? "Create task"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
