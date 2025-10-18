import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, User, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Comment {
  id: string;
  content: string;
  author_name: string | null;
  created_at: string;
  approved: boolean;
}

interface CommentsProps {
  articleId: string;
}

const Comments = ({ articleId }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert([
        {
          article_id: articleId,
          author_name: authorName,
          author_email: authorEmail,
          content: content,
          approved: false, // Requires moderation
        },
      ]);

      if (error) throw error;

      toast({
        title: "Comment submitted",
        description: "Your comment is awaiting moderation and will appear shortly.",
      });

      setAuthorName("");
      setAuthorEmail("");
      setContent("");
    } catch (error) {
      toast({
        title: "Failed to submit comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-12 pt-8 border-t border-border">
      <CollapsibleTrigger className="flex items-center justify-between w-full group mb-8">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="headline text-3xl">Comments ({comments.length})</h2>
        </div>
        <ChevronDown className={`h-6 w-6 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent>
        {/* Comment Form */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">Leave a Comment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <Input
                id="name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your email will not be published
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment *
            </label>
            <Textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Share your thoughts..."
              className="min-h-[120px]"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Post Comment"}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {comment.author_name || "Anonymous"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default Comments;
