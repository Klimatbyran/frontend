export type NewsletterType = {
  id: string;
  send_time: string;
  long_archive_url: string;
/*   hasPreviousPage: boolean;
  hasNextPage: boolean; */
  settings: {
    preview_text: string;
    subject_line: string;
  };
};

export type NewsletterArchiveList = {
  newsletters: NewsletterType[];
};
