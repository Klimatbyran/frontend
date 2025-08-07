import { useQuery } from "@tanstack/react-query";

interface CampaignProps {
  id: string;
  send_time: string;
  long_archive_url: string;
  preview_text: string;
  subject_line: string;
}

const fetchNewsletters = async () => {
  const url = "http://localhost:3000/api/newsletters";
  try {
    const response = await fetch(url);

    if (response.ok) {
      const result = await response.json();

      //Removes empty template newsletters
      const filteredResults = result.campaigns.filter(
        (campaign: CampaignProps) => {
          return campaign.send_time !== "" || undefined;
        },
      );
      return filteredResults.reverse();
    }
  } catch (err) {
    console.log(err);
  }
};

export const useNewsletters = () => {
  const { data, isLoading, isError } = useQuery({
    queryFn: () => fetchNewsletters(),
    queryKey: ["newsletters"],
  });

  return { data, isLoading, isError };
};
