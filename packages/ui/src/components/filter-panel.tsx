"use client";

import type { ReactElement } from "react";
import { ModalShell } from "../layouts/modal-shell";
import { Button } from "./button";
import { TextField } from "./text-field";

export interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  priceMin: string;
  priceMax: string;
  yieldMin: string;
  yieldMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onYieldMinChange: (v: string) => void;
  onYieldMaxChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FilterPanel({
  open,
  onClose,
  priceMin,
  priceMax,
  yieldMin,
  yieldMax,
  onPriceMinChange,
  onPriceMaxChange,
  onYieldMinChange,
  onYieldMaxChange,
  onApply,
  onReset,
}: FilterPanelProps): ReactElement {
  return (
    <ModalShell open={open} onClose={onClose} title="Filters" variant="drawer">
      <div>
        <p className="mb-2 text-sm font-medium text-text-muted">Unit Price Range</p>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            placeholder="Min"
            prefix="$"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
          />
          <TextField
            placeholder="Max"
            prefix="$"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
          />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-text-muted">Average Yield Range</p>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            placeholder="Min"
            suffix="%"
            value={yieldMin}
            onChange={(e) => onYieldMinChange(e.target.value)}
          />
          <TextField
            placeholder="Max"
            suffix="%"
            value={yieldMax}
            onChange={(e) => onYieldMaxChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onReset}>
          Reset
        </Button>
        <Button variant="primary" fullWidth onClick={onApply}>
          Apply
        </Button>
      </div>
    </ModalShell>
  );
}
