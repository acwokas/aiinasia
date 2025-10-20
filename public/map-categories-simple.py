#!/usr/bin/env python3
"""
Simple Category Mapper for AI in Asia WordPress Export
Run this locally: python3 map-categories-simple.py your-file.csv output.csv
"""

import csv
import sys

# Category mapping
MAP = {
    'Life': 'Live',
    'Opinion': 'Voices',
    'Tools': 'Create',
    'Prompts': 'Create',
    'AI Academy': 'Learn',
    'AI Glossary': 'Learn',
}

IGNORE = ['Shop', 'Account']

def map_cat(cat):
    cat = cat.strip()
    for ig in IGNORE:
        if cat.startswith(ig):
            return None
    for old, new in MAP.items():
        if cat == old or cat.startswith(f"{old} >"):
            return new
    return cat

input_file = sys.argv[1]
output_file = sys.argv[2]

total = mapped = ignored = unchanged = 0

with open(input_file, 'r', encoding='utf-8-sig') as f_in, \
     open(output_file, 'w', encoding='utf-8', newline='') as f_out:
    
    reader = csv.DictReader(f_in)
    writer = csv.DictWriter(f_out, fieldnames=reader.fieldnames)
    writer.writeheader()
    
    for row in reader:
        total += 1
        if total % 100 == 0:
            print(f"Processing article {total}...")
        
        cats = [c.strip() for c in row.get('categories', '').split(',')]
        mapped_cats = [map_cat(c) for c in cats]
        mapped_cats = [c for c in mapped_cats if c]
        
        if not mapped_cats:
            ignored += 1
            continue
        
        if ','.join(cats) != ','.join(mapped_cats):
            mapped += 1
        else:
            unchanged += 1
        
        row['categories'] = ','.join(mapped_cats)
        writer.writerow(row)

print(f"\n✅ Done!")
print(f"   Total: {total}")
print(f"   Mapped: {mapped}")
print(f"   Unchanged: {unchanged}")
print(f"   Ignored: {ignored}")
print(f"\n📁 Saved to: {output_file}\n")
