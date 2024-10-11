import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { useEffect, useRef } from "react";

const prisma = new PrismaClient();

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { _action, id, title, description } = Object.fromEntries(formData);

  try {
    switch (_action) {
      case "delete":
        await prisma.todo.delete({ where: { id: id as string } });
        return json({ success: "Todo deleted successfully" });
      case "create":
        if (!title || !description) {
          return json(
            { error: "Title and description are required" },
            { status: 400 }
          );
        }
        await prisma.todo.create({
          data: { title: title as string, description: description as string },
        });
        return json({ success: "Todo created successfully" });
      case "markDone":
        await prisma.todo.update({
          where: { id: id as string },
          data: { done: true },
        });
        return json({ success: "Todo marked as done successfully" });
      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return json({ error: "An error occurred" }, { status: 500 });
  }
};

export const loader: LoaderFunction = async () => {
  const todo = await prisma.todo.findMany({
    where: {
      done: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return json(todo);
};

export default function Index() {
  const todos = useLoaderData<typeof loader>();
  const formRef = useRef<HTMLFormElement>(null);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("_action", "create");
    submit(formData, { method: "post" });
    if (formRef.current) formRef.current.reset();
  };

  const handleDelete = (id: string) => {
    submit({ id, _action: "delete" }, { method: "post" });
  };

  const handleMarkDone = (id: string) => {
    submit({ id, _action: "markDone" }, { method: "post" });
  };

  useEffect(() => {
    if (actionData?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-white gap-4">
      <div className="basis-full md:basis-1/2 lg:basis-1/4 sm:pr-4">
        {actionData?.success ? (
          <div className="text-teal-500 text-sm mb-4 bg-teal-50 py-1 px-4 rounded-md border border-teal-300">
            {actionData.success}
          </div>
        ) : (
          <div className="text-gray-500 text-sm mb-4 bg-gray-100 py-1 px-4 rounded-md border border-gray-300">
            Status todo will appear here
          </div>
        )}
        <Form method="post" ref={formRef} onSubmit={handleSubmit}>
          <div className="flex flex-col p-6 rounded-md border border-gray-300 space-y-4 shadow-sm shadow-gray-100">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-medium">
                Title
              </label>
              <input
                disabled={isSubmitting}
                placeholder="Title..."
                type="text"
                id="title"
                name="title"
                className="block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="font-medium">
                Description
              </label>
              <textarea
                disabled={isSubmitting}
                placeholder="Description..."
                id="description"
                name="description"
                className="block w-full border border-gray-300 rounded-md p-2"
                rows={8}
              ></textarea>
            </div>
            <button
              disabled={isSubmitting}
              type="submit"
              className="bg-gray-900 text-white rounded-md px-4 py-2 hover:bg-gray-800 duration-200"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
            {actionData?.error && (
              <div className="text-red-500 text-sm">{actionData.error}</div>
            )}
          </div>
        </Form>
      </div>
      <div className="basis-full md:basis-1/2 lg:basis-3/4 sm:pl-4 sm:w-1/2">
        <div className="flex flex-col gap-4">
          {todos.length === 0 ? (
            <div className="text-gray-500 text-sm">No todos found</div>
          ) : (
            <>
              {todos.map(
                (todo: {
                  id: number;
                  title: string;
                  description: string;
                  createdAt: string;
                }) => (
                  <div
                    key={todo.id}
                    className="flex flex-col border rounded-md border-gray-300 shadow-sm shadow-gray-100 p-4 bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <h1 className="text-lg font-bold">{todo.title}</h1>
                      <p className="text-sm text-gray-400">{todo.createdAt}</p>
                    </div>
                    <p className="text-gray-600 truncate">{todo.description}</p>
                    <div className="flex justify-end gap-2 pt-4">
                      <Link
                        to={`/edit/${todo.id}`}
                        className="text-gray-500 border border-gray-300 rounded-md py-1 px-4 hover:bg-gray-50 duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(todo.id.toString())}
                        className="text-gray-500 border border-gray-300 rounded-md py-1 px-4 hover:bg-gray-50 duration-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleMarkDone(todo.id.toString())}
                        className="text-gray-500 border border-gray-300 rounded-md py-1 px-4 hover:bg-gray-50 duration-200"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
