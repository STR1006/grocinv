
# Online Database Setup (Supabase)

The GrocInv app now supports an **online global product database** using Supabase as the backend. This allows users to share product information across different devices and with other users.

## How It Works

- **Local Storage**: Individual user lists remain stored locally in the browser (optional, for offline mode)
- **Global Database**: Product definitions (name, image, category, etc.) and lists are stored online in your Supabase project
- **Share Codes**: When sharing lists, only essential data (quantities, completion status) are included in QR codes, while product details are looked up from the online database
- **Efficiency**: This dramatically reduces QR code size and ensures consistency across users

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in
2. Create a new project
3. Get your **Project URL** and **anon public key** from the Project Settings > API section

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Create Tables in Supabase

You need at least two tables: `products` and `lists`.

**Example SQL for products:**
```sql
create table products (
  id uuid primary key default uuid_generate_v4(),
  database_id text unique not null,
  name text not null,
  quantity integer default 0,
  is_completed boolean default false,
  is_out_of_stock boolean default false,
  image_url text,
  image_fit text,
  comment text,
  category text
);
```

**Example SQL for lists:**
```sql
create table lists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  last_viewed_at timestamp with time zone,
  source text
);
```

You may also want a join table for list-products relationships.

### 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5. Deploy and Test

1. Build and deploy your app:
   ```bash
   npm run build
   npm run deploy
   ```

2. Test the database functionality:
   - Add a new product to any list
   - Share the list via QR code
   - Import the QR code on another device/browser
   - The product details should be automatically retrieved from the online database

## Database Table Structure

The online database is stored in your Supabase tables. Example product row:

```json
{
  "id": "uuid",
  "database_id": "abc123",
  "name": "Product Name",
  "quantity": 0,
  "is_completed": false,
  "is_out_of_stock": false,
  "image_url": "https://example.com/image.jpg",
  "image_fit": "cover",
  "comment": "Optional comment",
  "category": "Optional category"
}
```

## Features

- ✅ Online product database using Supabase
- ✅ Automatic product sync when adding/editing products
- ✅ Optimized share codes using database lookups
- ✅ Offline fallback (works without internet, syncs when online)
- ✅ Database search modal with real-time search
- ✅ Efficient batch operations
- ✅ Error handling and loading states

## Security Considerations

- **Supabase Key**: Keep your anon/public key secure and never commit service role keys to version control
- **Row Level Security**: Enable and configure RLS as needed for your app

## Troubleshooting

- Check your internet connection
- Verify your Supabase credentials are correct
- Check your table permissions and RLS policies

## Migration from Local Database

The app can be updated to sync existing products from localStorage to Supabase when:
1. You add your Supabase credentials and restart the app
2. You create new products
3. You edit existing products
4. You share lists (triggers a sync)

Your existing local lists remain unchanged and continue to work offline if desired.

3. Optionally customize the repository settings:
   ```bash
   REACT_APP_GITHUB_OWNER=STR1006
   REACT_APP_GITHUB_REPO=grocinv
   ```

### 3. Deploy and Test

1. Build and deploy your app:
   ```bash
   npm run build
   npm run deploy
   ```

2. Test the database functionality:
   - Add a new product to any list
   - Share the list via QR code
   - Import the QR code on another device/browser
   - The product details should be automatically retrieved from the online database

## Database File Structure

The online database is stored as `database/products.json` in your GitHub repository with the following structure:

```json
{
  "products": {
    "abc123": {
      "id": "unique-local-id",
      "databaseId": "abc123",
      "name": "Product Name",
      "quantity": 0,
      "isCompleted": false,
      "isOutOfStock": false,
      "imageUrl": "https://example.com/image.jpg",
      "imageFit": "cover",
      "comment": "Optional comment",
      "category": "Optional category"
    }
  },
  "lastUpdated": "2025-08-06T12:00:00.000Z",
  "version": 1
}
```

## Features

### ✅ Implemented
- ✅ Online product database using GitHub API
- ✅ Automatic product sync when adding/editing products
- ✅ Optimized share codes using database lookups
- ✅ Offline fallback (works without internet, syncs when online)
- ✅ Database search modal with real-time search
- ✅ Efficient batch operations
- ✅ Error handling and loading states

### 🔄 How Sharing Works Now

1. **Creating a Share Code**:
   - App checks if each product exists in the online database
   - For existing products: Only stores database ID + current quantities/status
   - For new products: Includes full product data + saves to online database
   - Results in 60-80% smaller QR codes for established product catalogs

2. **Importing a Share Code**:
   - App reads the database IDs from the share code
   - Looks up full product details from the online database
   - Only uses embedded data for products not found online
   - Automatically saves new products to the online database

## Security Considerations

- **GitHub Token**: Keep your personal access token secure and never commit it to version control
- **Repository Access**: The database is stored in your repository, so access is controlled by your GitHub repository permissions
- **Rate Limits**: GitHub API has rate limits (5000 requests/hour for authenticated users)

## Troubleshooting

### "Failed to load products from online database"
- Check your internet connection
- Verify your GitHub token is correct and has proper permissions
- Check if you've exceeded GitHub API rate limits

### "Database updates require authentication"
- Make sure `REACT_APP_GITHUB_TOKEN` is set in your `.env` file
- Verify the token has `repo` permissions

### QR codes still too large
- The system needs time to build up the global product database
- As more products are shared and added to the database, QR codes will become smaller
- Force a fresh database sync by clearing browser data and re-importing products

## Migration from Local Database

The app automatically migrates existing products from localStorage to the online database when:
1. You add the GitHub token and restart the app
2. You create new products
3. You edit existing products
4. You share lists (triggers a sync)

Your existing local lists remain unchanged and continue to work offline.
