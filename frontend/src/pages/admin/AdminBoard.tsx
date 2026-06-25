import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTasks } from "../../services/taskService";
import { useToast } from "../../context/ToastContext";
import { ReadOnlyKanbanColumn } from "../../components/board/ReadOnlyKanbanColumn";
import type { Task } from "../../types/task";

type ColumnState = {
  tasks: Task[];
  page: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
};

const initialColumnState: ColumnState = {
  tasks: [],
  page: 1,
  total: 0,
  hasMore: true,
  loading: false,
};

const COLUMNS = ["Open", "In Progress", "Testing", "Done"];

export const AdminBoard: React.FC = () => {
  const { showError } = useToast();
  const navigate = useNavigate();
  
  const [columns, setColumns] = useState<Record<string, ColumnState>>({
    Open: { ...initialColumnState },
    "In Progress": { ...initialColumnState },
    Testing: { ...initialColumnState },
    Done: { ...initialColumnState },
  });

  const fetchColumnTasks = useCallback(async (status: string, page: number) => {
    setColumns((prev) => ({
      ...prev,
      [status]: { ...prev[status], loading: true },
    }));

    try {
      const data = await getAllTasks({
        status,
        page,
        limit: 10,
        sort: "createdAt",
        order: "desc",
      });

      setColumns((prev) => {
        const existing = prev[status];
        // Ensure no duplicates if called multiple times rapidly
        const existingIds = new Set(page === 1 ? [] : existing.tasks.map(t => t._id));
        const newTasks = data.tasks.filter(t => !existingIds.has(t._id));
        
        return {
          ...prev,
          [status]: {
            tasks: page === 1 ? data.tasks : [...existing.tasks, ...newTasks],
            page,
            total: data.pagination.total,
            hasMore: page < data.pagination.pages,
            loading: false,
          },
        };
      });
    } catch (error: any) {
      showError(error.message || `Failed to load tasks for ${status}`);
      setColumns((prev) => ({
        ...prev,
        [status]: { ...prev[status], loading: false },
      }));
    }
  }, [showError]);

  useEffect(() => {
    COLUMNS.forEach((status) => {
      fetchColumnTasks(status, 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = (status: string) => {
    const col = columns[status];
    if (!col.loading && col.hasMore) {
      fetchColumnTasks(status, col.page + 1);
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/admin/tasks/${task._id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Board</h1>
          <p className="text-slate-500 text-sm">
            Read-only Kanban view of all tasks across the system.
          </p>
        </div>
        <div className="flex space-x-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">
              Read Only
            </span>
          </span>
        </div>
      </div>

      {/* Board Layout */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 h-full snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300">
          {COLUMNS.map((colStatus) => {
            const colData = columns[colStatus];
            return (
              <div key={colStatus} className="snap-start h-full">
                <ReadOnlyKanbanColumn
                  id={colStatus}
                  title={colStatus}
                  tasks={colData.tasks}
                  totalTasks={colData.total}
                  loading={colData.loading}
                  hasMore={colData.hasMore}
                  onLoadMore={() => handleLoadMore(colStatus)}
                  onTaskClick={handleTaskClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
