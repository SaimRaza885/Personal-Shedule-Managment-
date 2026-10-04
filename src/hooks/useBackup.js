import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildSnapshot,
  listRecentBackups,
  parseSnapshot,
  recordBackup,
  restoreSnapshot,
} from "@/services/backup.service";
import { openJsonFile, saveJsonFile } from "@/lib/fileTransfer";

export function useBackupHistory() {
  return useQuery({
    queryKey: ["backups"],
    queryFn: () => listRecentBackups(5),
  });
}

export function useExportBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const snapshot = await buildSnapshot();
      const result = await saveJsonFile({
        fileName: snapshot.fileName,
        content: snapshot.content,
      });
      if (!result.saved) return { saved: false };
      await recordBackup({ filePath: result.path, size: snapshot.byteSize });
      return { saved: true, fileName: result.path };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["backups"] }),
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const picked = await openJsonFile();
      if (!picked.picked) return { restored: false };
      const tables = parseSnapshot(picked.content);
      await restoreSnapshot(tables);
      return { restored: true };
    },
    // Restore replaces every table — drop all cached reads so each screen
    // refetches from the restored database.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
