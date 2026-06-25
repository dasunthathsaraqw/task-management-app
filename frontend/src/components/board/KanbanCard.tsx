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
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300";
      case "Low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  const getPriorityBorder = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "border-l-rose-500";
      case "Medium":
        return "border-l-amber-500";
      case "Low":
        return "border-l-emerald-500";
      default:
        return "border-l-slate-500";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 dark:bg-slate-700/80 border-blue-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-slate-500";
      case "In Progress":
        return "bg-amber-50 dark:bg-slate-700/80 border-amber-200 dark:border-slate-600 hover:border-amber-400 dark:hover:border-slate-500";
      case "Testing":
        return "bg-purple-50 dark:bg-slate-700/80 border-purple-200 dark:border-slate-600 hover:border-purple-400 dark:hover:border-slate-500";
      case "Done":
        return "bg-emerald-50 dark:bg-slate-700/80 border-emerald-200 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-slate-500";
      default:
        return "bg-white dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500";
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white/50 dark:bg-slate-800/50 border-2 border-dashed border-purple-400 dark:border-purple-500 rounded-xl h-[120px] mb-3 opacity-50 transition-colors"
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
      className={`rounded-xl shadow-sm border p-4 mb-3 transition-all flex flex-col space-y-3 cursor-grab active:cursor-grabbing group border-l-4 ${getPriorityBorder(task.priority)} ${getStatusColor(task.status)}`}
    >
      <div className="flex justify-between items-start">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
        {task.assignedTo && (
          <div
            className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase transition-colors"
            title={`Assigned to ${task.assignedTo.username}`}
          >
            {task.assignedTo.username.substring(0, 2)}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center space-x-1 text-xs text-red-500 dark:text-red-400 font-medium transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
};
