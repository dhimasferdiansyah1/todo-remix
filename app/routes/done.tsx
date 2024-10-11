import { PrismaClient } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const id = formData.get("id") as string;

  if (!id) {
    return json({ error: "Id is required" }, { status: 400 });
  }

  try {
    await prisma.todo.delete({
      where: {
        id,
      },
    });
    return json({ success: "Todo deleted successfully" });
  } catch (error) {
    return json(
      { error: "An error occurred while deleting the todo" },
      { status: 500 }
    );
  }
};

export const loader: LoaderFunction = async () => {
  const todos = await prisma.todo.findMany({
    where: {
      done: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json(todos);
};

export default function Done() {
  const todos = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.append("id", id);
    submit(formData, { method: "post" });
  };
  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-4">Todo done</h1>
      {actionData?.success && (
        <div
          className="bg-teal-50 mb-4 border border-teal-300 text-teal-500 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{actionData.success}</span>
        </div>
      )}
      {actionData?.error && (
        <div
          className="bg-red-100 border mb-4 border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{actionData.error}</span>
        </div>
      )}
      <div className="flex flex-col gap-4 justify-center">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-sm">No todos done yet</p>
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
                    <button
                      onClick={() => handleDelete(todo.id.toString())}
                      className="text-gray-500 border border-gray-300 rounded-md py-1 px-4 hover:bg-gray-50 duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
