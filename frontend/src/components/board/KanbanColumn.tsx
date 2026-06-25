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
  onAddTask: (status: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick, onAddTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "Column", status: id },
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

  const getAddButtonColor = (status: string) => {
    switch (status) {
      case "Open": return "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50";
      case "In Progress": return "text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50";
      case "Testing": return "text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/50";
      case "Done": return "text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50";
      default: return "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800";
    }
  };

  return (
    <div className="flex flex-col bg-slate-100/90 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 min-w-[280px] sm:w-[300px] max-w-full transition-colors shadow-sm">
      {/* Column Header */}
      <div className={`p-3 border-t-4 ${getHeaderColor(id)} border-b border-b-slate-200 dark:border-b-slate-700 flex justify-between items-center transition-colors`}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 transition-colors text-sm">{title}</h3>
          <span className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-colors">
            {tasks.length}
          </span>
        </div>

        {/* + Add Task Button */}
        <button
          onClick={() => onAddTask(id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-lg transition-colors cursor-pointer ${getAddButtonColor(id)}`}
          title={`Add task to ${title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Cards Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 min-h-[150px] transition-colors ${
          isOver ? "bg-slate-200/60 dark:bg-slate-700/50" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(id)}
            className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 text-xs italic py-8 min-h-[100px] cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors gap-2"
          >
            <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Add a task
          </div>
        )}
      </div>
    </div>
  );
};
