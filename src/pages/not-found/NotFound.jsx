import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That page doesn't exist or was moved. Head back to Today to keep going."
        action={
          <Button asChild>
            <Link to="/">Back to Today</Link>
          </Button>
        }
      />
    </div>
  );
}
