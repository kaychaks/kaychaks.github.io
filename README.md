# Blog

Hakyll-based static site generator.

## Local Development

### Prerequisites

- Nix + devenv (recommended)
- OR: GHC 8.10.7 + Cabal

### Setup

```bash
# Using devenv (recommended)
direnv allow

# OR manual cabal setup
cabal update
```

### Build & Run

```bash
# Build the site executable
cabal build

# Generate static site (outputs to ./site/)
cabal exec site build

# Copy static assets
cp static/* site

# For development - watch mode
cabal exec site watch
```

### Project Structure

```
public/          # Source content (posts, templates, css, images)
site/            # Generated output
static/          # Additional static files
site.hs          # Main Hakyll generator
```

## Deployment (GitHub Actions)

Automated via `.github/workflows/ci.yml`:

- **Trigger**: Push to `develop` branch
- **Action**: Builds site → deploys to `master` branch (GitHub Pages)


Site auto-deploys to GitHub Pages from `master` branch.
