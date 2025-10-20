import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Category mapping rules
const CATEGORY_MAP: Record<string, string> = {
  'News': 'News',
  'Life': 'Live',
  'Business': 'Business',
  'Opinion': 'Voices',
  'Tools': 'Create',
  'Prompts': 'Create',
  'AI Academy': 'Learn',
  'AI Glossary': 'Learn',
};

const IGNORED_CATEGORIES = ['Shop', 'Account'];

function mapCategory(category: string): string | null {
  const trimmed = category.trim();
  
  // Check if it's an ignored category
  for (const ignored of IGNORED_CATEGORIES) {
    if (trimmed === ignored || trimmed.startsWith(`${ignored} >`)) {
      return null;
    }
  }
  
  // Check if it matches a category to map
  for (const [oldCat, newCat] of Object.entries(CATEGORY_MAP)) {
    if (trimmed === oldCat || trimmed.startsWith(`${oldCat} >`)) {
      return newCat;
    }
  }
  
  // Return unchanged if no mapping found
  return trimmed;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"' && nextChar === '"' && inQuotes) {
      // Escaped quote
      currentField += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
      currentField += char;
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  fields.push(currentField);
  return fields;
}

function processCSV(csvContent: string): { csv: string; stats: any } {
  const lines = csvContent.split('\n');
  const header = lines[0];
  
  let totalRows = 0;
  let mappedRows = 0;
  let ignoredRows = 0;
  let unchangedRows = 0;
  
  const processedLines: string[] = [header];
  
  console.log('Starting CSV processing...');
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    totalRows++;
    
    if (totalRows % 100 === 0) {
      console.log(`Processed ${totalRows} rows...`);
    }
    
    const fields = parseCSVLine(line);
    
    if (fields.length < 7) {
      processedLines.push(line);
      unchangedRows++;
      continue;
    }
    
    // Categories is the 7th field (index 6)
    let categoriesField = fields[6];
    categoriesField = categoriesField.replace(/^"|"$/g, ''); // Remove surrounding quotes
    
    const categories = categoriesField.split(',').map(c => c.trim());
    
    const mappedCategories = categories
      .map(cat => mapCategory(cat))
      .filter(cat => cat !== null);
    
    // Skip rows with only ignored categories
    if (mappedCategories.length === 0) {
      ignoredRows++;
      continue;
    }
    
    const originalCategoriesStr = categories.join(',');
    const mappedCategoriesStr = mappedCategories.join(',');
    
    if (originalCategoriesStr !== mappedCategoriesStr) {
      mappedRows++;
    } else {
      unchangedRows++;
    }
    
    // Replace categories field
    fields[6] = `"${mappedCategoriesStr}"`;
    
    // Reconstruct line
    processedLines.push(fields.join(','));
  }
  
  console.log('CSV processing complete');
  console.log(`Total: ${totalRows}, Mapped: ${mappedRows}, Unchanged: ${unchangedRows}, Ignored: ${ignoredRows}`);
  
  return {
    csv: processedLines.join('\n'),
    stats: {
      total: totalRows,
      mapped: mappedRows,
      unchanged: unchangedRows,
      ignored: ignoredRows
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to map CSV categories');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    const csvContent = await file.text();
    const { csv, stats } = processCSV(csvContent);
    
    console.log('Sending processed CSV back to client');
    
    return new Response(
      JSON.stringify({ 
        csv,
        stats,
        filename: `mapped-${file.name}`
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
