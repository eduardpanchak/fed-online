-- Create lists table for user-created lists
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);




-- Create list_items table
CREATE TABLE public.list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lists
CREATE POLICY "Users can view their own lists"
ON public.lists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
ON public.lists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
ON public.lists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
ON public.lists
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for list_items
CREATE POLICY "Users can view items of their lists"
ON public.list_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.id = list_items.list_id
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create items in their lists"
ON public.list_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.id = list_items.list_id
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items in their lists"
ON public.list_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.id = list_items.list_id
    AND lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items from their lists"
ON public.list_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE lists.id = list_items.list_id
    AND lists.user_id = auth.uid()
  )
);

create policy "Allow authenticated users read own subscriptions"
on subscriptions
for select
to authenticated
using (user_id = auth.uid());

create policy "Allow authenticated users insert own subscriptions"
on subscriptions
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Allow authenticated users update own subscriptions"
on subscriptions
for update
to authenticated
using (user_id = auth.uid());

create policy "Allow authenticated users delete own subscriptions"
on subscriptions
for delete
to authenticated
using (user_id = auth.uid());

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()  
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on list_items
CREATE TRIGGER update_list_items_updated_at
BEFORE UPDATE ON public.list_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on lists
CREATE TRIGGER update_lists_updated_at
BEFORE UPDATE ON public.lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

(create (auth.uid() = user_id))
-- .select();

(auth.uid() = user_id OR true)
-- .select();