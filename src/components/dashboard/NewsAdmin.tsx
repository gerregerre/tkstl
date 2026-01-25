import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Newspaper, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { PasswordModal } from './PasswordModal';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date_label: string;
  type: 'update' | 'announcement' | 'result' | 'feature';
  is_active: boolean;
  created_at: string;
}

const NEWS_TYPES = [
  { value: 'announcement', label: 'Announcement', color: 'bg-primary' },
  { value: 'update', label: 'Update', color: 'bg-blue-500' },
  { value: 'result', label: 'Result', color: 'bg-green-500' },
  { value: 'feature', label: 'Feature', color: 'bg-purple-500' },
];

export function NewsAdmin() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_label: '',
    type: 'update' as NewsItem['type'],
    is_active: true,
  });

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNewsItems();
    }
  }, [isAuthenticated]);

  const fetchNewsItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching news',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setNewsItems(data as NewsItem[]);
    }
    setLoading(false);
  };

  const handlePasswordSuccess = () => {
    setIsAuthenticated(true);
    setShowPasswordModal(false);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      date_label: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      type: 'update',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date_label: item.date_label,
      type: item.type,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    if (editingItem) {
      // Update existing
      const { error } = await supabase
        .from('news_items')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          date_label: formData.date_label.trim(),
          type: formData.type,
          is_active: formData.is_active,
        })
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: 'Error updating news',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'News Updated',
          description: 'The news item has been updated successfully.',
        });
        fetchNewsItems();
        setIsDialogOpen(false);
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('news_items')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          date_label: formData.date_label.trim(),
          type: formData.type,
          is_active: formData.is_active,
        });

      if (error) {
        toast({
          title: 'Error creating news',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'News Created',
          description: 'The news item has been created successfully.',
        });
        fetchNewsItems();
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('news_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting news',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'News Deleted',
        description: 'The news item has been deleted.',
      });
      fetchNewsItems();
    }
    setDeleteConfirmId(null);
  };

  const toggleActive = async (item: NewsItem) => {
    const { error } = await supabase
      .from('news_items')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);

    if (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      fetchNewsItems();
    }
  };

  const getTypeBadge = (type: string) => {
    const typeInfo = NEWS_TYPES.find(t => t.value === type);
    return (
      <Badge className={`${typeInfo?.color || 'bg-muted'} text-white text-xs`}>
        {typeInfo?.label || type}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onAuthenticated={handlePasswordSuccess}
        title="News Admin Access"
        description="Enter the manager password to access the news admin panel."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <Newspaper className="h-7 w-7 text-primary" />
            News Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage club news and announcements
          </p>
        </div>
        <Button onClick={openCreateDialog} variant="atp" className="gap-2">
          <Plus className="h-4 w-4" />
          Add News
        </Button>
      </div>

      {/* News Items List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : newsItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              No news items yet. Create your first announcement!
            </p>
            <Button onClick={openCreateDialog} variant="atp" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add News
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {newsItems.map(item => (
            <Card 
              key={item.id} 
              className={`transition-all ${!item.is_active ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(item.type)}
                      <span className="text-xs text-muted-foreground">{item.date_label}</span>
                      {!item.is_active && (
                        <Badge variant="outline" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(item)}
                      title={item.is_active ? 'Hide' : 'Show'}
                    >
                      {item.is_active ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit News Item' : 'Create News Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="THE COMPETITION IS LIVE!"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter the news description..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.description.length}/500
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NewsItem['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {NEWS_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_label">Date Label</Label>
                <Input
                  id="date_label"
                  value={formData.date_label}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_label: e.target.value }))}
                  placeholder="Jan 2025"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="cursor-pointer">
                Visible in carousel
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="atp" onClick={handleSave}>
              {editingItem ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete News Item?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This action cannot be undone. The news item will be permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
