import { useQuery } from "@tanstack/react-query";

const GITHUB_OWNER = "Klimatbyran";
const REPOS = ["validation-tracking", "garbo", "frontend"];

export const useLabeledGithubIssues = (label: string) => {
  return useQuery({
    queryKey: ["github-issues", label, ...REPOS],
    queryFn: async () => {
      const allIssues: any[] = [];
      for (const repo of REPOS) {
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues?labels=${encodeURIComponent(label)}&state=all&per_page=100`;
        const res = await fetch(url, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch issues for ${repo}`);
        const issues = await res.json();
        allIssues.push(...issues);
      }
      return allIssues;
    },
    refetchInterval: 10 * 60 * 1000,
  });
};
