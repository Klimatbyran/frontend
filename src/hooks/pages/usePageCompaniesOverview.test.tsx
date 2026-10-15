import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  PageCompaniesOverviewSummary,
  PageCompanyOverviewItem,
  PageListResponse,
} from "@/types/pages";
import {
  usePageCompaniesOverviewList,
  usePageCompaniesOverviewSummary,
} from "./usePageCompaniesOverview";

const { getPageCompaniesOverview, getPageCompaniesOverviewSummary } =
  vi.hoisted(() => ({
    getPageCompaniesOverview: vi.fn(),
    getPageCompaniesOverviewSummary: vi.fn(),
  }));

vi.mock("@/lib/pagesApi", () => ({
  getPageCompaniesOverview,
  getPageCompaniesOverviewSummary,
}));

function listPage(name: string): PageListResponse<PageCompanyOverviewItem> {
  return {
    items: [
      {
        id: name,
        name,
        wikidataId: null,
        tags: [],
        logoUrl: null,
        sectorCode: "15",
        industryGroupCode: null,
        baseYear: 2019,
        meetsParis: true,
        emissionsChangeFromBaseYear: -10,
        latestYear: 2024,
        latestTotalEmissions: 100,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  };
}

function summary(onTrack: number): PageCompaniesOverviewSummary {
  return {
    paris: {
      total: onTrack,
      onTrack,
      offTrack: 0,
      unknown: 0,
      onTrackPercent: 100,
    },
    reporting: { total: onTrack, enough: onTrack, tooLittle: 0 },
    industries: [],
    industryFilters: [],
    companyCount: onTrack,
    doingWell: [],
    fallingBehind: [],
    parisDots: [],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function renderWithClient<Props, Result>(
  hook: (props: Props) => Result,
  initialProps: Props,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(hook, {
    initialProps,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

beforeEach(() => {
  getPageCompaniesOverview.mockReset();
  getPageCompaniesOverviewSummary.mockReset();
});

describe("usePageCompaniesOverviewList", () => {
  it("drops the previous sector's rows while the next sector is in flight", async () => {
    const next = deferred<PageListResponse<PageCompanyOverviewItem>>();
    getPageCompaniesOverview.mockImplementation(
      async (query: { sector?: string }) => {
        if (query.sector === "35") return next.promise;
        return listPage("All Co");
      },
    );

    const { result, rerender } = renderWithClient(
      ({ sector }: { sector: string | null }) =>
        usePageCompaniesOverviewList({ sector }),
      { sector: null },
    );

    await waitFor(() => {
      expect(result.current.companies.map((company) => company.name)).toEqual([
        "All Co",
      ]);
    });

    rerender({ sector: "35" });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    expect(result.current.companies).toEqual([]);

    next.resolve(listPage("Health Co"));

    await waitFor(() => {
      expect(result.current.companies.map((company) => company.name)).toEqual([
        "Health Co",
      ]);
    });
    expect(result.current.loading).toBe(false);
  });

  it("loads every page when Paris is sorted ascending so missing statuses can sink", async () => {
    getPageCompaniesOverview.mockImplementation(
      async (query: {
        page?: number;
        sortBy?: string;
        sortDir?: string;
        pageSize?: number;
      }) => {
        expect(query.sortBy).toBe("paris");
        expect(query.sortDir).toBe("asc");
        expect(query.pageSize).toBe(100);
        const page = query.page ?? 1;
        return {
          ...listPage(page === 1 ? "First" : "Second"),
          total: 2,
          page,
          totalPages: 2,
        };
      },
    );

    const { result } = renderWithClient(
      () => usePageCompaniesOverviewList({ sortBy: "paris", sortDir: "asc" }),
      {},
    );

    await waitFor(() => {
      expect(result.current.companies.map((company) => company.name)).toEqual([
        "First",
        "Second",
      ]);
    });
    expect(result.current.hasMore).toBe(false);
    expect(getPageCompaniesOverview).toHaveBeenCalledTimes(2);
  });

  it("keeps rows while the same sector is re-sorted", async () => {
    const next = deferred<PageListResponse<PageCompanyOverviewItem>>();
    getPageCompaniesOverview.mockImplementation(
      async (query: { sortBy?: string }) => {
        if (query.sortBy === "name") return next.promise;
        return listPage("Alpha");
      },
    );

    const { result, rerender } = renderWithClient(
      ({ sortBy }: { sortBy: "paris" | "name" }) =>
        usePageCompaniesOverviewList({ sector: "15", sortBy }),
      { sortBy: "paris" },
    );

    await waitFor(() => {
      expect(result.current.companies.map((company) => company.name)).toEqual([
        "Alpha",
      ]);
    });

    rerender({ sortBy: "name" });

    expect(result.current.companies.map((company) => company.name)).toEqual([
      "Alpha",
    ]);
    expect(result.current.loading).toBe(false);
    expect(result.current.refreshing).toBe(true);
  });
});

describe("usePageCompaniesOverviewSummary", () => {
  it("does not keep the previous sector summary while the next sector loads", async () => {
    const next = deferred<PageCompaniesOverviewSummary>();
    getPageCompaniesOverviewSummary.mockImplementation(
      async (sector: string | null) => {
        if (sector === "35") return next.promise;
        return summary(4);
      },
    );

    const { result, rerender } = renderWithClient(
      ({ sector }: { sector: string | null }) =>
        usePageCompaniesOverviewSummary({ sector }),
      { sector: null },
    );

    await waitFor(() => {
      expect(result.current.summary?.paris.onTrack).toBe(4);
    });

    rerender({ sector: "35" });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    expect(result.current.summary).toBeUndefined();
  });
});
