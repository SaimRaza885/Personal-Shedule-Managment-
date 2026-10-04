import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useNotificationSettings,
  useSetNotificationSettings,
} from "@/hooks/useSettings";
import {
  ensureNotificationPermission,
  sendDesktopNotification,
} from "@/lib/notifications";

const notificationSchema = z.object({
  enabled: z.boolean(),
  leadMinutes: z
    .string()
    .trim()
    .regex(/^\d+$/, "Enter minutes as a number")
    .refine((value) => {
      const minutes = Number(value);
      return minutes >= 0 && minutes <= 60;
    }, "Enter 0 to 60 minutes"),
  eveningReviewTime: z
    .string()
    .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid time, or leave empty"),
});

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Settings() {
  const settingsQuery = useNotificationSettings();
  const setSettings = useSetNotificationSettings();
  const settings = settingsQuery.data;

  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      enabled: true,
      leadMinutes: "10",
      eveningReviewTime: "21:00",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        enabled: settings.enabled,
        leadMinutes: String(settings.leadMinutes),
        eveningReviewTime: settings.eveningReviewTime,
      });
    }
  }, [settings, form]);

  const handleSave = form.handleSubmit(async (values) => {
    try {
      await setSettings.mutateAsync({
        enabled: values.enabled,
        leadMinutes: Number(values.leadMinutes),
        eveningReviewTime: values.eveningReviewTime,
      });
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  });

  const handleTest = async () => {
    try {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        toast.error(
          "Notifications are turned off for this app. Allow them in your system settings first.",
        );
        return;
      }
      const sent = await sendDesktopNotification({
        title: "Focus plan",
        body: "This is a test notification — reminders will look like this.",
      });
      if (sent) {
        toast.success("Test notification sent");
      } else {
        toast.error(
          "Could not send a notification. Check your Windows notification settings.",
        );
      }
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted">
          How the app behaves on this machine. Everything stays local.
        </p>
      </div>

      {settingsQuery.isLoading ? (
        <LoadingState message="Loading your settings…" />
      ) : settingsQuery.isError ? (
        <ErrorState
          title="Couldn't load your settings"
          description="Something went wrong on the way to the database."
          onRetry={() => settingsQuery.refetch()}
        />
      ) : (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text-primary">
            Desktop notifications
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            A reminder shortly before each scheduled block, and one nudge for
            the evening review.
          </p>

          <Form {...form}>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md bg-surface-secondary p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Desktop reminders</FormLabel>
                      <p className="text-xs text-text-muted">
                        Show a Windows notification when a scheduled block is
                        about to start.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remind me before a block</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          step={1}
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-text-muted">
                        Minutes before the start time. 0 = right at start.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eveningReviewTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evening review reminder</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <p className="text-xs text-text-muted">
                        Leave empty to turn this reminder off.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button type="button" variant="outline" onClick={handleTest}>
                  Send test notification
                </Button>
                <Button type="submit" disabled={setSettings.isPending}>
                  {setSettings.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {setSettings.isPending ? "Saving…" : "Save settings"}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      )}
    </div>
  );
}
