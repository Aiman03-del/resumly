import type { ReactNode } from "react";
import { SortableSection } from "@/components/sortable-section";
import type { SectionKey } from "@/lib/section-order";

export function renderSections<K extends SectionKey>(
  order: readonly K[],
  sections: Record<K, ReactNode>
) {
  return order.map((key) => (
    <SortableSection key={key} id={key} siblings={order}>
      {sections[key]}
    </SortableSection>
  ));
}
