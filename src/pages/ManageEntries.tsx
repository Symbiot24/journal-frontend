import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import EntryCard from '@/components/EntryCard';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const ManageEntries = () => {
  const { entries, fetchEntries, token } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const startEdit = (id: string) => {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    setEditingId(id);
    setTitle(e.title ?? '');
    setContent(e.content ?? '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/journal/${encodeURIComponent(editingId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) throw new Error('Failed to update');
      toast({ title: 'Entry updated' });
      await fetchEntries();
      setEditingId(null);
    } catch (e) {
      toast({ title: 'Failed to update entry', variant: 'destructive' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this entry? This action cannot be undone.');
    if (!confirmed) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/journal/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: 'Entry deleted' });
      await fetchEntries();
    } catch (e) {
      toast({ title: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Manage Journal Entries</h1>
        </div>

        {sorted.length === 0 ? (
          <Card className="bg-gradient-card shadow-card border-0 p-8 text-center">
            <CardHeader>
              <CardTitle className="text-card-foreground">No entries found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Create your first entry from the Journal page.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sorted.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onEdit={startEdit} onDelete={onDelete} />
            ))}
          </div>
        )}

        <Dialog open={Boolean(editingId)} onOpenChange={(open) => (!open ? cancelEdit() : null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[160px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ManageEntries;


