"use client";

import { FormEvent, useState, useTransition } from "react";
import type { ClientTask } from "@/lib/adapters/tasksAdapter";

type Props = {
  clientId: string;
  initialTasks: ClientTask[];
};

export function ClientTaskBoard({ clientId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<ClientTask[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  async function createTask(payload: { title: string; description?: string }) {
    const response = await fetch(`/api/clients/${clientId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    return response.json();
  }

  async function updateTask(taskId: string, status: Task["status"]) {
    const response = await fetch(
      `/api/clients/${clientId}/tasks?taskId=${taskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    return response.json();
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        const task = await createTask({ title, description });
        setTasks((prev) => [task, ...prev]);
        setTitle("");
        setDescription("");
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleQuickCampaignTask() {
    startTransition(async () => {
      try {
        const task = await createTask({
          title: "Launch campaign touchpoint",
          description: "Auto-created from control tower button.",
        });
        setTasks((prev) => [task, ...prev]);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function handleStatusChange(taskId: string, status: ClientTask["status"]) {
    startTransition(async () => {
      try {
        const updated = await updateTask(taskId, status);
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updated : task)),
        );
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <section className="rounded-2xl bg-slate-900/60 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-300">
            Client Tasks
          </p>
          <p className="text-sm text-slate-300">
            Logged in Supabase via `/api/clients/{clientId}/tasks`
          </p>
        </div>
        <button
          onClick={handleQuickCampaignTask}
          className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          disabled={isPending}
        >
          Add to campaign
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Add Task"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-slate-400">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <select
                  className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-white focus:border-emerald-400 focus:outline-none"
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.value as ClientTask["status"],
                    )
                  }
                  disabled={isPending}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="DONE">Done</option>
                </select>
                {task.dueDate && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">
                    Due {task.dueDate}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-slate-400">
            No tasks yet. Use the form above to create one.
          </p>
        )}
      </div>
    </section>
  );
}

