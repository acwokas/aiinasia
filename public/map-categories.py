#!/usr/bin/env python3
"""
Category Mapper for AI in Asia WordPress Export
Maps old WordPress categories to new site structure
"""

import csv
import sys

# Category mapping rules
CATEGORY_MAP = {
    'News': 'News',
    'Life': 'Live',
    'Business': 'Business',
    'Opinion': 'Voices',
    'Tools': 'Create',
    'Prompts': 'Create',
    'AI Academy': 'Learn',
    'AI Glossary': 'Learn',
}

# Categories to ignore (and their subcategories)
IGNORED_CATEGORIES = ['Shop', 'Account']

def map_category(category):
    """Map a single category according to rules"""
    category = category.strip()
    
    # Check if it's an ignored category
    for ignored in IGNORED_CATEGORIES:
        if category.startswith(ignored):
            return None
    
    # Check if it matches a category to map
    for old_cat, new_cat in CATEGORY_MAP.items():
        if category == old_cat or category.startswith(f"{old_cat} >"):
            return new_cat
    
    # Return unchanged if no mapping found
    return category

def process_csv(input_file, output_file):
    """Process the CSV file and map categories"""
    total_rows = 0
    mapped_rows = 0
    ignored_rows = 0
    unchanged_rows = 0
    
    with open(input_file, 'r', encoding='utf-8-sig') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for row in reader:
            total_rows += 1
            
            # Get categories field
            categories_str = row.get('categories', '')
            categories = [c.strip() for c in categories_str.split(',')]
            
            # Map categories
            mapped_categories = [map_category(cat) for cat in categories]
            mapped_categories = [cat for cat in mapped_categories if cat is not None]
            
            # Skip rows with only ignored categories
            if not mapped_categories:
                ignored_rows += 1
                continue
            
            # Track mapping stats
            original_str = ','.join(categories)
            mapped_str = ','.join(mapped_categories)
            
            if original_str != mapped_str:
                mapped_rows += 1
            else:
                unchanged_rows += 1
            
            # Update row
            row['categories'] = mapped_str
            writer.writerow(row)
    
    print(f"\n✅ Processing Complete!")
    print(f"   Total articles: {total_rows}")
    print(f"   Categories mapped: {mapped_rows}")
    print(f"   Unchanged: {unchanged_rows}")
    print(f"   Ignored/Skipped: {ignored_rows}")
    print(f"\n📁 Output saved to: {output_file}\n")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 map-categories.py input.csv output.csv")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    print(f"\n🔄 Processing {input_file}...")
    process_csv(input_file, output_file)
