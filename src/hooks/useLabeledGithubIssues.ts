import { useQuery } from "@tanstack/react-query";

const GITHUB_OWNER = "Klimatbyran";
const REPOS = ["validation-tracking", "garbo", "frontend"];

// GitHub API issue type - represents the structure returned by GitHub Issues API
export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  updated_at: string; // ISO 8601 date string
  assignees?: Array<{
    login: string;
    [key: string]: unknown; // GitHub API may include additional fields
  }>;
  // GitHub API may include many other fields, but we only use the ones above
  [key: string]: unknown;
}

export const useLabeledGithubIssues = (label: string) => {
  return useQuery({
    queryKey: ["github-issues", label, ...REPOS],
    queryFn: async () => {
      const allIssues: GitHubIssue[] = [];
      for (const repo of REPOS) {
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues?labels=${encodeURIComponent(label)}&state=all&per_page=100`;
        const res = await fetch(url, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch issues for ${repo}`);
        const issues: GitHubIssue[] = await res.json();
        allIssues.push(...issues);
      }
      return allIssues;
    },
    refetchInterval: 10 * 60 * 1000,
  });
};
