"use client";

import { ListToolbar } from "@surgexrp/ui";
import { useState } from "react";

export function ClientToolbar() {
  const [sort, setSort] = useState<"highest-roi" | "newest">("highest-roi");
  return (
    <ListToolbar
      sortLabel="SORT BY:"
      options={[
        { label: "Highest ROI", value: "highest-roi" },
        { label: "Newest", value: "newest" },
      ]}
      value={sort}
      onChange={setSort}
    />
  );
}
