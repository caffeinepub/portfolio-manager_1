import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Goal, Holding } from "../backend";
import { Category } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export { Category };
export type { Holding, Goal };

export function useHoldings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Holding[]>({
    queryKey: ["holdings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerHoldings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGoals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Goal[]>({
    queryKey: ["goals", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.seedSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useAddHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      name: string;
      ticker: string;
      category: Category;
      quantity: number;
      avgCost: number;
      currentPrice: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addHolding(
        h.name,
        h.ticker,
        h.category,
        h.quantity,
        h.avgCost,
        h.currentPrice,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useUpdateHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      id: bigint;
      name: string;
      ticker: string;
      category: Category;
      quantity: number;
      avgCost: number;
      currentPrice: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateHolding(
        h.id,
        h.name,
        h.ticker,
        h.category,
        h.quantity,
        h.avgCost,
        h.currentPrice,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useRemoveHolding() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeHolding(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useAddGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: {
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addGoal(g.name, g.targetAmount, g.currentAmount, g.deadline);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: {
      id: bigint;
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateGoal(
        g.id,
        g.name,
        g.targetAmount,
        g.currentAmount,
        g.deadline,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useRemoveGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeGoal(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}
