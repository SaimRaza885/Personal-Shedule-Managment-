import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NowCard } from "@/components/today/NowCard";
import { TopThreeCard } from "@/components/today/TopThreeCard";
import { TopThreePickerDialog } from "@/components/today/TopThreePickerDialog";
import { DailyProgressCard } from "@/components/today/DailyProgressCard";
import { ScheduleCard } from "@/components/today/ScheduleCard";
import { ScheduleBlockDialog } from "@/components/schedule/ScheduleBlockDialog";
import { Button } from "@/components/ui/button";
import { useTodayData } from "@/hooks/useToday";
import { useActiveFocusSession, useStartFocusSession } from "@/hooks/useFocus";
import {
  useAddScheduleBlock,
  useRemoveScheduleBlock,
  useUpdateScheduleBlock,
} from "@/hooks/useSchedule";
import {
  useAddTopThree,
  useMoveTopThree,
  useRemoveTopThree,
  useTopThreeCandidates,
} from "@/hooks/useTopThree";
import { DEFAULT_VALUES } from "@/lib/constants";
import { useEnergyStore } from "@/stores/energy.store";

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
    energy,
    lighterOptions,
    isLoading,
    isError,
    refetch,
  } = useTodayData();
  const navigate = useNavigate();
  const setEnergy = useEnergyStore((state) => state.setEnergy);
  const [dialog, setDialog] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeFocusQuery = useActiveFocusSession();
  const startFocus = useStartFocusSession();
  const addBlock = useAddScheduleBlock();
  const updateBlock = useUpdateScheduleBlock();
  const removeBlock = useRemoveScheduleBlock();
  const candidatesQuery = useTopThreeCandidates(date);
  const addTopThree = useAddTopThree();
  const removeTopThree = useRemoveTopThree();
  const moveTopThree = useMoveTopThree();

  const topThreeMaxed = topThree.length >= DEFAULT_VALUES.DAILY_TOP_THREE_MAX;
  const pickCandidates = candidatesQuery.data ?? [];

  const handleStart = async (task) => {
    if (activeFocusQuery.data) {
      navigate("/focus");
      return;
    }
    try {
      await startFocus.mutateAsync({ taskId: task.taskId });
      toast.success("Focus session started");
      navigate("/focus");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handlePickTopThree = async (candidate) => {
    try {
      await addTopThree.mutateAsync({ date, taskId: candidate.taskId });
      toast.success("Added to your Top 3");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleRemoveTopThree = async (entry) => {
    try {
      await removeTopThree.mutateAsync({ date, id: entry.id });
      toast.success("Removed from your Top 3");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const handleMoveTopThree = async (entry, direction) => {
    try {
      await moveTopThree.mutateAsync({ date, id: entry.id, direction });
    } catch (error) {
      toast.error(friendlyError(error));
    }
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
      <NowCard
        current={current}
        upcoming={upcoming}
        onStart={handleStart}
        energy={energy}
        onSelectEnergy={setEnergy}
        lighterOptions={lighterOptions}
        focusActive={Boolean(activeFocusQuery.data)}
        startPending={startFocus.isPending}
      />

      <div className="grid grid-cols-2 gap-6">
        <TopThreeCard
          items={topThree}
          onPick={() => setPickerOpen(true)}
          onRemove={handleRemoveTopThree}
          onMove={handleMoveTopThree}
        />
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

      <TopThreePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        candidates={pickCandidates}
        canAdd={!topThreeMaxed}
        isPending={addTopThree.isPending}
        onAdd={handlePickTopThree}
      />
    </div>
  );
}
