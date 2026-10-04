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
import { PROJECT_STATUS } from "@/lib/constants";
import { projectStatusLabel } from "./projectStatus";

// Radix Select rejects empty-string values, so "none" marks "no linked goal".
const NO_GOAL = "none";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters"),
  goalId: z.string(),
  status: z.enum(Object.values(PROJECT_STATUS)),
});

const STATUS_OPTIONS = Object.values(PROJECT_STATUS).map((value) => ({
  value,
  label: projectStatusLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", name: string, description: string,
 *     goalId: string | null, status: string },
 *   goals: { id: string, title: string }[],
 *   onSubmit: (values: { name: string, description: string,
 *     goalId: string | null, status: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  goals,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const modeName = isAdd ? "" : mode.name;
  const modeDescription = isAdd ? "" : (mode.description ?? "");
  const modeGoalId = isAdd ? NO_GOAL : (mode.goalId ?? NO_GOAL);
  const modeStatus = isAdd ? PROJECT_STATUS.ACTIVE : mode.status;

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      goalId: NO_GOAL,
      status: PROJECT_STATUS.ACTIVE,
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        name: modeName,
        description: modeDescription,
        goalId: modeGoalId,
        status: modeStatus,
      });
    }
  }, [open, modeName, modeDescription, modeGoalId, modeStatus, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "New project" : "Edit project"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Create a project to group the tasks that move a goal forward."
              : "Update this project's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                name: values.name,
                description: values.description,
                goalId: values.goalId === NO_GOAL ? null : values.goalId,
                status: values.status,
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Personal website rebuild"
                      {...field}
                    />
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
                      placeholder="What is this project about?"
                      {...field}
                    />
                  </FormControl>
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
                      <SelectItem value={NO_GOAL}>No goal</SelectItem>
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
                    ? "Create project"
                    : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
