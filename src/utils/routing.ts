import { To } from "react-router-dom";

export const localizedPath = (lang: string, path: To) => `/${lang}${path}`;

