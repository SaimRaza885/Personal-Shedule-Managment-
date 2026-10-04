import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const captureSchema = z.object({
  content: z.string().trim().min(1, "Type something to capture"),
});

/**
 * Fast capture box — one field, no structure. Submits on button or
 * Ctrl/Cmd + Enter, clears itself on success and keeps focus so the
 * user can capture several thoughts in a row.
 * @param {{ onSubmit: (content: string) => Promise<boolean>,
 *   isPending?: boolean }} props
 */
export function CaptureForm({ onSubmit, isPending = false }) {
  const form = useForm({
    resolver: zodResolver(captureSchema),
    defaultValues: { content: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    const saved = await onSubmit(values.content);
    if (saved) {
      form.reset({ content: "" });
      form.setFocus("content");
    }
  });

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Form {...form}>
        <form onSubmit={submit}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={2}
                    aria-label="Capture a thought"
                    placeholder="What's on your mind? Get it out of your head — organize it later."
                    {...field}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                      ) {
                        event.preventDefault();
                        submit();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted">Ctrl + Enter to capture</p>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Inbox className="size-4" />
              )}
              {isPending ? "Capturing…" : "Capture"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
