import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "../../types/task";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  const getHeaderColor = (status: string) => {
    switch (status) {
      case "Open":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/40";
      case "In Progress":
        return "border-amber-500 bg-amber-50 dark:bg-amber-900/40";
      case "Testing":
        return "border-purple-500 bg-purple-50 dark:bg-purple-900/40";
      case "Done":
        return "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40";
      default:
        return "border-slate-500 bg-slate-50 dark:bg-slate-800/40";
    }
  };

  return (
    <div className="flex flex-col bg-slate-100/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 min-w-[280px] sm:w-[320px] max-w-full transition-colors shadow-sm">
      <div className={`p-3 border-t-4 ${getHeaderColor(id)} border-b border-b-slate-200 dark:border-b-slate-700 flex justify-between items-center transition-colors`}>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 transition-colors">{title}</h3>
        <span className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-full shadow-sm transition-colors">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-3 min-h-[150px] transition-colors ${
          isOver ? "bg-slate-200/50 dark:bg-slate-700/50" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 text-sm italic py-8 transition-colors">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
