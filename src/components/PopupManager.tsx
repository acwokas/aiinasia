import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NewsletterPopup from "./NewsletterPopup";
import WelcomePopup from "./WelcomePopup";

const PopupManager = () => {
  const { data: settings } = useQuery({
    queryKey: ["popup-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("popup_settings")
        .select("active_popup")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const activePopup = settings?.active_popup || "none";

  if (activePopup === "newsletter") {
    return <NewsletterPopup />;
  }

  if (activePopup === "welcome") {
    return <WelcomePopup />;
  }

  return null;
};

export default PopupManager;
