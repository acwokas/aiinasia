import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function NewsletterManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: latestEdition, refetch } = useQuery({
    queryKey: ["newsletter-latest-edition"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_editions")
        .select("*")
        .order("edition_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-newsletter", {
        body: { edition_date: new Date().toISOString().split("T")[0] },
      });

      if (error) throw error;

      toast.success("Newsletter generated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate newsletter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendTest = async () => {
    if (!latestEdition) return;

    try {
      await supabase.functions.invoke("send-weekly-newsletter", {
        body: {
          edition_id: latestEdition.id,
          test_email: "contact@aiinasia.com",
        },
      });

      toast.success("Test email sent to contact@aiinasia.com");
    } catch (error: any) {
      toast.error(error.message || "Failed to send test");
    }
  };

  const handleSend = async () => {
    if (!latestEdition) return;
    
    setIsSending(true);
    try {
      await supabase.functions.invoke("send-weekly-newsletter", {
        body: { edition_id: latestEdition.id },
      });

      toast.success("Newsletter sending started!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-4xl font-bold mb-8">Newsletter Manager</h1>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Current Edition</h2>
            {latestEdition ? (
              <div className="space-y-4">
                <p><strong>Date:</strong> {latestEdition.edition_date}</p>
                <p><strong>Status:</strong> {latestEdition.status}</p>
                <p><strong>Subject:</strong> {latestEdition.subject_line}</p>
                <div className="flex gap-2">
                  <Button onClick={handleSendTest}>Send Test Email</Button>
                  <Button onClick={handleSend} disabled={isSending || latestEdition.status === "sent"}>
                    {isSending ? "Sending..." : "Send to All Subscribers"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">No newsletter edition found.</p>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate New Newsletter"}
                </Button>
              </div>
            )}
          </Card>

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="tools">Tools & Prompts</TabsTrigger>
              <TabsTrigger value="mystery">Mystery Links</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Newsletter Content</h3>
                <p className="text-muted-foreground">Content editor coming soon...</p>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Tools & Prompts Library</h3>
                <p className="text-muted-foreground">Tools manager coming soon...</p>
              </Card>
            </TabsContent>

            <TabsContent value="mystery">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Mystery Links</h3>
                <p className="text-muted-foreground">Mystery links manager coming soon...</p>
              </Card>
            </TabsContent>

            <TabsContent value="sponsors">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Sponsors</h3>
                <p className="text-muted-foreground">Sponsors manager coming soon...</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
