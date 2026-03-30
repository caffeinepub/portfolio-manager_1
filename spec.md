# Portfolio Manager

## Current State
New project. Only scaffolded empty Motoko actor and default frontend exist.

## Requested Changes (Diff)

### Add
- Full portfolio management dashboard with sidebar navigation
- Holdings management: add, edit, delete assets (stocks, crypto, ETFs, cash)
- Dashboard with KPI cards: total portfolio value, cash balance, net worth
- Portfolio performance line/area chart with time-range controls (1D, 1W, 1M, 6M, 1Y, ALL)
- Asset allocation donut chart by category (Stocks, Crypto, ETFs, Cash)
- Holdings table with asset name, ticker, quantity, avg cost, current price, total value, gain/loss, allocation %
- Multiple pages: Dashboard, Investments (holdings list), Analysis, Goals, Markets
- Sample/seed data for realistic demo experience
- Authorization for per-user portfolio data

### Modify
- Replace default frontend with fintech dashboard UI

### Remove
- Default placeholder content

## Implementation Plan
1. Set up authorization component for user-based data isolation
2. Generate Motoko backend with:
   - Asset/holding CRUD (id, name, ticker, category, quantity, avgCost, currentPrice)
   - Portfolio snapshot queries (total value, allocation by category)
   - Goals management (name, target amount, current amount, deadline)
   - Sample data seeding
3. Build React frontend:
   - Sidebar nav with icons (Dashboard, Investments, Analysis, Goals, Markets, Settings)
   - Dashboard page: KPI cards, performance chart (recharts), allocation donut chart, mini holdings table
   - Investments page: full holdings table with add/edit/delete modals, search, pagination
   - Goals page: goal cards with progress bars
   - Analysis page: detailed charts and breakdowns
   - Markets page: placeholder market data view
