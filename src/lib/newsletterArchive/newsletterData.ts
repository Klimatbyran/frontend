export type NewsletterType = {
  id: string;
  send_time: string;
  long_archive_url: string;
  settings: {
    preview_text: string;
    subject_line: string;
  };
};

export type NewsletterArchiveList = {
  newsletters: NewsletterType[];
};
