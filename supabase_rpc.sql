-- Function to decrement credits safely
create or replace function decrement_credits(user_id uuid)
returns void as $$
begin
  update public.profiles
  set credits = credits - 1
  where id = user_id and credits > 0;
end;
$$ language plpgsql security definer;
