import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader: LoaderFunction = async ({ params }) => {
  const todo = await prisma.todo.findUnique({
    where: {
      id: params.id,
    },
  });
  if (!todo) {
    return json({ error: "Todo not found" }, { status: 404 });
  }
  return json(todo);
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || !description) {
    return json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  try {
    await prisma.todo.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
      },
    });
    return redirect("/");
  } catch (error) {
    return json(
      { error: "An error occurred while updating the todo" },
      { status: 500 }
    );
  }
};

export default function Edit() {
  const todo = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Todo</h1>
      <Form method="post">
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={todo.title}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={todo.description}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={8}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 duration-200"
        >
          {isSubmitting ? "Updating..." : "Update Todo"}
        </button>
      </Form>
    </div>
  );
}
