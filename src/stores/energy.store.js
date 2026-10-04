import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Low-Energy Mode selection — client/UI state only. The selection changes
 * which already-planned tasks are surfaced; it never deletes, reschedules,
 * or modifies the plan itself.
 * @typedef {{ energy: "high"|"medium"|"low"|null, setEnergy: (energy: string|null) => void }} EnergyStore
 */
export const useEnergyStore = create(
  persist(
    (set) => ({
      energy: null,
      setEnergy: (energy) => set({ energy }),
    }),
    {
      name: "psm-energy-mode",
      partialize: (state) => ({ energy: state.energy }),
    },
  ),
);
