import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const BrandingContext = createContext({ content: {} });
export function BrandingProvider({ children }) {
  const [content, setContent] = useState({});
  useEffect(() => { let active = true; api.get("/api/landing").then((result) => { if (active) setContent(result?.content || {}); }).catch(() => {}); return () => { active = false; }; }, []);
  return <BrandingContext.Provider value={{ content }}>{children}</BrandingContext.Provider>;
}
export default function useBranding() { return useContext(BrandingContext); }
