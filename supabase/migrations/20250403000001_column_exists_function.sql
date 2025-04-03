-- Create a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT COUNT(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2;
  RETURN exists;
END;
$$;
