import { EndOfDayReview } from "@/components/reviews/EndOfDayReview";
import { WeeklyReview } from "@/components/reviews/WeeklyReview";

export function Reviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Reviews</h1>
        <p className="text-sm text-text-muted">
          Close the loop — compare the plan with what actually happened, then
          steer tomorrow.
        </p>
      </div>

      <EndOfDayReview />
      <WeeklyReview />
    </div>
  );
}
