import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Copy, CheckCircle2, Home, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ExtractImageUrls() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    setLoading(false);
  };

  const parseCSV = (csvText: string): string[] => {
    const lines = csvText.trim().split('\n');
    const urls = new Set<string>();
    
    // Find the header row and get the index of featured_image_url column
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const imageUrlIndex = headers.findIndex(h => 
      h === 'featured_image_url' || h === 'image_url' || h === 'featured_image'
    );

    if (imageUrlIndex === -1) {
      throw new Error('Could not find image URL column. Expected "featured_image_url", "image_url", or "featured_image"');
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle CSV parsing with quoted values
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Push the last value

      // Get the image URL
      const imageUrl = values[imageUrlIndex]?.replace(/"/g, '').trim();
      
      // Only add valid URLs
      if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        urls.add(imageUrl);
      }
    }
    
    return Array.from(urls);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvText = e.target?.result as string;
          const extractedUrls = parseCSV(csvText);

          if (extractedUrls.length === 0) {
            toast({
              title: "No URLs found",
              description: "The CSV file doesn't contain any valid image URLs.",
              variant: "destructive",
            });
            return;
          }

          setImageUrls(extractedUrls);
          toast({
            title: "Success",
            description: `Extracted ${extractedUrls.length} unique image URLs.`,
          });
        } catch (error: any) {
          toast({
            title: "Error parsing CSV",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Error reading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrls.join('\n'));
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Image URLs copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = imageUrls.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-urls-${Date.now()}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6 max-w-4xl mx-auto">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="inline-flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Extract Image URLs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Extract Image URLs from CSV</h1>
            <p className="text-muted-foreground">
              Upload your article import CSV to extract all image URLs
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Article CSV</CardTitle>
              <CardDescription>
                Upload the same CSV you used to import articles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  This tool will extract all unique image URLs from the <strong>featured_image_url</strong> column in your CSV.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                />
              </div>

              {imageUrls.length > 0 && (
                <div className="space-y-4">
                  <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      Found {imageUrls.length} unique image URLs
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Extracted URLs:</label>
                    <Textarea
                      value={imageUrls.join('\n')}
                      readOnly
                      rows={15}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline">
                      {copied ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download as Text File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {imageUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Now that you have the URLs, proceed to migrate the images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full justify-start">
                  <Link to="/admin/image-migration">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Image Migration Tool
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground px-2">
                  Copy the URLs above and paste them into the Image Migration tool
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}