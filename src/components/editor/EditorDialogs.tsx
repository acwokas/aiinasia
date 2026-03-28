import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: string, extra?: string) => void;
}

export function ImageDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Image</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Image URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>
          <div><Label>Alt Text</Label><Input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Description" /></div>
        </div>
        <DialogFooter><Button onClick={() => { onSubmit(url, alt); setUrl(''); setAlt(''); }}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LinkDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [url, setUrl] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Link</DialogTitle></DialogHeader>
        <div><Label>URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>
        <DialogFooter><Button onClick={() => { onSubmit(url); setUrl(''); }}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TableDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Table</DialogTitle></DialogHeader>
        <div className="flex gap-3">
          <div><Label>Rows</Label><Input type="number" value={rows} onChange={e => setRows(e.target.value)} /></div>
          <div><Label>Columns</Label><Input type="number" value={cols} onChange={e => setCols(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={() => { onSubmit(rows, cols); }}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function YouTubeDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [url, setUrl] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Embed YouTube Video</DialogTitle></DialogHeader>
        <div><Label>YouTube URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
        <DialogFooter><Button onClick={() => { onSubmit(url); setUrl(''); }}>Embed</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PromptDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [prompt, setPrompt] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insert Prompt Box</DialogTitle></DialogHeader>
        <div><Label>Prompt Text</Label><Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Try this prompt..." /></div>
        <DialogFooter><Button onClick={() => { onSubmit(prompt); setPrompt(''); }}>Insert</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SocialEmbedDialog({ open, onOpenChange, onSubmit }: DialogProps) {
  const [url, setUrl] = useState('');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Embed Social Post</DialogTitle></DialogHeader>
        <div><Label>Post URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://twitter.com/..." /></div>
        <DialogFooter><Button onClick={() => { onSubmit(url); setUrl(''); }}>Embed</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
