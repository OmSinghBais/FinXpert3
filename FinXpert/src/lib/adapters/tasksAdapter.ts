import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";

export type ClientTask = {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
};

const MOCK_TASKS: ClientTask[] = [
  {
    id: "task-1",
    clientId: "CLT-001",
    title: "Rebalance mutual fund allocation",
    description:
      "Shift profits from outperforming schemes into conservative debt to lock gains.",
    status: "OPEN",
    dueDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "task-2",
    clientId: "CLT-001",
    title: "Loan EMI strategy review",
    description: "Evaluate rate switch for LAP to reduce monthly outflow by 80 bps.",
    status: "IN_PROGRESS",
    dueDate: null,
  },
];

export async function fetchClientTasks(clientId: string): Promise<ClientTask[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return MOCK_TASKS.filter((task) => task.clientId === clientId);
  }

  const advisorId = await getCurrentAdvisorId();
  const { data, error } = await client
    .from("client_tasks")
    .select("id, client_id, title, description, status, due_date")
    .eq("client_id", clientId)
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("client_tasks query failed, returning mock data", error);
    return MOCK_TASKS.filter((task) => task.clientId === clientId);
  }

  if (!data) {
    return [];
  }

  return data.map((task) => ({
    id: task.id,
    clientId: task.client_id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.due_date,
  }));
}

