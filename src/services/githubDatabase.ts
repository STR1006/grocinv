// GitHub-based online database service
export interface Product {
  id: string;
  databaseId: string;
  name: string;
  quantity: number;
  isCompleted: boolean;
  isOutOfStock: boolean; // Fixed: changed from false to boolean
  imageUrl?: string;
  imageFit?: "cover" | "contain" | "fill" | "scale-down";
  comment?: string;
  category?: string;
  completedAt?: Date;
}

export interface OnlineDatabase {
  products: Record<string, Product>;
  lastUpdated: string;
  version: number;
}

class GitHubDatabaseService {
  private readonly GITHUB_OWNER = 'STR1006';
  private readonly GITHUB_REPO = 'grocinv';
  private readonly DATABASE_FILE = 'database/products.json';
  private readonly GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  
  private cache: OnlineDatabase | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getGlobalProductDatabase(): Promise<Record<string, Product>> {
    try {
      // Use cache if recent
      if (this.cache && (Date.now() - this.lastFetch) < this.CACHE_DURATION) {
        return this.cache.products;
      }

      const response = await fetch(
        `https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/contents/${this.DATABASE_FILE}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(this.GITHUB_TOKEN && { 'Authorization': `token ${this.GITHUB_TOKEN}` })
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // File doesn't exist, create it
          await this.createInitialDatabase();
          return {};
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = atob(data.content);
      const database: OnlineDatabase = JSON.parse(content);
      
      this.cache = database;
      this.lastFetch = Date.now();
      
      return database.products;
    } catch (error) {
      console.error('Error fetching global product database:', error);
      // Fallback to empty database
      return {};
    }
  }

  async saveToGlobalProductDatabase(product: Product): Promise<boolean> {
    try {
      const currentDatabase = await this.getGlobalProductDatabase();
      const updatedDatabase: OnlineDatabase = {
        products: {
          ...currentDatabase,
          [product.databaseId]: product
        },
        lastUpdated: new Date().toISOString(),
        version: (this.cache?.version || 0) + 1
      };

      const success = await this.updateDatabaseFile(updatedDatabase);
      if (success) {
        this.cache = updatedDatabase;
        this.lastFetch = Date.now();
      }
      return success;
    } catch (error) {
      console.error('Error saving to global product database:', error);
      return false;
    }
  }

  async getProductFromDatabase(databaseId: string): Promise<Product | null> {
    const database = await this.getGlobalProductDatabase();
    return database[databaseId] || null;
  }

  private async createInitialDatabase(): Promise<void> {
    const initialDatabase: OnlineDatabase = {
      products: {},
      lastUpdated: new Date().toISOString(),
      version: 1
    };

    await this.updateDatabaseFile(initialDatabase);
  }

  private async updateDatabaseFile(database: OnlineDatabase): Promise<boolean> {
    if (!this.GITHUB_TOKEN) {
      console.warn('GitHub token not provided. Database updates require authentication.');
      return false;
    }

    try {
      // First, get the current SHA of the file
      let sha: string | undefined;
      try {
        const currentResponse = await fetch(
          `https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/contents/${this.DATABASE_FILE}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${this.GITHUB_TOKEN}`
            }
          }
        );
        
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          sha = currentData.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      const content = JSON.stringify(database, null, 2);
      const encodedContent = btoa(content);

      const updateData = {
        message: `Update global product database - ${database.products ? Object.keys(database.products).length : 0} products`,
        content: encodedContent,
        ...(sha && { sha })
      };

      const response = await fetch(
        `https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/contents/${this.DATABASE_FILE}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Error updating database file:', error);
      return false;
    }
  }

  // Batch operations for efficiency
  async saveMultipleProducts(products: Product[]): Promise<boolean> {
    try {
      const currentDatabase = await this.getGlobalProductDatabase();
      const updatedProducts = { ...currentDatabase };
      
      products.forEach(product => {
        updatedProducts[product.databaseId] = product;
      });

      const updatedDatabase: OnlineDatabase = {
        products: updatedProducts,
        lastUpdated: new Date().toISOString(),
        version: (this.cache?.version || 0) + 1
      };

      const success = await this.updateDatabaseFile(updatedDatabase);
      if (success) {
        this.cache = updatedDatabase;
        this.lastFetch = Date.now();
      }
      return success;
    } catch (error) {
      console.error('Error saving multiple products:', error);
      return false;
    }
  }

  // Clear local cache to force fresh fetch
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}

// Export singleton instance
export const githubDatabase = new GitHubDatabaseService();

// Utility functions that match the current localStorage API
export const getGlobalProductDatabase = () => githubDatabase.getGlobalProductDatabase();
export const saveToGlobalProductDatabase = (product: Product) => githubDatabase.saveToGlobalProductDatabase(product);
export const getProductFromDatabase = (databaseId: string) => githubDatabase.getProductFromDatabase(databaseId);
