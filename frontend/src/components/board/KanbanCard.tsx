import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types/task";

interface KanbanCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: "Task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if due within 24 hours
  const now = new Date();
  const due = new Date(task.dueDate);
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isDueSoon = hoursLeft <= 24 && hoursLeft >= 0;
  const isOverdue = hoursLeft < 0;

  // Priority-based card background
  const getPriorityCardStyle = () => {
    switch (task.priority) {
      case "High":
        return "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600 border-l-4 border-l-rose-500";
      case "Medium":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 border-l-4 border-l-amber-500";
      case "Low":
        return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 border-l-4 border-l-emerald-500";
      default:
        return "bg-white dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 border-l-4 border-l-slate-400";
    }
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case "High":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300";
      case "Medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300";
      case "Low":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300";
    }
  };

  // Description snippet — first ~8 words
  const descSnippet = task.description
    ? task.description.split(" ").slice(0, 8).join(" ") + (task.description.split(" ").length > 8 ? "…" : "")
    : null;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-xl h-[100px] mb-3 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`
        rounded-xl shadow-sm border p-3.5 mb-3 transition-all
        flex flex-col gap-2
        cursor-grab active:cursor-grabbing group
        ${getPriorityCardStyle()}
        ${isDueSoon || isOverdue ? "animate-pulse-border" : ""}
      `}
    >
      {/* Top row: priority badge + assignee avatar */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge()}`}>
          {task.priority}
        </span>
        {task.assignedTo && (
          <div
            className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase"
            title={`Assigned to ${task.assignedTo.username}`}
          >
            {task.assignedTo.username.substring(0, 2)}
          </div>
        )}
      </div>

      {/* Task Title */}
      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
        {task.title}
      </h4>

      {/* Description snippet */}
      {descSnippet && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
          {descSnippet}
        </p>
      )}

      {/* Due Date — prominent, blinking if urgent */}
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold mt-auto pt-1 border-t ${
          isOverdue
            ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
            : isDueSoon
            ? "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50 animate-pulse"
            : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50"
        }`}
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>
          {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        {isOverdue && (
          <span className="ml-auto text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
            Overdue
          </span>
        )}
        {isDueSoon && !isOverdue && (
          <span className="ml-auto text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-wider">
            Due soon!
          </span>
        )}
      </div>
    </div>
  );
};
