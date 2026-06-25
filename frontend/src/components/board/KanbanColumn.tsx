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
    <div className="flex flex-col bg-slate-100/50 rounded-xl overflow-hidden border border-slate-200 min-w-[280px] sm:w-[320px] max-w-full">
      <div className={`p-3 border-t-4 ${getHeaderColor(id)} border-b border-b-slate-200 flex justify-between items-center`}>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-3 min-h-[150px] transition-colors ${
          isOver ? "bg-slate-200/50" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm italic py-8">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
