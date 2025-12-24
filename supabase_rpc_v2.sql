-- Function to decrement credits with a variable amount
create or replace function decrement_credits(user_id uuid, amount int default 1)
returns void as $$
begin
  update public.profiles
  set credits = credits - amount
  where id = user_id and credits >= amount;
end;
$$ language plpgsql security definer;
