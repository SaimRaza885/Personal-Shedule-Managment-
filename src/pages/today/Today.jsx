import { useState } from "react";
import { toast } from "sonner";
import { NowCard } from "@/components/today/NowCard";
import { TopThreeCard } from "@/components/today/TopThreeCard";
import { DailyProgressCard } from "@/components/today/DailyProgressCard";
import { ScheduleCard } from "@/components/today/ScheduleCard";
import { ScheduleBlockDialog } from "@/components/schedule/ScheduleBlockDialog";
import { Button } from "@/components/ui/button";
import { useTodayData } from "@/hooks/useToday";
import {
  useAddScheduleBlock,
  useRemoveScheduleBlock,
  useUpdateScheduleBlock,
} from "@/hooks/useSchedule";

function friendlyError(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function Today() {
  const {
    date,
    schedule,
    topThree,
    current,
    upcoming,
    progress,
    isLoading,
    isError,
    refetch,
  } = useTodayData();
  const [dialog, setDialog] = useState(null);
  const addBlock = useAddScheduleBlock();
  const updateBlock = useUpdateScheduleBlock();
  const removeBlock = useRemoveScheduleBlock();

  const handleStart = (task) => {
    console.log("[Today] start task", task?.id);
  };

  const handleDialogSubmit = async (values) => {
    try {
      if (dialog.kind === "add") {
        await addBlock.mutateAsync({
          date,
          title: values.title,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        toast.success("Task added to your schedule");
      } else {
        await updateBlock.mutateAsync({
          id: dialog.block.id,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        toast.success("Schedule updated");
      }
      setDialog(null);
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemove = async (block) => {
    try {
      await removeBlock.mutateAsync({ id: block.id });
      toast.success("Task removed from schedule");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-muted">Loading today&rsquo;s schedule&hellip;</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-sm text-text-primary">
          Couldn&rsquo;t load today&rsquo;s schedule.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NowCard current={current} upcoming={upcoming} onStart={handleStart} />

      <div className="grid grid-cols-2 gap-6">
        <TopThreeCard items={topThree} />
        <DailyProgressCard
          completed={progress.completed}
          total={progress.total}
          minutesDone={progress.minutesDone}
          minutesPlanned={progress.minutesPlanned}
        />
      </div>

      <ScheduleCard
        items={schedule}
        onAdd={() => setDialog({ kind: "add" })}
        onEdit={(block) => setDialog({ kind: "edit", block })}
        onRemove={handleRemove}
      />

      {dialog && (
        <ScheduleBlockDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          mode={
            dialog.kind === "add"
              ? { kind: "add" }
              : {
                  kind: "edit",
                  title: dialog.block.title,
                  startTime: dialog.block.startTime,
                  endTime: dialog.block.endTime,
                }
          }
          onSubmit={handleDialogSubmit}
          isPending={addBlock.isPending || updateBlock.isPending}
        />
      )}
    </div>
  );
}
