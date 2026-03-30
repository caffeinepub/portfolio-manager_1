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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  LogIn,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Category,
  useAddHolding,
  useHoldings,
  useRemoveHolding,
  useUpdateHolding,
} from "../hooks/useQueries";
import type { Holding } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  [Category.stock]: "#2F6FDE",
  [Category.crypto]: "#8B5CF6",
  [Category.etf]: "#2DBE7E",
  [Category.cash]: "#F59E0B",
};
const CATEGORY_LABELS: Record<string, string> = {
  [Category.stock]: "Stocks",
  [Category.crypto]: "Crypto",
  [Category.etf]: "ETFs",
  [Category.cash]: "Cash",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

type HoldingForm = {
  name: string;
  ticker: string;
  category: Category;
  quantity: string;
  avgCost: string;
  currentPrice: string;
};

const defaultForm: HoldingForm = {
  name: "",
  ticker: "",
  category: Category.stock,
  quantity: "",
  avgCost: "",
  currentPrice: "",
};

const PAGE_SIZE = 10;

export default function Investments() {
  const { data: holdings = [], isLoading } = useHoldings();
  const { isLoginSuccess, login } = useInternetIdentity();
  const addHolding = useAddHolding();
  const updateHolding = useUpdateHolding();
  const removeHolding = useRemoveHolding();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Holding | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Holding | null>(null);
  const [form, setForm] = useState<HoldingForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<HoldingForm>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return holdings.filter(
      (h) =>
        h.name.toLowerCase().includes(q) || h.ticker.toLowerCase().includes(q),
    );
  }, [holdings, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalValue = useMemo(
    () => holdings.reduce((s, h) => s + h.currentPrice * h.quantity, 0),
    [holdings],
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (h: Holding) => {
    setEditTarget(h);
    setForm({
      name: h.name,
      ticker: h.ticker,
      category: h.category,
      quantity: String(h.quantity),
      avgCost: String(h.avgCost),
      currentPrice: String(h.currentPrice),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Partial<HoldingForm> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.ticker.trim()) e.ticker = "Required";
    if (!form.quantity || Number.isNaN(+form.quantity) || +form.quantity <= 0)
      e.quantity = "Must be > 0";
    if (!form.avgCost || Number.isNaN(+form.avgCost) || +form.avgCost < 0)
      e.avgCost = "Must be >= 0";
    if (
      !form.currentPrice ||
      Number.isNaN(+form.currentPrice) ||
      +form.currentPrice < 0
    )
      e.currentPrice = "Must be >= 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editTarget) {
        await updateHolding.mutateAsync({
          id: editTarget.id,
          name: form.name,
          ticker: form.ticker.toUpperCase(),
          category: form.category,
          quantity: +form.quantity,
          avgCost: +form.avgCost,
          currentPrice: +form.currentPrice,
        });
        toast.success("Holding updated");
      } else {
        await addHolding.mutateAsync({
          name: form.name,
          ticker: form.ticker.toUpperCase(),
          category: form.category,
          quantity: +form.quantity,
          avgCost: +form.avgCost,
          currentPrice: +form.currentPrice,
        });
        toast.success("Holding added");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeHolding.mutateAsync(deleteTarget.id);
      toast.success("Holding removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to remove holding");
    }
  };

  const isPending = addHolding.isPending || updateHolding.isPending;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4" data-ocid="investments.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isLoginSuccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center" data-ocid="investments.login.panel">
          <LogIn className="mx-auto text-muted-foreground mb-3" size={40} />
          <h2 className="text-lg font-semibold mb-1">
            Sign in to manage investments
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be logged in to view and manage your portfolio.
          </p>
          <Button
            onClick={() => login()}
            style={{ background: "oklch(0.52 0.19 255)" }}
            data-ocid="investments.login.button"
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
          <h1 className="text-xl font-bold text-foreground">Investments</h1>
          <p className="text-sm text-muted-foreground">
            {holdings.length} holdings · {fmt(totalValue)} total
          </p>
        </div>
        <Button
          onClick={openAdd}
          style={{ background: "oklch(0.52 0.19 255)" }}
          data-ocid="investments.add.button"
        >
          <Plus size={16} className="mr-1" /> Add Holding
        </Button>
      </motion.div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
              />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 h-8 text-sm"
                data-ocid="investments.search_input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {paged.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              data-ocid="investments.holdings.empty_state"
            >
              <TrendingUp className="text-muted-foreground mb-2" size={32} />
              <p className="text-sm font-medium">
                {search ? "No results found" : "No holdings yet"}
              </p>
              {!search && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click &quot;Add Holding&quot; to get started
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Asset",
                      "Ticker",
                      "Category",
                      "Qty",
                      "Avg Cost",
                      "Current Price",
                      "Total Value",
                      "Gain/Loss",
                      "Alloc %",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((h, i) => {
                    const value = h.currentPrice * h.quantity;
                    const cost = h.avgCost * h.quantity;
                    const gain = value - cost;
                    const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
                    const allocPct =
                      totalValue > 0 ? (value / totalValue) * 100 : 0;
                    const pos = gain >= 0;
                    return (
                      <tr
                        key={String(h.id)}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        data-ocid={`investments.holdings.item.${i + 1}`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{
                                background:
                                  CATEGORY_COLORS[h.category as string] ??
                                  "#94A3B8",
                              }}
                            >
                              {h.ticker.slice(0, 2)}
                            </span>
                            <span className="font-medium truncate max-w-[140px]">
                              {h.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {h.ticker}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {CATEGORY_LABELS[h.category as string] ??
                              h.category}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right">{h.quantity}</td>
                        <td className="px-3 py-2.5 text-right">
                          {fmt(h.avgCost)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {fmt(h.currentPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">
                          {fmt(value)}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-medium whitespace-nowrap ${pos ? "text-success" : "text-destructive"}`}
                        >
                          <div className="flex items-center justify-end gap-0.5">
                            {pos ? (
                              <TrendingUp size={12} />
                            ) : (
                              <TrendingDown size={12} />
                            )}
                            {pos ? "+" : ""}
                            {fmt(gain)}
                          </div>
                          <div className="text-xs">
                            {pos ? "+" : ""}
                            {gainPct.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {allocPct.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(h)}
                              data-ocid={`investments.edit.button.${i + 1}`}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(h)}
                              data-ocid={`investments.delete_button.${i + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  data-ocid="investments.pagination_prev"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  data-ocid="investments.pagination_next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="investments.holding.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Holding" : "Add Holding"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inv-name">Asset Name</Label>
                <Input
                  id="inv-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Apple Inc."
                  data-ocid="investments.name.input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="investments.name.error_state"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-ticker">Ticker</Label>
                <Input
                  id="inv-ticker"
                  value={form.ticker}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ticker: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="AAPL"
                  data-ocid="investments.ticker.input"
                />
                {errors.ticker && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="investments.ticker.error_state"
                  >
                    {errors.ticker}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as Category }))
                }
              >
                <SelectTrigger data-ocid="investments.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.stock}>Stock</SelectItem>
                  <SelectItem value={Category.crypto}>Crypto</SelectItem>
                  <SelectItem value={Category.etf}>ETF</SelectItem>
                  <SelectItem value={Category.cash}>Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inv-qty">Quantity</Label>
                <Input
                  id="inv-qty"
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="10"
                  data-ocid="investments.quantity.input"
                />
                {errors.quantity && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="investments.quantity.error_state"
                  >
                    {errors.quantity}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-cost">Avg Cost</Label>
                <Input
                  id="inv-cost"
                  type="number"
                  value={form.avgCost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, avgCost: e.target.value }))
                  }
                  placeholder="150.00"
                  data-ocid="investments.avgcost.input"
                />
                {errors.avgCost && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="investments.avgcost.error_state"
                  >
                    {errors.avgCost}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-price">Current Price</Label>
                <Input
                  id="inv-price"
                  type="number"
                  value={form.currentPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentPrice: e.target.value }))
                  }
                  placeholder="175.00"
                  data-ocid="investments.price.input"
                />
                {errors.currentPrice && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="investments.price.error_state"
                  >
                    {errors.currentPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="investments.holding.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              style={{ background: "oklch(0.52 0.19 255)" }}
              data-ocid="investments.holding.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {editTarget ? "Save Changes" : "Add Holding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="investments.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Holding?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.name}</strong> (
              {deleteTarget?.ticker}) from your portfolio? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="investments.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="investments.delete.confirm_button"
            >
              {removeHolding.isPending ? (
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
