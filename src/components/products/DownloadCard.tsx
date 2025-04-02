import { LucideIcon } from "lucide-react";
import { Download } from "lucide-react";

interface DownloadCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  downloadUrl: string;
  downloadText: string;
}

export function DownloadCard({
  icon: Icon,
  title,
  description,
  downloadUrl,
  downloadText,
}: DownloadCardProps) {
  return (
    <div className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-black-2 p-3 border border-black-1">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-light text-white">{title}</h3>
      </div>
      <p className="text-grey mb-8 h-24">{description}</p>
      <a
        href={downloadUrl}
        download
        className="inline-flex items-center justify-center gap-2 rounded-md bg-black-2 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-black-1 w-full transition-all border border-black-1"
      >
        <Download className="h-5 w-5" />
        {downloadText}
      </a>
    </div>
  );
}
