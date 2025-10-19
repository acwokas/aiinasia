import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

export default function BulkImport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [importing, setImporting] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setErrors([]);
      setSuccessCount(0);
      setTotalRows(0);
      setProgress(0);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      
      data.push(row);
    }
    
    return data;
  };

  const validateRow = (row: any, index: number): ImportError[] => {
    const errors: ImportError[] = [];
    
    if (!row.title) {
      errors.push({ row: index + 2, field: 'title', message: 'Title is required' });
    }
    if (!row.slug) {
      errors.push({ row: index + 2, field: 'slug', message: 'Slug is required' });
    }
    if (!row.content) {
      errors.push({ row: index + 2, field: 'content', message: 'Content is required' });
    }
    
    return errors;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setErrors([]);
    setSuccessCount(0);
    setProgress(0);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      setTotalRows(rows.length);

      const batchId = crypto.randomUUID();
      const allErrors: ImportError[] = [];
      let successful = 0;

      // Create initial log entry
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("migration_logs").insert({
        batch_id: batchId,
        operation_type: "bulk_import",
        status: "in_progress",
        total_records: rows.length,
        created_by: user?.id,
      });

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        for (const [index, row] of batch.entries()) {
          const rowErrors = validateRow(row, i + index);
          
          if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
            continue;
          }

          try {
            // Get author by name or create default
            let authorId = null;
            if (row.author) {
              const { data: author } = await supabase
                .from("authors")
                .select("id")
                .eq("name", row.author)
                .single();
              authorId = author?.id;
            }

            // Parse content (assuming it's JSON string or plain text)
            let contentJson;
            try {
              contentJson = JSON.parse(row.content);
            } catch {
              contentJson = [{ type: "paragraph", content: row.content }];
            }

            // Insert article
            const { data: article, error } = await supabase
              .from("articles")
              .insert({
                title: row.title,
                slug: row.slug,
                content: contentJson,
                excerpt: row.excerpt || '',
                status: 'draft',
                author_id: authorId,
                meta_title: row.meta_title || row.title,
                meta_description: row.meta_description || row.excerpt || '',
                featured_image_url: row.featured_image_url || '',
                featured_image_alt: row.featured_image_alt || row.title,
                published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
              })
              .select()
              .single();

            if (error) throw error;

            // Create URL mapping
            if (row.old_slug && article) {
              await supabase.from("url_mappings").insert({
                old_url: `/${row.old_slug}`,
                new_url: `/article/${row.slug}`,
                old_slug: row.old_slug,
                new_slug: row.slug,
                article_id: article.id,
              });
            }

            successful++;
          } catch (error: any) {
            allErrors.push({
              row: i + index + 2,
              field: 'general',
              message: error.message,
            });
          }
        }

        setProgress(Math.round(((i + batch.length) / rows.length) * 100));
        setSuccessCount(successful);
      }

      // Update log entry
      await supabase
        .from("migration_logs")
        .update({
          status: allErrors.length === 0 ? "completed" : "completed_with_errors",
          successful_records: successful,
          failed_records: allErrors.length,
          error_details: allErrors.length > 0 ? JSON.parse(JSON.stringify(allErrors)) : null,
        })
        .eq("batch_id", batchId);

      setErrors(allErrors);

      toast({
        title: "Import Complete",
        description: `Successfully imported ${successful} of ${rows.length} articles.`,
      });

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,slug,old_slug,content,excerpt,author,meta_title,meta_description,featured_image_url,featured_image_alt,published_at
"Sample Article Title","sample-article-slug","old-sample-slug","This is the article content","Brief excerpt","Author Name","Meta Title","Meta description for SEO","https://example.com/image.jpg","Image alt text","2024-01-01T00:00:00Z"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article-import-template.csv';
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Bulk Article Import</h1>
            <p className="text-muted-foreground">Import articles from CSV for migration</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>CSV Template</CardTitle>
              <CardDescription>
                Download and fill out the CSV template with your article data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing article data to import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importing}
                />
                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>

              {file && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Imported {successCount} of {totalRows} articles
                  </p>
                </div>
              )}

              {!importing && successCount > 0 && (
                <Alert className="border-green-500">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    Successfully imported {successCount} of {totalRows} articles
                  </AlertDescription>
                </Alert>
              )}

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">
                      {errors.length} errors occurred during import:
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {errors.slice(0, 10).map((error, idx) => (
                        <p key={idx} className="text-xs">
                          Row {error.row}, {error.field}: {error.message}
                        </p>
                      ))}
                      {errors.length > 10 && (
                        <p className="text-xs">...and {errors.length - 10} more errors</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}