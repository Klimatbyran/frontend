import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { CompanyLogo } from "../CompanyLogo";
import { t } from "i18next";

interface LogoDevDialogProps {
  logoUrl: string | null;
  setLogoUrl: (value: string) => void;
  className?: string;
}

export function LogoDevDialog({
  logoUrl,
  setLogoUrl,
  className,
}: LogoDevDialogProps) {
  const [domain, setDomain] = useState("");
  const [theme, setTheme] = useState("auto");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && logoUrl && logoUrl.includes("img.logo.dev")) {
      try {
        const url = new URL(logoUrl);

        setDomain(url.pathname.substring(1));

        if (url.searchParams.has("theme")) {
          setTheme(url.searchParams.get("theme") ?? theme);
        }
      } catch {}
    }
  }, [open, logoUrl]);

  const url =
    domain.indexOf(".") > 0 &&
    domain.indexOf(".") < domain.length - 1 &&
    new URL(`https://img.logo.dev/${domain}`);

  if (url && theme !== "auto") {
    url.searchParams.append("theme", theme);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={className}>
          {t("companies.logoDevDialog.title")}
        </button>
      </DialogTrigger>
      <DialogContent className="w-fit bg-black-2 rounded-level-2">
        <DialogHeader>
          <DialogTitle>{t("companies.logoDevDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <Label className="w-[100px]" htmlFor="domain">
              {t("companies.logoDevDialog.domain")}
            </Label>
            <Input
              id="domainInput"
              name="domain"
              value={domain}
              placeholder="google.com"
              onChange={(e) => setDomain(e.target.value)}
              className="w-full align-right bg-black-1 border text-white"
            />
          </div>
          <div className="flex items-center">
            <Label className="w-[100px]" htmlFor="theme">
              {t("companies.logoDevDialog.theme")}
            </Label>
            <Select
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger className="w-full bg-black-1 text-white border border-gray-600 px-3 py-2 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black-1 text-white">
                <SelectItem key="auto" value="auto">
                  {t("companies.logoDevDialog.themeOptions.auto")}
                </SelectItem>
                <SelectItem key="light" value="light">
                  {t("companies.logoDevDialog.themeOptions.light")}
                </SelectItem>
                <SelectItem key="dark" value="dark">
                  {t("companies.logoDevDialog.themeOptions.dark")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="m-auto size-[100px] bg-black-1 p-3 rounded-level-3">
            {url && (
              <CompanyLogo src={url.toString()} className={"rounded-xl"} />
            )}
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              if (url) {
                setLogoUrl(url.toString());
                setOpen(false);
              }
            }}
            className="m-auto inline-flex mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
          >
            {t("companies.logoDevDialog.generate")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
