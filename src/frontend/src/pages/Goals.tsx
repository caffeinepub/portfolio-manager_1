import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddGoal,
  useGoals,
  useRemoveGoal,
  useUpdateGoal,
} from "../hooks/useQueries";
import type { Goal } from "../hooks/useQueries";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);

type GoalForm = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
};
const defaultForm: GoalForm = {
  name: "",
  targetAmount: "",
  currentAmount: "0",
  deadline: "",
};

export default function Goals() {
  const { data: goals = [], isLoading } = useGoals();
  const { isLoginSuccess, login } = useInternetIdentity();
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  const removeGoal = useRemoveGoal();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<GoalForm>>({});

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (g: Goal) => {
    setEditTarget(g);
    setForm({
      name: g.name,
      targetAmount: String(g.targetAmount),
      currentAmount: String(g.currentAmount),
      deadline: g.deadline,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Partial<GoalForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (
      !form.targetAmount ||
      Number.isNaN(+form.targetAmount) ||
      +form.targetAmount <= 0
    )
      e.targetAmount = "Must be > 0";
    if (form.currentAmount !== "" && Number.isNaN(+form.currentAmount))
      e.currentAmount = "Must be a number";
    if (!form.deadline) e.deadline = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await updateGoal.mutateAsync({
          id: editTarget.id,
          name: form.name,
          targetAmount: +form.targetAmount,
          currentAmount: +form.currentAmount,
          deadline: form.deadline,
        });
        toast.success("Goal updated");
      } else {
        await addGoal.mutateAsync({
          name: form.name,
          targetAmount: +form.targetAmount,
          currentAmount: +form.currentAmount || 0,
          deadline: form.deadline,
        });
        toast.success("Goal created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeGoal.mutateAsync(deleteTarget.id);
      toast.success("Goal removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove goal");
    }
  };

  const isPending = addGoal.isPending || updateGoal.isPending;

  if (isLoading) {
    return (
      <div
        className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        data-ocid="goals.loading_state"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!isLoginSuccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center" data-ocid="goals.login.panel">
          <LogIn className="mx-auto text-muted-foreground mb-3" size={40} />
          <h2 className="text-lg font-semibold mb-1">
            Sign in to manage goals
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Track your financial goals after signing in.
          </p>
          <Button
            onClick={() => login()}
            style={{ background: "oklch(0.52 0.19 255)" }}
            data-ocid="goals.login.button"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">
            {goals.length} financial goal{goals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openAdd}
          style={{ background: "oklch(0.52 0.19 255)" }}
          data-ocid="goals.add.button"
        >
          <Plus size={16} className="mr-1" /> Add Goal
        </Button>
      </motion.div>

      {goals.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-ocid="goals.list.empty_state"
        >
          <Target className="text-muted-foreground mb-3" size={40} />
          <p className="text-sm font-medium">No goals yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Set a financial goal to start tracking your progress
          </p>
          <Button
            onClick={openAdd}
            style={{ background: "oklch(0.52 0.19 255)" }}
            data-ocid="goals.add_first.button"
          >
            <Plus size={15} className="mr-1" /> Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((g, i) => {
              const pct =
                g.targetAmount > 0
                  ? Math.min(100, (g.currentAmount / g.targetAmount) * 100)
                  : 0;
              const done = pct >= 100;
              const remaining = g.targetAmount - g.currentAmount;
              const daysLeft = Math.max(
                0,
                Math.ceil(
                  (new Date(g.deadline).getTime() - Date.now()) / 86400000,
                ),
              );
              return (
                <motion.div
                  key={String(g.id)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  data-ocid={`goals.item.${i + 1}`}
                >
                  <Card className="shadow-card border-border h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-success/10" : "bg-primary/10"}`}
                          >
                            {done ? (
                              <CheckCircle2
                                size={16}
                                className="text-success"
                              />
                            ) : (
                              <Target
                                size={16}
                                style={{ color: "oklch(0.52 0.19 255)" }}
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {g.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock size={10} />{" "}
                              {daysLeft > 0
                                ? `${daysLeft}d left`
                                : "Deadline passed"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(g)}
                            data-ocid={`goals.edit.button.${i + 1}`}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(g)}
                            data-ocid={`goals.delete_button.${i + 1}`}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span
                            className={`font-semibold ${done ? "text-success" : "text-foreground"}`}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground font-medium">
                            {fmt(g.currentAmount)}
                          </span>
                          <span className="text-muted-foreground">
                            of {fmt(g.targetAmount)}
                          </span>
                        </div>
                        {!done && (
                          <p className="text-xs text-muted-foreground">
                            {fmt(remaining)} remaining
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="goals.goal.dialog">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Goal" : "Add Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Emergency Fund"
                data-ocid="goals.name.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="goals.name.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal-target">Target Amount</Label>
                <Input
                  id="goal-target"
                  type="number"
                  value={form.targetAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetAmount: e.target.value }))
                  }
                  placeholder="10000"
                  data-ocid="goals.target.input"
                />
                {errors.targetAmount && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="goals.target.error_state"
                  >
                    {errors.targetAmount}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-current">Current Amount</Label>
                <Input
                  id="goal-current"
                  type="number"
                  value={form.currentAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentAmount: e.target.value }))
                  }
                  placeholder="0"
                  data-ocid="goals.current.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
                data-ocid="goals.deadline.input"
              />
              {errors.deadline && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="goals.deadline.error_state"
                >
                  {errors.deadline}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="goals.goal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              style={{ background: "oklch(0.52 0.19 255)" }}
              data-ocid="goals.goal.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {editTarget ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="goals.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.name}</strong>? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="goals.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="goals.delete.confirm_button"
            >
              {removeGoal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
