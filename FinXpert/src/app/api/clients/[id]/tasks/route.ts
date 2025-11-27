import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";

const TaskPayloadSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, context: RouteContext) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const advisorId = getCurrentAdvisorId();
  const { data, error } = await client
    .from("client_tasks")
    .select("id, title, description, status, due_date")
    .eq("client_id", context.params.id)
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data.map(mapRowToTask));
}

export async function POST(request: Request, context: RouteContext) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const payload = TaskPayloadSchema.parse(await request.json());

  const advisorId = getCurrentAdvisorId();
  const { data, error } = await client
    .from("client_tasks")
    .insert({
      client_id: context.params.id,
      advisor_id: advisorId,
      title: payload.title,
      description: payload.description ?? null,
      due_date: payload.dueDate ?? null,
    })
    .select("id, title, description, status, due_date")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapRowToTask(data), { status: 201 });
}

const UpdateTaskSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId query parameter is required" },
      { status: 400 },
    );
  }

  const payload = UpdateTaskSchema.parse(await request.json());

  const advisorId = getCurrentAdvisorId();
  const { data, error } = await client
    .from("client_tasks")
    .update({
      title: payload.title,
      description: payload.description,
      status: payload.status,
      due_date: payload.dueDate,
    })
    .eq("client_id", context.params.id)
    .eq("advisor_id", advisorId)
    .eq("id", taskId)
    .select("id, title, description, status, due_date")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapRowToTask(data));
}

function mapRowToTask(row: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.due_date,
  };
}

