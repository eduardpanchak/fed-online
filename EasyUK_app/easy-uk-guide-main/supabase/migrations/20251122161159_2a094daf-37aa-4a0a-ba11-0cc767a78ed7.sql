-- Create saved_items table for user-specific saved items
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved items
CREATE POLICY "Users can view their own saved items"
ON public.saved_items
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own saved items
CREATE POLICY "Users can insert their own saved items"
ON public.saved_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved items
CREATE POLICY "Users can delete their own saved items"
ON public.saved_items
FOR DELETE
USING (auth.uid() = user_id);

-- Create checklist_progress table for user-specific checklist completion
CREATE TABLE public.checklist_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checklist_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, checklist_id)
);

-- Enable RLS
ALTER TABLE public.checklist_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own checklist progress
CREATE POLICY "Users can view their own checklist progress"
ON public.checklist_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own checklist progress
CREATE POLICY "Users can insert their own checklist progress"
ON public.checklist_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own checklist progress
CREATE POLICY "Users can update their own checklist progress"
ON public.checklist_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own checklist progress
CREATE POLICY "Users can delete their own checklist progress"
ON public.checklist_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on checklist_progress
CREATE TRIGGER update_checklist_progress_updated_at
BEFORE UPDATE ON public.checklist_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();