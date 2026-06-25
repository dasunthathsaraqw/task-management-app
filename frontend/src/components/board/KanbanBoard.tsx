import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { Task } from "../../types/task";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { updateUserTaskStatus as updateTaskStatus } from "../../services/userTaskService";
import { useToast } from "../../context/ToastContext";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const COLUMNS = ["Open", "In Progress", "Testing", "Done"];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks: initialTasks, onTaskClick }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t._id === activeId);
        const overIndex = prev.findIndex((t) => t._id === overId);

        if (prev[activeIndex].status !== prev[overIndex].status) {
          // Changing status
          const newTasks = [...prev];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: prev[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dropping a task over an empty column
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t._id === activeId);
        const newTasks = [...prev];
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: overId as Task["status"] };
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const isActiveTask = active.data.current?.type === "Task";

    if (!isActiveTask) return;

    const task = tasks.find((t) => t._id === activeId);
    if (!task) return;

    const originalTask = initialTasks.find((t) => t._id === activeId);
    
    // Determine the new status
    let newStatus = task.status;
    const isOverColumn = over.data.current?.type === "Column";
    const isOverTask = over.data.current?.type === "Task";
    
    if (isOverColumn) {
      newStatus = overId as Task["status"];
    } else if (isOverTask) {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // If status changed, call API
    if (originalTask && originalTask.status !== newStatus) {
      // Optimistically update locally first
      setTasks((prev) => {
        const index = prev.findIndex((t) => t._id === activeId);
        const updated = [...prev];
        updated[index] = { ...updated[index], status: newStatus };
        return updated;
      });

      // Update backend after 0.5s delay
      setTimeout(async () => {
        try {
          await updateTaskStatus(task._id, newStatus);
        } catch (error: any) {
          showError(error.message || "Failed to update task status");
          // Revert to initial state if it fails
          setTasks((prev) => {
            const index = prev.findIndex((t) => t._id === activeId);
            const reverted = [...prev];
            reverted[index] = { ...reverted[index], status: originalTask.status };
            return reverted;
          });
        }
      }, 500);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <div key={col} className="snap-start">
            <KanbanColumn
              id={col}
              title={col}
              tasks={tasks.filter((t) => t.status === col)}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} onClick={onTaskClick} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
