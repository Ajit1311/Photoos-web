"use client";

import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";

export interface TodayTask {
  id: string;
  title: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
}

interface TodayTasksCardProps {
  tasks: TodayTask[];
}

export default function TodayTasksCard({
  tasks,
}: TodayTasksCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Today's Tasks
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Task Overview
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {tasks.length} Task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">

          <CheckCircle2
            size={40}
            className="text-emerald-500"
          />

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            All caught up!
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            No pending tasks for today.
          </p>

        </div>
      ) : (
        <div className="mt-6 space-y-3 max-h-80 overflow-y-auto">

          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
            />
          ))}

        </div>
      )}

    </div>
  );
}

interface TaskRowProps {
  task: TodayTask;
}

function TaskRow({
  task,
}: TaskRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

      <div className="flex items-center gap-3">

        {task.status === "completed" ? (
          <CheckCircle2
            size={20}
            className="text-emerald-600"
          />
        ) : (
          <Clock3
            size={20}
            className="text-amber-500"
          />
        )}

        <div>
          <p className="font-medium text-slate-900">
            {task.title}
          </p>

          <p className="text-sm text-slate-500 capitalize">
            {task.status}
          </p>
        </div>

      </div>

      <PriorityBadge
        priority={task.priority}
      />

    </div>
  );
}

interface PriorityBadgeProps {
  priority: TodayTask["priority"];
}

function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  switch (priority) {
    case "high":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          High
        </span>
      );

    case "medium":
      return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Medium
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          Low
        </span>
      );
  }
}