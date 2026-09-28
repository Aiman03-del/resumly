"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { GripVertical } from "lucide-react";
import type { SectionKey } from "@/lib/section-order";

interface SectionDndValue {
  dragKey: SectionKey | null;
  overKey: SectionKey | null;
  startDrag: (key: SectionKey, groupKeys: readonly SectionKey[]) => void;
  canDropOn: (key: SectionKey) => boolean;
  setOver: (key: SectionKey | null) => void;
  drop: (targetKey: SectionKey) => void;
  endDrag: () => void;
}

const SectionDndContext = createContext<SectionDndValue | null>(null);

export function SectionDndProvider({
  order,
  onChange,
  children,
}: {
  order: SectionKey[];
  onChange: (order: SectionKey[]) => void;
  children: ReactNode;
}) {
  const dragRef = useRef<{ key: SectionKey; groupKeys: readonly SectionKey[] } | null>(null);
  const [dragKey, setDragKey] = useState<SectionKey | null>(null);
  const [overKey, setOverKey] = useState<SectionKey | null>(null);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragKey(null);
    setOverKey(null);
  }, []);

  const startDrag = useCallback((key: SectionKey, groupKeys: readonly SectionKey[]) => {
    dragRef.current = { key, groupKeys };
    setTimeout(() => {
      if (dragRef.current?.key === key) setDragKey(key);
    }, 0);
  }, []);

  const canDropOn = useCallback((key: SectionKey) => {
    const drag = dragRef.current;
    return Boolean(drag && drag.groupKeys.includes(key));
  }, []);

  const drop = useCallback(
    (targetKey: SectionKey) => {
      const drag = dragRef.current;
      if (drag && drag.key !== targetKey && drag.groupKeys.includes(targetKey)) {
        const next = order.filter((key) => key !== drag.key);
        const targetIndex = next.indexOf(targetKey);
        const movingDown = order.indexOf(drag.key) < order.indexOf(targetKey);
        next.splice(movingDown ? targetIndex + 1 : targetIndex, 0, drag.key);
        onChange(next);
      }
      endDrag();
    },
    [order, onChange, endDrag]
  );

  const value = useMemo<SectionDndValue>(
    () => ({ dragKey, overKey, startDrag, canDropOn, setOver: setOverKey, drop, endDrag }),
    [dragKey, overKey, startDrag, canDropOn, drop, endDrag]
  );

  return <SectionDndContext.Provider value={value}>{children}</SectionDndContext.Provider>;
}

export function SortableSection({
  id,
  siblings,
  children,
}: {
  id: SectionKey;
  siblings: readonly SectionKey[];
  children: ReactNode;
}) {
  const dnd = useContext(SectionDndContext);
  if (!dnd || !children) return <>{children}</>;

  const isDragging = dnd.dragKey === id;
  const isOver = dnd.overKey === id && dnd.dragKey !== id;

  return (
    <div
      draggable
      data-section={id}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", id);
        dnd.startDrag(id, siblings);
      }}
      onDragOver={(event) => {
        if (!dnd.canDropOn(id)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        dnd.setOver(id);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && dnd.overKey === id) {
          dnd.setOver(null);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        dnd.drop(id);
      }}
      onDragEnd={dnd.endDrag}
      className={`group/sortable relative cursor-grab active:cursor-grabbing rounded-sm outline-offset-4 transition-opacity ${
        isDragging ? "opacity-40" : ""
      } ${
        isOver
          ? "outline outline-2 outline-indigo-500 bg-indigo-500/10"
          : "hover:outline hover:outline-2 hover:outline-dashed hover:outline-indigo-400"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1 right-1 z-10 hidden group-hover/sortable:flex items-center rounded bg-white text-neutral-600 shadow ring-1 ring-neutral-200 p-0.5"
      >
        <GripVertical size={14} />
      </span>
      {children}
    </div>
  );
}
