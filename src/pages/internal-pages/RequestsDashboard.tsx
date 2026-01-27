import { useState } from "react";
import { useLabeledGithubIssues, type GitHubIssue } from "@/hooks/useLabeledGithubIssues";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "In Queue", value: "in-queue" },
  { label: "In Progress", value: "in-progress" },
  { label: "Finished", value: "finished" },
];

function getStatus(issue: GitHubIssue): "finished" | "in-progress" | "in-queue" {
  if (issue.state === "closed") return "finished";
  if (issue.assignees && issue.assignees.length > 0) return "in-progress";
  return "in-queue";
}

export const RequestsDashboard = () => {
  const {
    data: issues,
    isLoading,
    error,
  } = useLabeledGithubIssues("requested change");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sort issues by latest activity (updated_at desc)
  const sortedIssues = issues
    ?.slice()
    .sort(
      (a: GitHubIssue, b: GitHubIssue) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

  const filteredIssues =
    statusFilter === "all"
      ? sortedIssues
      : sortedIssues?.filter((issue: GitHubIssue) => getStatus(issue) === statusFilter);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading issues</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Requested Changes Dashboard</h1>
      <div className="inline-flex bg-black-1 rounded-md overflow-hidden mb-4">
        {STATUS_FILTERS.map((filter, idx) => (
          <Button
            key={filter.value}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-4 rounded-none font-medium text-sm",
              idx === 0 ? "rounded-l-md" : "",
              idx === STATUS_FILTERS.length - 1 ? "rounded-r-md" : "",
              statusFilter === filter.value
                ? "bg-blue-5/30 text-blue-2"
                : "text-grey",
            )}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <table className="min-w-full bg-black-1 text-white border border-gray-600 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-black-1">
            <th className="px-4 py-2 text-left">Issue #</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Assignee(s)</th>
            <th className="px-4 py-2 text-left">GitHub</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues && filteredIssues.length > 0 ? (
            filteredIssues.map((issue: GitHubIssue) => {
              const status = getStatus(issue);
              let rowClass = "border-t border-gray-700 transition-colors ";
              if (status === "in-queue")
                rowClass += "bg-blue-5/30 border-l-4 border-l-blue-2";
              else if (status === "in-progress")
                rowClass += "bg-orange-5/30 border-l-4 border-l-orange-3";
              else if (status === "finished")
                rowClass +=
                  "bg-green-5/30 border-l-4 border-l-green-3 text-grey";
              return (
                <tr key={issue.number} className={rowClass}>
                  <td className="px-4 py-2 text-left">{issue.number}</td>
                  <td className="px-4 py-2 text-left">{issue.title}</td>
                  <td className="px-4 py-2 font-semibold text-left">
                    {status === "in-queue" && (
                      <span style={{ color: "var(--blue-2)" }}>In Queue</span>
                    )}
                    {status === "in-progress" && (
                      <span style={{ color: "var(--orange-3)" }}>
                        In Progress
                      </span>
                    )}
                    {status === "finished" && (
                      <span style={{ color: "var(--green-3)" }}>Finished</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-left">
                    {issue.assignees && issue.assignees.length > 0
                      ? issue.assignees.map((a) => a.login).join(", ")
                      : "Unassigned"}
                  </td>
                  <td className="px-4 py-2 text-left">
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-3 underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No issues found with label 'requested change'.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
