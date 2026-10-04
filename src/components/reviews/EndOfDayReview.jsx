import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import {
  useDailyReview,
  useDailyReviewStats,
  useSaveDailyReview,
} from "@/hooks/useReviews";
import { DATE_FORMATS } from "@/lib/constants";
import { formatDate, formatMinutes, formatTimestamp } from "@/lib/datetime";

const reviewSchema = z.object({
  reviewNotes: z
    .string()
    .trim()
    .max(2000, "Keep your reflection under 2000 characters"),
});

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-md bg-surface-secondary p-3">
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export function EndOfDayReview() {
  const date = format(new Date(), DATE_FORMATS.ISO);
  const statsQuery = useDailyReviewStats(date);
  const reviewQuery = useDailyReview(date);
  const saveReview = useSaveDailyReview();

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviewNotes: "" },
  });

  const storedNotes = reviewQuery.data?.reviewNotes ?? "";

  // Dep is a primitive, so unrelated re-renders cannot wipe what the user
  // is currently typing.
  useEffect(() => {
    form.reset({ reviewNotes: storedNotes });
  }, [storedNotes, form]);

  const handleSubmit = async (values) => {
    const stats = statsQuery.data;
    if (!stats) return;
    try {
      await saveReview.mutateAsync({
        date,
        ...stats,
        reviewNotes: values.reviewNotes,
      });
      toast.success(reviewQuery.data ? "Review updated" : "Review saved");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  if (statsQuery.isLoading || reviewQuery.isLoading) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">
          Gathering today&rsquo;s numbers&hellip;
        </p>
      </section>
    );
  }

  if (statsQuery.isError || reviewQuery.isError) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-primary">
          Couldn&rsquo;t load today&rsquo;s review numbers.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            statsQuery.refetch();
            reviewQuery.refetch();
          }}
        >
          Try again
        </Button>
      </section>
    );
  }

  const stats = statsQuery.data;

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            End of Day Review
          </h2>
          <p className="text-sm text-text-muted">
            {formatDate(date)} &mdash; compare the plan with what actually
            happened.
          </p>
        </div>
        {reviewQuery.data && (
          <span className="whitespace-nowrap text-xs text-text-muted">
            Last saved {formatTimestamp(reviewQuery.data.updatedAt)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Planned" value={stats.plannedTasks} />
        <StatTile label="Completed" value={stats.completedTasks} />
        <StatTile label="Partial" value={stats.partialTasks} />
        <StatTile label="Missed" value={stats.missedTasks} />
      </div>

      <p className="mt-3 text-sm text-text-secondary">
        Focus time today:{" "}
        <span className="font-medium text-text-primary">
          {formatMinutes(stats.focusMinutes)}
        </span>
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-5 space-y-4"
        >
          <FormField
            control={form.control}
            name="reviewNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did today go?</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="What moved forward? What got in the way? Anything to carry into tomorrow…"
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
              {saveReview.isPending ? "Saving…" : "Save review"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-light pt-4">
        <span className="text-sm text-text-muted">Continue your evening:</span>
        <Button asChild variant="outline" size="sm">
          <Link to="/diary">Write in Diary</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/learning">Log what I learned</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Plan tomorrow</Link>
        </Button>
      </div>
    </section>
  );
}
