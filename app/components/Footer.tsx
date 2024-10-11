export default function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-sm text-gray-500 border-t border-gray-200">
      <p>
        © {new Date().getFullYear()} Todo App by Dhimas ferdiansyah build on
        Remix. All rights reserved.
      </p>
    </footer>
  );
}
