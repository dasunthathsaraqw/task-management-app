import React, { useEffect, useRef, useCallback } from "react";
import type { Task } from "../../types/task";
import { ReadOnlyKanbanCard } from "./ReadOnlyKanbanCard";

interface ReadOnlyKanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  totalTasks: number;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onTaskClick?: (task: Task) => void;
}

export const ReadOnlyKanbanColumn: React.FC<ReadOnlyKanbanColumnProps> = ({
  id,
  title,
  tasks,
  totalTasks,
  loading,
  hasMore,
  onLoadMore,
  onTaskClick,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver]);

  const getHeaderColor = (status: string) => {
    switch (status) {
      case "Open":
        return "border-blue-500 bg-blue-50";
      case "In Progress":
        return "border-amber-500 bg-amber-50";
      case "Testing":
        return "border-purple-500 bg-purple-50";
      case "Done":
        return "border-emerald-500 bg-emerald-50";
      default:
        return "border-slate-500 bg-slate-50";
    }
  };

  return (
    <div className="flex flex-col bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 min-w-[280px] sm:w-[320px] max-w-full h-full max-h-full">
      <div className={`p-3 border-t-4 ${getHeaderColor(id)} border-b border-b-slate-200 flex justify-between items-center flex-shrink-0`}>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-medium px-2 py-1 rounded-full shadow-sm" title={`Total: ${totalTasks}`}>
          {tasks.length} / {totalTasks}
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-0 relative scrollbar-thin scrollbar-thumb-slate-300">
        {tasks.map((task) => (
          <ReadOnlyKanbanCard key={task._id} task={task} onClick={onTaskClick} />
        ))}
        
        {tasks.length === 0 && !loading && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm italic py-8 min-h-[150px]">
            No tasks found
          </div>
        )}

        <div ref={observerTarget} className="h-4 w-full flex justify-center mt-2">
          {loading && (
            <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          )}
        </div>
      </div>
    </div>
  );
};
