# SlopeWise — Regression Analytics

Professional React + Vite frontend for learning regression and exploring an interactive model comparison lab. No backend or database is required.

## Two main tabs
- **Tutorial:** six detailed modules covering fundamentals, six model families, engineering workflow, metrics, residual diagnostics, assumptions and pitfalls.
- **Practical Lab:** configurable data/model experiment with selectable numeric X and Y variables, six diagnostic visualizations, correlation heatmap, explicit multi-select model comparison, ranked metrics table, searchable data explorer, CSV import/export and a what-if estimate.

## Model comparison
Use the comparison set controls to select two models, any custom combination, **Select all**, **Clear**, or **Reset pair** (Linear Regression + Decision Tree). The leaderboard and comparison charts update based on the selected set. Charts include per-model R² and error metrics plus named model prediction curves against observed values.

## Run locally
Requires Node.js 18+ (Node 20 LTS recommended).
```bash
npm install
npm run dev
```
For a production build:
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
The project uses relative asset paths (`base: './'`) and is suitable for static hosting. Enable GitHub Pages via GitHub Actions and deploy the `dist/` folder.

## Important modelling note
The included deterministic synthetic datasets have 1,000 rows each. The model implementations are lightweight JavaScript approximations for UI exploration and are **not production implementations** of scikit-learn algorithms. The UI explicitly labels this limitation. For rigorous evaluation, use a validated ML library, a reproducible train/validation/test strategy or cross-validation, and a fixed holdout set.
