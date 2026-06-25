import React from "react";
import { Input } from "../Input";
import { Select } from "../Select";
import type { User } from "../../types/auth";
import type { TaskFilters as Filters } from "../../types/task";

interface TaskFiltersProps {
  filters: Filters;
  onChange: (newFilters: Filters) => void;
  users: User[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onChange, users }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleSelectChange = (field: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, [field]: e.target.value || undefined, page: 1 });
  };

  const handleDateChange = (field: "fromDate" | "toDate") => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [field]: e.target.value || undefined, page: 1 });
  };

  const handleClear = () => {
    onChange({
      search: "",
      status: undefined,
      priority: undefined,
      assignedTo: undefined,
      fromDate: undefined,
      toDate: undefined,
      sort: filters.sort,
      order: filters.order,
      page: 1,
      limit: filters.limit,
    });
  };

  const userOptions = [
    { value: "", label: "All Assignees" },
    { value: "null", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id || (u as any)._id, label: u.username })),
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Search & Filters</h4>
        <button
          onClick={handleClear}
          className="text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            label="Search Text"
            placeholder="Search title/desc..."
            value={filters.search || ""}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status */}
        <Select
          label="Status"
          value={filters.status || ""}
          onChange={handleSelectChange("status")}
          options={[
            { value: "", label: "All Statuses" },
            { value: "Open", label: "Open" },
            { value: "In Progress", label: "In Progress" },
            { value: "Testing", label: "Testing" },
            { value: "Done", label: "Done" },
          ]}
        />

        {/* Priority */}
        <Select
          label="Priority"
          value={filters.priority || ""}
          onChange={handleSelectChange("priority")}
          options={[
            { value: "", label: "All Priorities" },
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
          ]}
        />

        {/* Assignee */}
        <Select
          label="Assignee"
          value={filters.assignedTo || ""}
          onChange={handleSelectChange("assignedTo")}
          options={userOptions}
        />

        {/* Sorting options */}
        <Select
          label="Sort By"
          value={filters.sort || "createdAt"}
          onChange={handleSelectChange("sort")}
          options={[
            { value: "createdAt", label: "Date Created" },
            { value: "dueDate", label: "Due Date" },
            { value: "title", label: "Alphabetical" },
            { value: "priority", label: "Priority" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1 border-t border-slate-100">
        {/* Date From */}
        <Input
          type="date"
          label="Due From"
          value={filters.fromDate || ""}
          onChange={handleDateChange("fromDate")}
        />

        {/* Date To */}
        <Input
          type="date"
          label="Due To"
          value={filters.toDate || ""}
          onChange={handleDateChange("toDate")}
        />

        {/* Order */}
        <Select
          label="Sort Order"
          value={filters.order || "desc"}
          onChange={handleSelectChange("order")}
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" },
          ]}
        />
      </div>
    </div>
  );
};
