import { env } from "process";

interface CompanyLogoProps {
  src: string;
  className?: string | null;
}

export function CompanyLogo({src, className} : CompanyLogoProps) {
    const url = new URL(src); 

    if(url.hostname == "img.logo.dev"){
        url.searchParams.append("token", import.meta.env.VITE_LOGO_DEV_TOKEN);
        url.searchParams.append("format", "webp");

        if(!url.searchParams.has("theme")){
            url.searchParams.append("theme", "dark");
        }
    }

    return <img src={url.toString()} alt="logo" className={"rounded-lg " + className} />;
}