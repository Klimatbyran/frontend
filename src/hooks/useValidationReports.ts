import { useQuery } from "@tanstack/react-query";

type Label = {
  name: string;
  color: string;
};

export type GithubValidationIssue = {
  number: number;
  html_url: string;
  title: string;
  user: {
    login: string;
  };
  labels: Label[];
  state: "open" | "closed";
};

const owner = "Klimatbyran";
const repo = "validation-tracking";

export const githubProjectUrl = `https://github.com/${owner}/${repo}`;

const fetchAllGithubIssues = async (): Promise<
  Record<string, GithubValidationIssue[]>
> => {
  const perPage = 100;
  let page = 1;
  let allIssues: GithubValidationIssue[] = [];
  let hasMore = true;
  const token = undefined;

  while (hasMore) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=${perPage}&page=${page}`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data: GithubValidationIssue[] = await res.json();
    allIssues = allIssues.concat(data);
    hasMore = data.length === perPage;
    page++;
  }

  return allIssues.reduce(
    (acc, issue) => {
      const idMatch = issue.title.match(/\[(.+)\]/);
      if (idMatch) {
        const wikidataId = idMatch[1];
        if (!acc[wikidataId]) {
          acc[wikidataId] = [];
        }
        acc[wikidataId].push(issue);
      }
      return acc;
    },
    {} as Record<string, GithubValidationIssue[]>,
  );
};

export const useValidationReports = () => {
  const {
    data: issues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["validation-reports"],
    queryFn: fetchAllGithubIssues,
    refetchInterval: 10 * 60 * 1000,
  });

  return { issues, isLoading, error };
};
