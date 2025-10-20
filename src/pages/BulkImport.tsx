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
import { Upload, FileText, AlertCircle, CheckCircle2, Download, XCircle, Undo2, Trash2 } from "lucide-react";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportLog {
  id: string;
  batch_id: string;
  operation_type: string;
  status: string;
  total_records: number;
  successful_records: number;
  failed_records: number;
  created_at: string;
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
  const [cancelRequested, setCancelRequested] = useState(false);
  const [recentImports, setRecentImports] = useState<ImportLog[]>([]);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
    fetchRecentImports();
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

  const fetchRecentImports = async () => {
    const { data, error } = await supabase
      .from("migration_logs")
      .select("*")
      .eq("operation_type", "bulk_import")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentImports(data);
    }
  };

  const handleRollback = async (batchId: string) => {
    if (!confirm("Are you sure you want to rollback this import? This will permanently delete all articles from this batch.")) {
      return;
    }

    setRollingBack(batchId);

    try {
      // Delete all articles with this batch_id
      const { error: articlesError } = await supabase
        .from("articles")
        .delete()
        .eq("batch_id", batchId);

      if (articlesError) throw articlesError;

      // Delete all url_mappings with this batch_id
      const { error: mappingsError } = await supabase
        .from("url_mappings")
        .delete()
        .eq("batch_id", batchId);

      if (mappingsError) throw mappingsError;

      // Update migration log status
      await supabase
        .from("migration_logs")
        .update({ status: "rolled_back" })
        .eq("batch_id", batchId);

      toast({
        title: "Rollback Complete",
        description: "All articles from this import have been deleted.",
      });

      // Refresh the imports list
      fetchRecentImports();
    } catch (error: any) {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRollingBack(null);
    }
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
    const rows: any[] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let insideQuotes = false;
    let headers: string[] = [];
    
    // Parse character by character to handle quoted multi-line fields
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' && !insideQuotes) {
        // End of row
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          
          if (headers.length === 0) {
            // First row is headers
            headers = currentRow;
          } else if (currentRow.length === headers.length) {
            // Create object from row
            const rowObj: any = {};
            headers.forEach((header, index) => {
              rowObj[header] = currentRow[index] || '';
            });
            rows.push(rowObj);
          }
          
          currentRow = [];
          currentField = '';
        }
      } else {
        currentField += char;
      }
    }
    
    // Handle last row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (headers.length > 0 && currentRow.length === headers.length) {
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = currentRow[index] || '';
        });
        rows.push(rowObj);
      }
    }
    
    return rows;
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

  const parseWordPressContent = (wpContent: string) => {
    if (!wpContent || wpContent.trim() === '') {
      return [{ type: 'paragraph', content: 'No content available' }];
    }

    // Remove "You may also like" section from the end
    wpContent = wpContent.replace(/<!-- wp:heading[^>]*-->\s*<h\d[^>]*>You may also like.*$/is, '');

    const blocks: any[] = [];
    
    // Extract content between WordPress block comments
    const paragraphMatches = wpContent.matchAll(/<!-- wp:paragraph -->\s*<p[^>]*>(.*?)<\/p>\s*<!-- \/wp:paragraph -->/gs);
    for (const match of paragraphMatches) {
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 0) {
        blocks.push({
          type: 'paragraph',
          content: text
        });
      }
    }
    
    // Extract headings
    const headingMatches = wpContent.matchAll(/<!-- wp:heading[^>]*-->\s*<h(\d)[^>]*>(.*?)<\/h\d>\s*<!-- \/wp:heading -->/gs);
    for (const match of headingMatches) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 0) {
        blocks.push({
          type: 'heading',
          attrs: { level },
          content: text
        });
      }
    }
    
    // Extract lists
    const listMatches = wpContent.matchAll(/<!-- wp:list -->\s*<ul[^>]*>(.*?)<\/ul>\s*<!-- \/wp:list -->/gs);
    for (const match of listMatches) {
      const listContent = match[1];
      const items = Array.from(listContent.matchAll(/<li[^>]*>(.*?)<\/li>/gs))
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(text => text.length > 0);
      
      if (items.length > 0) {
        blocks.push({
          type: 'list',
          attrs: { listType: 'unordered' },
          content: items
        });
      }
    }
    
    // Fallback: if no blocks found, try to extract plain HTML paragraphs
    if (blocks.length === 0) {
      const plainParas = wpContent.matchAll(/<p[^>]*>(.*?)<\/p>/gs);
      for (const match of plainParas) {
        const text = match[1].replace(/<[^>]+>/g, '').trim();
        if (text && text.length > 0 && !text.startsWith('wp-block')) {
          blocks.push({
            type: 'paragraph',
            content: text
          });
        }
      }
    }
    
    return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: 'Content could not be parsed' }];
  };

  const sanitizeUrl = (url: string): string => {
    if (!url) return '';
    
    // Replace problematic Unicode characters with standard ASCII equivalents
    return url
      .replace(/[\u2010-\u2015]/g, '-')  // Replace various Unicode hyphens with standard hyphen
      .replace(/[\u2018\u2019]/g, "'")   // Replace smart quotes with standard quotes
      .replace(/[\u201C\u201D]/g, '"')   // Replace smart double quotes
      .replace(/[\u2026]/g, '...')       // Replace ellipsis
      .replace(/[\u00A0]/g, ' ')         // Replace non-breaking space
      .replace(/[^\x00-\x7F]/g, (char) => {
        // For any remaining non-ASCII characters, try to encode them properly
        return encodeURIComponent(char);
      });
  };

  const sanitizeText = (text: string): string => {
    if (!text) return '';
    
    // Fix common UTF-8 encoding issues
    return text
      .replace(/â€œ|â€�/g, '"')         // Fix encoded left/right double quotes
      .replace(/â€˜|â€™/g, "'")         // Fix encoded left/right single quotes
      .replace(/â€"|â€"/g, '-')         // Fix encoded em-dash/en-dash
      .replace(/â€¦/g, '...')           // Fix encoded ellipsis
      .replace(/Â /g, ' ')              // Fix non-breaking space
      .replace(/‚Äú/g, '"')             // Fix double quote variant
      .replace(/‚Äù/g, '"')             // Fix double quote variant
      .replace(/‚Äë/g, '-')             // Fix hyphen variant
      .replace(/‚Äô/g, "'")             // Fix apostrophe variant
      .replace(/[\u2010-\u2015]/g, '-') // Replace Unicode hyphens
      .replace(/[\u2018\u2019]/g, "'")  // Replace smart single quotes
      .replace(/[\u201C\u201D]/g, '"')  // Replace smart double quotes
      .replace(/[\u2026]/g, '...')      // Replace ellipsis
      .replace(/[\u00A0]/g, ' ')        // Replace non-breaking space
      .trim();
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setCancelRequested(false);
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
        // Check if cancel was requested
        if (cancelRequested) {
          console.log("Import cancelled by user - rolling back...");
          // Delete all articles from this batch
          await supabase
            .from("articles")
            .delete()
            .eq("batch_id", batchId);
          await supabase
            .from("url_mappings")
            .delete()
            .eq("batch_id", batchId);
          break;
        }
        
        const batch = rows.slice(i, i + batchSize);
        
        for (const [index, row] of batch.entries()) {
          // Check cancel again before each article
          if (cancelRequested) {
            console.log("Import cancelled - rolling back batch...");
            // Delete all articles from this batch
            await supabase
              .from("articles")
              .delete()
              .eq("batch_id", batchId);
            await supabase
              .from("url_mappings")
              .delete()
              .eq("batch_id", batchId);
            break;
          }
          
          const rowErrors = validateRow(row, i + index);
          
          if (rowErrors.length > 0) {
            allErrors.push(...rowErrors);
            continue;
          }

          try {
            // Check if article with this slug already exists
            const { data: existingArticle } = await supabase
              .from("articles")
              .select("id, slug")
              .eq("slug", row.slug)
              .maybeSingle();

            if (existingArticle) {
              allErrors.push({
                row: i + index + 2,
                field: 'slug',
                message: `Article with slug "${row.slug}" already exists. Skipped.`,
              });
              continue;
            }

            // Get author by name or create default
            let authorId = null;
            if (row.author) {
              // Map AIinASIA to Intelligence Desk
              const authorName = row.author === 'AIinASIA' ? 'Intelligence Desk' : row.author;
              
              const { data: author } = await supabase
                .from("authors")
                .select("id")
                .eq("name", authorName)
                .maybeSingle();
              authorId = author?.id;
            }

            // Parse content from WordPress blocks
            let contentJson;
            if (!row.content || row.content.trim() === '') {
              contentJson = [{ type: 'paragraph', content: 'No content available' }];
            } else {
              try {
                // First try parsing as JSON (if already converted)
                contentJson = JSON.parse(row.content);
              } catch {
                // Parse WordPress Gutenberg blocks
                contentJson = parseWordPressContent(row.content);
              }
            }

            // Insert article
            const { data: article, error } = await supabase
              .from("articles")
              .insert({
                title: sanitizeText(row.title),
                slug: row.slug,
                content: contentJson,
                excerpt: sanitizeText(row.excerpt || ''),
                status: 'draft',
                author_id: authorId,
                meta_title: sanitizeText(row.meta_title || row.title),
                meta_description: sanitizeText(row.meta_description || row.excerpt || ''),
                featured_image_url: sanitizeUrl(row.featured_image_url || ''),
                featured_image_alt: sanitizeText(row.featured_image_alt || row.title),
                published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
                batch_id: batchId,
              })
              .select()
              .single();

            if (error) throw error;

            // Check cancel immediately after insert
            if (cancelRequested) {
              console.log("Import cancelled - rolling back batch...");
              await supabase
                .from("articles")
                .delete()
                .eq("batch_id", batchId);
              await supabase
                .from("url_mappings")
                .delete()
                .eq("batch_id", batchId);
              break;
            }

            // Handle categories
            if (row.categories && article) {
              const categoryNames = row.categories.split(',').map((c: string) => c.trim()).filter(Boolean);
              for (const catName of categoryNames) {
                // Try matching by name (case-insensitive) first, then by slug
                const { data: categories } = await supabase
                  .from("categories")
                  .select("id, name, slug");
                
                const category = categories?.find(cat => 
                  cat.name.toLowerCase() === catName.toLowerCase() ||
                  cat.slug.toLowerCase() === catName.toLowerCase()
                );
                
                if (category) {
                  await supabase.from("article_categories").insert({
                    article_id: article.id,
                    category_id: category.id,
                  });
                }
              }
            }

            // Handle tags
            if (row.tags && article) {
              const tagNames = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
              for (const tagName of tagNames) {
                // Try to find existing tag or create new one
                let { data: tag } = await supabase
                  .from("tags")
                  .select("id")
                  .eq("name", tagName)
                  .maybeSingle();
                
                if (!tag) {
                  const { data: newTag } = await supabase
                    .from("tags")
                    .insert({
                      name: tagName,
                      slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                    })
                    .select()
                    .single();
                  tag = newTag;
                }
                
                if (tag) {
                  await supabase.from("article_tags").insert({
                    article_id: article.id,
                    tag_id: tag.id,
                  });
                }
              }
            }

            // Create URL mapping
            if (row.old_slug && article) {
              await supabase.from("url_mappings").insert({
                old_url: `/${row.old_slug}`,
                new_url: `/article/${row.slug}`,
                old_slug: row.old_slug,
                new_slug: row.slug,
                article_id: article.id,
                batch_id: batchId,
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

        // Break outer loop if cancelled
        if (cancelRequested) break;

        setProgress(Math.round(((i + batch.length) / rows.length) * 100));
        setSuccessCount(successful);
      }

      // Update log entry
      const finalStatus = cancelRequested 
        ? "cancelled" 
        : allErrors.length === 0 
          ? "completed" 
          : "completed_with_errors";
          
      await supabase
        .from("migration_logs")
        .update({
          status: finalStatus,
          successful_records: successful,
          failed_records: allErrors.length,
          error_details: allErrors.length > 0 ? JSON.parse(JSON.stringify(allErrors)) : null,
        })
        .eq("batch_id", batchId);

      setErrors(allErrors);

      if (cancelRequested) {
        toast({
          title: "Import Cancelled",
          description: `Import cancelled and rolled back. No articles were imported.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successful} of ${rows.length} articles.`,
        });
      }
      
      // Refresh the imports list
      await fetchRecentImports();

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
    const template = `title,slug,old_slug,content,excerpt,author,meta_title,meta_description,featured_image_url,featured_image_alt,published_at,article_type
"Sample Article Title","sample-article-slug","old-sample-slug","This is the article content. You can use multiple paragraphs.

Just press Enter to create new paragraphs within the quoted content field.

You can include links: https://example.com","Brief excerpt of the article for preview","Author Name","Meta Title for SEO","Meta description for SEO (max 160 characters)","https://example.com/image.jpg","Image alt text for accessibility","2024-01-15T10:30:00Z","article"
"How to Write Article Content","content-writing-guide","old-guide-slug","When writing content for the CSV:

1. Wrap the entire content in quotes
2. Use actual line breaks for paragraphs
3. Escape quotes by doubling them: ""quoted text""
4. Keep formatting simple - plain text works best

Special characters are fine as long as the file is UTF-8 encoded.","Guide to formatting article content for CSV import","Your Name","Content Writing Guide | AI in ASIA","Learn how to properly format article content for bulk CSV import into the migration system.","https://example.com/guide.jpg","Content writing guide illustration","2024-02-01T14:00:00Z","article"`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article-import-template.csv';
    a.click();
    
    // Also trigger download of detailed example
    const link = document.createElement('a');
    link.href = '/article-import-template-detailed.csv';
    link.download = 'article-import-template-detailed.csv';
    link.click();
    
    toast({
      title: "Templates Downloaded",
      description: "Check your downloads folder for both template files and MIGRATION_CSV_GUIDE.md",
    });
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
              <CardTitle>📋 CSV Template & Guide</CardTitle>
              <CardDescription>
                Download templates and comprehensive guide for preparing your article data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={downloadTemplate} variant="outline" className="mr-2">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Templates
              </Button>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>CSV Structure:</strong> title, slug, old_slug, content, excerpt, author, categories, tags, meta_title, meta_description, featured_image_url, featured_image_alt, published_at, article_type
                  <br /><br />
                  <strong>Tips:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Wrap fields containing commas in quotes</li>
                    <li>Escape quotes by doubling them: ""quoted text""</li>
                    <li>Use UTF-8 encoding for special characters</li>
                    <li>Date format: YYYY-MM-DDTHH:MM:SSZ</li>
                    <li>Test with 10-20 articles first!</li>
                  </ul>
                </AlertDescription>
              </Alert>
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
                {!importing ? (
                  <Button
                    onClick={handleImport}
                    disabled={!file || importing}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCancelRequested(true)}
                    variant="destructive"
                    disabled={cancelRequested}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {cancelRequested ? "Cancelling..." : "Cancel Import"}
                  </Button>
                )}
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

          {recentImports.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Imports</CardTitle>
                <CardDescription>
                  Manage and rollback recent bulk imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentImports.map((importLog) => (
                    <div
                      key={importLog.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            importLog.status === 'completed' ? 'bg-green-100 text-green-800' :
                            importLog.status === 'cancelled' ? 'bg-yellow-100 text-yellow-800' :
                            importLog.status === 'rolled_back' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {importLog.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(importLog.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{importLog.successful_records}</span> successful
                          {importLog.failed_records > 0 && (
                            <span className="text-destructive ml-2">
                              • {importLog.failed_records} failed
                            </span>
                          )}
                          <span className="text-muted-foreground ml-2">
                            of {importLog.total_records} total
                          </span>
                        </div>
                      </div>
                      {importLog.status !== 'rolled_back' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRollback(importLog.batch_id)}
                          disabled={rollingBack === importLog.batch_id}
                        >
                          {rollingBack === importLog.batch_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Rolling back...
                            </>
                          ) : (
                            <>
                              <Undo2 className="mr-2 h-4 w-4" />
                              Rollback
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}