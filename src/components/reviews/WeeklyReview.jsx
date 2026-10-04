import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useSaveWeeklyReview, useWeeklyReview } from "@/hooks/useReviews";
import { DATE_FORMATS } from "@/lib/constants";
import { formatDate, formatTimestamp } from "@/lib/datetime";

const MAX_FIELD_LENGTH = 2000;

const weeklySchema = z.object({
  accomplishments: z
    .string()
    .trim()
    .max(MAX_FIELD_LENGTH, "Keep this field under 2000 characters"),
  whatWentWell: z
    .string()
    .trim()
    .max(MAX_FIELD_LENGTH, "Keep this field under 2000 characters"),
  whatDidNotGoWell: z
    .string()
    .trim()
    .max(MAX_FIELD_LENGTH, "Keep this field under 2000 characters"),
  changesForNextWeek: z
    .string()
    .trim()
    .max(MAX_FIELD_LENGTH, "Keep this field under 2000 characters"),
  priorities: z
    .string()
    .trim()
    .max(MAX_FIELD_LENGTH, "Keep this field under 2000 characters"),
});

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function WeeklyReview() {
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    DATE_FORMATS.ISO,
  );
  const weekEnd = format(
    endOfWeek(new Date(), { weekStartsOn: 1 }),
    DATE_FORMATS.ISO,
  );

  const reviewQuery = useWeeklyReview(weekStart);
  const saveReview = useSaveWeeklyReview();

  const form = useForm({
    resolver: zodResolver(weeklySchema),
    defaultValues: {
      accomplishments: "",
      whatWentWell: "",
      whatDidNotGoWell: "",
      changesForNextWeek: "",
      priorities: "",
    },
  });

  const stored = reviewQuery.data;
  const storedAccomplishments = stored?.accomplishments ?? "";
  const storedWhatWentWell = stored?.whatWentWell ?? "";
  const storedWhatDidNotGoWell = stored?.whatDidNotGoWell ?? "";
  const storedChangesForNextWeek = stored?.changesForNextWeek ?? "";
  const storedPriorities = stored?.priorities ?? "";

  // Deps are primitives, so unrelated re-renders cannot wipe what the user
  // is currently typing.
  useEffect(() => {
    form.reset({
      accomplishments: storedAccomplishments,
      whatWentWell: storedWhatWentWell,
      whatDidNotGoWell: storedWhatDidNotGoWell,
      changesForNextWeek: storedChangesForNextWeek,
      priorities: storedPriorities,
    });
  }, [
    storedAccomplishments,
    storedWhatWentWell,
    storedWhatDidNotGoWell,
    storedChangesForNextWeek,
    storedPriorities,
    form,
  ]);

  const handleSubmit = async (values) => {
    try {
      await saveReview.mutateAsync({ weekStart, weekEnd, ...values });
      toast.success(
        reviewQuery.data ? "Weekly review updated" : "Weekly review saved",
      );
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  if (reviewQuery.isLoading) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Loading your weekly review…</p>
      </section>
    );
  }

  if (reviewQuery.isError) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-primary">
          Couldn&rsquo;t load your weekly review.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => reviewQuery.refetch()}
        >
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Weekly Review
          </h2>
          <p className="text-sm text-text-muted">
            {formatDate(weekStart)} &ndash; {formatDate(weekEnd)} &mdash; zoom
            out on the week, then steer the next one.
          </p>
        </div>
        {stored && (
          <span className="whitespace-nowrap text-xs text-text-muted">
            Last saved {formatTimestamp(stored.updatedAt)}
          </span>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="accomplishments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accomplishments</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="What actually got done this week?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatWentWell"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What went well</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Wins, moments that clicked, things to keep doing…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatDidNotGoWell"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What didn&rsquo;t go well</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Problems, friction, things that slipped…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="changesForNextWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Changes for next week</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="What will you do differently?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priorities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorities for next week</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="The few things that matter most next week…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={saveReview.isPending}>
              {saveReview.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {saveReview.isPending ? "Saving…" : "Save weekly review"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
