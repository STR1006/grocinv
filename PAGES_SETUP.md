# GitHub Pages Setup Instructions

## Manual Setup (Recommended)

1. Go to: https://github.com/STR1006/GrocInv/settings/pages
2. Under "Source", select "GitHub Actions"
3. Click "Save"

## Alternative: Using GitHub CLI (if installed)

If you have GitHub CLI installed, you can run:

```bash
gh api repos/STR1006/GrocInv/pages -X POST -f source[build_type]=workflow
```

## After enabling Pages:

- Your site will be available at: https://str1006.github.io/GrocInv/
- The workflow will run automatically on every push to master
- First deployment may take 5-10 minutes

## Troubleshooting:

- Make sure the repository is public or you have GitHub Pro/Teams
- Ensure the workflow has the correct permissions (already configured)
- Check the Actions tab for any build errors
