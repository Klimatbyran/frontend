import { useQuery } from "@tanstack/react-query";
import { fetchNewsletters } from "@/lib/api";
import { NewsletterType } from "@/lib/newsletterArchive/newsletterData";

export const useNewsletters = () => {
  const { data, isLoading, isError } = useQuery({
    queryFn: fetchNewsletters,
    queryKey: ["newsletters"],
    select: (data) =>
      data.campaigns
        .filter((campaign: NewsletterType) => campaign.send_time?.trim() !== "")
        .reverse(),
  });

  return {
    data: data || [],
    isLoading,
    isError,
  };
};
