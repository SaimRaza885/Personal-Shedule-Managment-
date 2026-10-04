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
import { WATCH_STATUS } from "@/lib/constants";
import { watchStatusLabel } from "./watchStatus";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const watchItemSchema = z.object({
  title: z.string().trim().min(1, "Item title is required"),
  url: z
    .string()
    .trim()
    .refine((value) => value === "" || URL.canParse(value), {
      message: "Enter a valid link (e.g. https://…)",
    }),
  scheduledDate: z
    .string()
    .trim()
    .refine((value) => value === "" || DATE_REGEX.test(value), {
      message: "Enter a valid date",
    }),
  status: z.enum(Object.values(WATCH_STATUS)),
});

const STATUS_OPTIONS = Object.values(WATCH_STATUS).map((value) => ({
  value,
  label: watchStatusLabel(value),
}));

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void,
 *   mode: { kind: "add" } | { kind: "edit", title: string, url: string,
 *     scheduledDate: string|null, status: string },
 *   onSubmit: (values: { title: string, url: string,
 *     scheduledDate: string|null, status: string }) => Promise<void>,
 *   isPending?: boolean }} props
 */
export function WatchLaterFormDialog({
  open,
  onOpenChange,
  mode,
  onSubmit,
  isPending = false,
}) {
  const isAdd = mode.kind === "add";
  const modeTitle = isAdd ? "" : mode.title;
  const modeUrl = isAdd ? "" : (mode.url ?? "");
  const modeScheduledDate = isAdd ? "" : (mode.scheduledDate ?? "");
  const modeStatus = isAdd ? WATCH_STATUS.PENDING : mode.status;

  const form = useForm({
    resolver: zodResolver(watchItemSchema),
    defaultValues: {
      title: "",
      url: "",
      scheduledDate: "",
      status: WATCH_STATUS.PENDING,
    },
  });

  // Primitive deps: parent re-renders recreate the mode object, which must
  // not wipe values the user is currently typing.
  useEffect(() => {
    if (open) {
      form.reset({
        title: modeTitle,
        url: modeUrl,
        scheduledDate: modeScheduledDate,
        status: modeStatus,
      });
    }
  }, [open, modeTitle, modeUrl, modeScheduledDate, modeStatus, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "New link" : "Edit link"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Save something worth watching — schedule it for later if you like."
              : "Update this link's details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title,
                url: values.url,
                scheduledDate: values.scheduledDate || null,
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
                    <Input
                      placeholder="e.g. Rust ownership explained visually"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule for (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                {isPending ? "Saving…" : isAdd ? "Add link" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
