import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">

      <h1 className="text-2xl font-bold">
        Project not found
      </h1>

      <Link
        href="/dashboard/projects"
        className="text-blue-600 underline"
      >
        Back to Projects
      </Link>

    </div>
  );
}