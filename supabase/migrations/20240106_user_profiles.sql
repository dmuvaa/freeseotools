-- Create User Profiles table and sync triggers
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This trigger automatically creates a profile AND organization when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_name text;
begin
  -- Get name or default
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', 'User');

  -- 1. Create Profile
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, user_name, new.raw_user_meta_data->>'avatar_url');

  -- 2. Create Default Organization
  -- (Requires organizations table to exist)
  insert into public.organizations (name, owner_id, plan_tier)
  values (user_name || '''s Organization', new.id, 'free');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
