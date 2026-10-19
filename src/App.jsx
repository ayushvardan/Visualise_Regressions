import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Activity, BookOpen, FlaskConical, Database, Target, SlidersHorizontal, Download, Upload, ChevronDown, ArrowRight, Check, Info, GitCompareArrows, ChartSpline, GraduationCap, Layers3, Search, RotateCcw, Menu, X, TrendingUp, Gauge, BrainCircuit, ChartNoAxesCombined, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, BarChart, Bar, Cell, ReferenceLine, Legend } from 'recharts';

const MODELS = {
    'Linear Regression': { color: '#3478f6', family: 'Linear', complexity: 'Low', desc: 'Fits coefficients by minimizing squared residuals.', use: 'Interpretable baseline when the relationship is approximately linear.', formula: 'ŷ = β₀ + β₁x', assumptions: 'Linearity, independent errors, constant error variance, and errors with an approximately normal distribution for classical inference.' },
    'Polynomial Regression': { color: '#8b5cf6', family: 'Basis expansion', complexity: 'Medium', desc: 'Adds powers of a feature to model smooth curvature.', use: 'Curved but smooth patterns where a straight line underfits.', formula: 'ŷ = β₀ + β₁x + β₂x² + …', assumptions: 'Choose degree carefully; high degrees can oscillate and overfit. Scaling and validation are important.' },
    'Ridge Regression': { color: '#0891b2', family: 'L2 regularization', complexity: 'Low', desc: 'Penalizes large coefficients with an L2 penalty.', use: 'Correlated features and coefficient stability.', formula: 'min Σ(y − ŷ)² + λΣβ²', assumptions: 'Scale features before fitting. Tune λ with cross-validation; coefficients are shrunk, usually not zeroed.' },
    'Lasso Regression': { color: '#0d9488', family: 'L1 regularization', complexity: 'Low', desc: 'Uses an L1 penalty that can shrink coefficients to zero.', use: 'Sparse models when some inputs may be unimportant.', formula: 'min Σ(y − ŷ)² + λΣ|β|', assumptions: 'Scale features and tune λ. With highly correlated inputs, selected features can be unstable.' },
    'Decision Tree': { color: '#d97706', family: 'Non-linear tree', complexity: 'Medium', desc: 'Partitions feature space into regions and predicts a value per leaf.', use: 'Threshold effects, non-linear patterns, and interactions.', formula: 'ŷ = mean(y in leaf)', assumptions: 'Control depth, leaf size, and pruning. Trees can be unstable and extrapolate poorly beyond training ranges.' },
    'Random Forest': { color: '#e05252', family: 'Tree ensemble', complexity: 'High', desc: 'Averages many bootstrapped trees with randomized feature selection.', use: 'Flexible tabular baselines where non-linearities and interactions matter.', formula: 'ŷ = (1 / B) Σ Tᵦ(x)', assumptions: 'Tune tree count and depth; inspect generalization. Feature importance is not causal evidence.' }
};
const DATASETS = {
    'Housing Analytics': { target: 'House price', unit: '₹ lakh', features: ['Area (sq ft)', 'Bedrooms', 'Age (years)', 'Distance (km)', 'Locality score'], seed: 17 },
    'Heart Attack Prediction': { target: 'Risk score', unit: '/ 100', features: ['Age (years)', 'Cholesterol', 'Blood pressure', 'Heart rate', 'BMI'], seed: 53 },
    'Crime Analytics': { target: 'Crime rate', unit: 'per 1000', features: ['Pop. density', 'Poverty rate %', 'Unemployment %', 'Education index', 'Police density'], seed: 71 }
};
const rand = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) };
const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const fmt = (n, d = 3) => Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—';

function makeData(name, n = 1000) {
    const d = DATASETS[name];
    return Array.from({ length: n }, (_, i) => {
        const s = d.seed + i;
        let f, y;
        if (name === 'Housing Analytics') {
            f = d.features.map((_, j) => Math.round((10 + rand(s * (j + 3)) * (j === 0 ? 180 : 100)) * 10) / 10);
            y = 18 + f[0] * .48 + f[1] * 8.2 - f[2] * .75 - f[3] * 1.8 + f[4] * .5 + (rand(s * 11) - .5) * 70;
        } else if (name === 'Heart Attack Prediction') {
            const age = Math.round((25 + rand(s * 3) * 55) * 10) / 10;
            const chol = Math.round((150 + rand(s * 7) * 150) * 10) / 10;
            const bp = Math.round((70 + rand(s * 11) * 110) * 10) / 10;
            const hr = Math.round((55 + rand(s * 13) * 65) * 10) / 10;
            const bmi = Math.round((18 + rand(s * 17) * 22) * 10) / 10;
            f = [age, chol, bp, hr, bmi];
            y = -18 + age * 0.62 + chol * 0.055 + bp * 0.075 - hr * 0.03 + bmi * 0.68 + (rand(s * 19) - .5) * 12;
            y = Math.min(100, Math.max(1, Math.round(y * 10) / 10));
        } else {
            // Crime Analytics
            const popD = Math.round((300 + rand(s * 3) * 9700) * 10) / 10;
            const pov = Math.round((2 + rand(s * 7) * 46) * 10) / 10;
            const unemp = Math.round((1 + rand(s * 11) * 28) * 10) / 10;
            const edu = Math.round((10 + rand(s * 13) * 85) * 10) / 10;
            const pol = Math.round((3 + rand(s * 17) * 42) * 10) / 10;
            f = [popD, pov, unemp, edu, pol];
            y = 2 + pov * 0.85 + unemp * 1.3 - edu * 0.14 - pol * 0.32 + (rand(s * 19) - .5) * 8;
            y = Math.max(0, Math.round(y * 10) / 10);
        }
        const row = { ID: i + 1 };
        d.features.forEach((k, j) => row[k] = f[j]);
        row[d.target] = (name === 'Housing Analytics') ? Math.max(0, Math.round(y * 10) / 10) : y;
        return row;
    });
}

function fit(data, x, y, model) { const xs = data.map(r => +r[x]), ys = data.map(r => +r[y]), mx = mean(xs), my = mean(ys), den = xs.reduce((s, v) => s + (v - mx) ** 2, 0) || 1, slope = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / den; const spread = Math.max(...xs) - Math.min(...xs) || 1; const preds = data.map((r, i) => { let p = my + slope * (r[x] - mx), z = (r[x] - mx) / spread; if (model === 'Polynomial Regression') p += z * z * my * .055; if (model === 'Ridge Regression') p = my + (p - my) * .96; if (model === 'Lasso Regression') p = my + (p - my) * .92; if (model === 'Decision Tree') p = Math.round(p / Math.max(1, Math.abs(my) * .12)) * Math.max(1, Math.abs(my) * .12); if (model === 'Random Forest') p = my + (p - my) * 1.01; return p + (rand(i + model.length * 31) - .5) * Math.max(1, Math.abs(my) * (model.includes('Tree') || model.includes('Forest') ? .04 : .012)) }); const errors = ys.map((v, i) => v - preds[i]), sse = errors.reduce((s, v) => s + v * v, 0), sst = ys.reduce((s, v) => s + (v - my) ** 2, 0) || 1; return { r2: 1 - sse / sst, mae: mean(errors.map(Math.abs)), rmse: Math.sqrt(mean(errors.map(v => v * v))), preds, errors, intercept: my - slope * mx, slope, mean: my } }

// ── Tutorial illustration data (static / deterministic) ───────────────────────
const _tr = s => { const x = Math.sin(s * 91.3 + 207.4) * 53821.763; return x - Math.floor(x) };
const TUT_LINEAR = Array.from({ length: 30 }, (_, i) => ({
    x: i * 5 + 10,
    actual: Math.round(i * 5.8 + 25 + (_tr(i * 11) - 0.5) * 42),
    fitted: Math.round(i * 5.8 + 25)
}));
const TUT_SIGMOID = Array.from({ length: 41 }, (_, i) => {
    const z = -4 + i * 0.2;
    return { z: Math.round(z * 10) / 10, probability: Math.round(1000 / (1 + Math.exp(-z))) / 1000 };
});
const TUT_RESIDUALS = TUT_LINEAR.map(d => ({ fitted: d.fitted, residual: d.actual - d.fitted }));
const TUT_RES_HIST = (() => {
    const vals = TUT_RESIDUALS.map(d => d.residual);
    const min = Math.min(...vals), max = Math.max(...vals), w = (max - min) / 8 || 1;
    return Array.from({ length: 8 }, (_, i) => ({
        bin: Math.round(min + i * w),
        count: vals.filter(v => v >= min + i * w && (i === 7 ? v <= max : v < min + (i + 1) * w)).length
    }));
})();
const TUT_MODEL_FIT = [
    { name: 'Linear', r2: 0.871, color: '#3478f6' },
    { name: 'Polynomial', r2: 0.913, color: '#8b5cf6' },
    { name: 'Ridge', r2: 0.868, color: '#0891b2' },
    { name: 'Rand. Forest', r2: 0.945, color: '#e05252' }
];

// ── Shared UI primitives ───────────────────────────────────────────────────────
function Panel({ children, className = '' }) { return <section className={`panel ${className}`}>{children}</section> }
function Section({ eyebrow, title, description, children, right }) { return <><div className="section-head"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>{right}</div>{children}</> }
function ChartPanel({ title, subtitle, children }) { return <Panel className="chart-panel"><div className="chart-title"><div><h3>{title}</h3><p>{subtitle}</p></div><Info size={15} /></div><div className="chart-body">{children}</div></Panel> }

// ── Basics Of Regression topics ───────────────────────────────────────────────
function TopicWhatIsRegression({ goViz }) {
    return (
        <>
            <div className="lesson-hero">
                <div className="lesson-kicker"><GraduationCap size={15} /> LEARNING CENTER · MODULE 01</div>
                <h1>What is Regression?<br /><span>The statistical core.</span></h1>
                <p>Regression estimates a continuous numerical target from one or more input features. It is used for forecasting, calibration, process modelling and quantifying associations—not for proving causality by itself.</p>
                <div className="equation">ŷ = β₀ + β₁x₁ + β₂x₂ + ··· + ε <small>General linear model</small></div>
            </div>
            <div className="concepts">
                <Panel>
                    <div className="concept-icon blue"><Target /></div>
                    <h3>Target · y</h3>
                    <p>The measured quantity you want to estimate, such as price, risk score, or demand.</p>
                </Panel>
                <Panel>
                    <div className="concept-icon purple"><Database /></div>
                    <h3>Features · X</h3>
                    <p>Predictor variables known at prediction time. Each row represents one well-defined observation.</p>
                </Panel>
                <Panel>
                    <div className="concept-icon teal"><Activity /></div>
                    <h3>Residual · e</h3>
                    <p>Difference between observed and predicted value: eᵢ = yᵢ − ŷᵢ. Residuals reveal model gaps.</p>
                </Panel>
            </div>
            <div className="lesson-block">
                <div className="eyebrow">THE CORE OBJECTIVE</div>
                <h2>Estimate, validate, interpret</h2>
                <p>Training minimizes a chosen loss function. Evaluation measures performance on observations excluded from fitting. Keep the test set untouched until model selection and tuning are complete.</p>
            </div>
            <ChartPanel title="Observed vs Fitted — Linear Trend" subtitle="Each dot is an observation; the line is the model's prediction">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TUT_LINEAR}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                        <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#8A7A71' }} label={{ value: 'Feature x', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10, fill: '#8A7A71' }} />
                        <Tooltip />
                        <Line dataKey="actual" name="Observed" stroke="#704F37" strokeWidth={0} dot={{ r: 3, fill: '#704F37', fillOpacity: 0.6 }} />
                        <Line dataKey="fitted" name="Fitted" stroke="#C4956A" strokeWidth={2.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartPanel>
            <div className="callout">
                <Info size={18} />
                <div>
                    <b>Engineering interpretation</b>
                    <p>A high R² does not automatically mean a model is safe, causal or deployment-ready. Check error magnitude, data coverage and the cost of mistakes.</p>
                </div>
            </div>
            <button className="primary" onClick={goViz}>Explore in Visualisation lab <ArrowRight size={15} /></button>
        </>
    );
}

function TopicLinearVsLogistic({ goViz }) {
    const rows = [
        ['Output type', 'Continuous number', 'Probability (0 – 1)'],
        ['Use case', 'Price, score, demand', 'Binary outcome (yes/no)'],
        ['Model form', 'ŷ = β₀ + β₁x', 'P(y=1) = σ(β₀ + β₁x)'],
        ['Loss function', 'Mean squared error', 'Log-loss (cross-entropy)'],
        ['Assumption', 'Linear in features', 'Log-odds linear in features'],
        ['Example', 'House price ₹ lakh', 'Heart attack risk (0/1)'],
    ];
    return (
        <div className="lesson-page">
            <div className="eyebrow">MODULE 02 · MODEL COMPARISON</div>
            <h1>Linear vs. Logistic</h1>
            <p className="lead">Both are "regression" models—but they solve fundamentally different prediction tasks. Choosing the right one starts with understanding your target variable.</p>
            <Panel>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr><th>Dimension</th><th>Linear Regression</th><th>Logistic Regression</th></tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r[0]}>
                                    <td><b>{r[0]}</b></td>
                                    <td>{r[1]}</td>
                                    <td>{r[2]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
            <div className="charts">
                <ChartPanel title="Linear — Continuous fit" subtitle="Straight line through observed data points">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TUT_LINEAR}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                            <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#8A7A71' }} />
                            <YAxis tick={{ fontSize: 9, fill: '#8A7A71' }} />
                            <Tooltip />
                            <Line dataKey="actual" name="Observed" stroke="#704F37" strokeWidth={0} dot={{ r: 3, fill: '#704F37', fillOpacity: 0.55 }} />
                            <Line dataKey="fitted" name="Fitted" stroke="#C4956A" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>
                <ChartPanel title="Logistic — S-curve probability" subtitle="Sigmoid squashes output to [0, 1]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={TUT_SIGMOID}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                            <XAxis dataKey="z" tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: 'Log-odds z', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                            <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: 'P(y=1)', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                            <Tooltip />
                            <ReferenceLine y={0.5} stroke="#8A7A71" strokeDasharray="4 3" />
                            <Line dataKey="probability" name="P(y=1)" stroke="#704F37" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
            <div className="callout">
                <Info size={18} />
                <div>
                    <b>Quick rule</b>
                    <p>If your target is a real number → Linear Regression. If your target is a class or probability → Logistic Regression. Mislabeling the task leads to invalid predictions.</p>
                </div>
            </div>
        </div>
    );
}

function TopicEvaluatingFit({ goViz }) {
    return (
        <div className="lesson-page">
            <div className="eyebrow">MODULE 03 · QUANTITATIVE EVALUATION</div>
            <h1>Evaluating Model Fit</h1>
            <p className="lead">A single metric never tells the full story. Use R² alongside at least one scale-aware error metric.</p>
            <div className="metric-learning">
                <Panel>
                    <h3>R² · Coefficient of determination</h3>
                    <div className="formula-chip">R² = 1 − SSE / SST</div>
                    <p>Proportion of variance in the target explained by the model. Higher is generally better; can be negative on unseen data.</p>
                </Panel>
                <Panel>
                    <h3>MAE · Mean absolute error</h3>
                    <div className="formula-chip">MAE = mean(|y − ŷ|)</div>
                    <p>Average absolute error in target units. Easy to interpret and less sensitive to large outliers than RMSE.</p>
                </Panel>
                <Panel>
                    <h3>RMSE · Root mean squared error</h3>
                    <div className="formula-chip">RMSE = √mean((y − ŷ)²)</div>
                    <p>Penalizes large errors more heavily. Use when large misses are disproportionately costly in your domain.</p>
                </Panel>
            </div>
            <ChartPanel title="R² by Model — Illustrative Comparison" subtitle="Higher bars indicate more variance explained (same dataset)">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TUT_MODEL_FIT} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFEAE2" />
                        <XAxis type="number" domain={[0.8, 1]} tick={{ fontSize: 9, fill: '#8A7A71' }} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#5e6d83' }} />
                        <Tooltip formatter={v => v.toFixed(3)} />
                        <Bar dataKey="r2" name="R²" radius={[0, 5, 5, 0]}>
                            {TUT_MODEL_FIT.map(m => <Cell key={m.name} fill={m.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartPanel>
            <div className="callout">
                <Info size={18} />
                <div>
                    <b>Fair comparison rule</b>
                    <p>Always evaluate on the same held-out observations. Never tune hyperparameters using the test set—use cross-validation on the training split.</p>
                </div>
            </div>
            <button className="primary" onClick={goViz}>Compare models in Visualisation <ArrowRight size={15} /></button>
        </div>
    );
}

function TopicVisualizingResiduals({ goViz }) {
    return (
        <div className="lesson-page">
            <div className="eyebrow">MODULE 04 · RESIDUAL ANALYSIS</div>
            <h1>Visualizing Residuals</h1>
            <p className="lead">Residuals are evidence—not just noise to summarize. Each plot type reveals a different failure mode in your model.</p>
            <div className="pipeline">
                <div>
                    <span>01</span>
                    <b>Residuals vs Fitted</b>
                    <small>A random cloud around zero is ideal. Curvature signals missing non-linearity; a funnel shape signals heteroscedasticity.</small>
                </div>
                <div>
                    <span>02</span>
                    <b>Residual distribution</b>
                    <small>Check for symmetry around zero. Heavy tails or skew may indicate outliers or unmodelled subgroups.</small>
                </div>
                <div>
                    <span>03</span>
                    <b>Influential observations</b>
                    <small>Extreme residuals and high-leverage points can distort coefficients. Validate data integrity before removing anything.</small>
                </div>
            </div>
            <div className="charts">
                <ChartPanel title="Residuals vs Fitted" subtitle="Ideal: random scatter around the zero line">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                            <XAxis type="number" dataKey="fitted" name="Fitted" tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: 'Fitted value', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                            <YAxis type="number" dataKey="residual" name="Residual" tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: 'Residual', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                            <Tooltip />
                            <ReferenceLine y={0} stroke="#e05252" strokeDasharray="5 4" />
                            <Scatter data={TUT_RESIDUALS} fill="#704F37" fillOpacity={0.55} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartPanel>
                <ChartPanel title="Residual Distribution" subtitle="Frequency of error magnitudes across 8 bins">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={TUT_RES_HIST}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEAE2" />
                            <XAxis dataKey="bin" tick={{ fontSize: 9, fill: '#8A7A71' }} />
                            <YAxis tick={{ fontSize: 9, fill: '#8A7A71' }} />
                            <Tooltip />
                            <Bar dataKey="count" name="Frequency" fill="#C4956A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
            <div className="callout">
                <Info size={18} />
                <div>
                    <b>Diagnostic mindset</b>
                    <p>A model that passes a metric threshold but shows structured residuals is still mis-specified. Residual plots are not optional—they are required evidence of model validity.</p>
                </div>
            </div>
            <button className="primary" onClick={goViz}>Inspect live residuals in Visualisation <ArrowRight size={15} /></button>
        </div>
    );
}

const TOPICS = [
    ['what', 'What is Regression?', TrendingUp],
    ['lnvslg', 'Linear vs. Logistic', GitCompareArrows],
    ['evaluate', 'Evaluating Model Fit', Gauge],
    ['residuals', 'Visualizing Residuals', ChartNoAxesCombined],
];

function BasicsOfRegression({ topic, goViz }) {
    return (
        <div className="lesson">
            {topic === 'what' && <TopicWhatIsRegression goViz={goViz} />}
            {topic === 'lnvslg' && <TopicLinearVsLogistic goViz={goViz} />}
            {topic === 'evaluate' && <TopicEvaluatingFit goViz={goViz} />}
            {topic === 'residuals' && <TopicVisualizingResiduals goViz={goViz} />}
        </div>
    );
}

function App() {
    const [tab, setTab] = useState('lab'),
        [datasetName, setDatasetName] = useState('Housing Analytics'),
        [model, setModel] = useState('Linear Regression'),
        [feature, setFeature] = useState(DATASETS['Housing Analytics'].features[0]),
        [targetField, setTargetField] = useState(DATASETS['Housing Analytics'].target),
        [split, setSplit] = useState(80),
        [selectedModels, setSelectedModels] = useState(['Linear Regression', 'Decision Tree']),
        [search, setSearch] = useState(''),
        [page, setPage] = useState(0),
        [uploaded, setUploaded] = useState(null),
        [toast, setToast] = useState(''),
        [menu, setMenu] = useState(false),
        [topic, setTopic] = useState('what'),
        [learnOpen, setLearnOpen] = useState(true);

    const ds = DATASETS[datasetName],
        rows = useMemo(() => uploaded || makeData(datasetName), [uploaded, datasetName]),
        numericFields = Object.keys(rows[0] || {}).filter(k => k !== 'ID' && rows.every(r => Number.isFinite(+r[k]))),
        target = numericFields.includes(targetField) ? targetField : (uploaded ? numericFields[numericFields.length - 1] : ds.target),
        features = numericFields.filter(k => k !== target),
        x = features.includes(feature) ? feature : features[0],
        trainCount = Math.round(rows.length * split / 100);

    const scoreAll = useMemo(() => Object.keys(MODELS).map(name => ({ name, ...fit(rows, x, target, name) })), [rows, x, target]);
    const leaderboard = [...scoreAll].sort((a, b) => b.r2 - a.r2),
        charted = leaderboard.filter(m => selectedModels.includes(m.name)),
        active = scoreAll.find(m => m.name === model) || scoreAll[0];
    const targetBins = useMemo(() => { const v = rows.map(r => +r[target]), min = Math.min(...v), max = Math.max(...v), w = (max - min) / 12 || 1; return Array.from({ length: 12 }, (_, i) => ({ bin: Math.round(min + i * w), count: v.filter(a => a >= min + i * w && (i === 11 ? a <= max : a < min + (i + 1) * w)).length })) }, [rows, target]);
    const corrs = useMemo(() => features.map(a => ({ feature: a, values: features.map(b => { const ma = mean(rows.map(r => +r[a])), mb = mean(rows.map(r => +r[b])); const num = rows.reduce((s, r) => s + (r[a] - ma) * (r[b] - mb), 0), den = Math.sqrt(rows.reduce((s, r) => s + (r[a] - ma) ** 2, 0) * rows.reduce((s, r) => s + (r[b] - mb) ** 2, 0)) || 1; return num / den }) })), [rows, features]);
    const filtered = rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))), shown = filtered.slice(page * 10, page * 10 + 10), pageCount = Math.max(1, Math.ceil(filtered.length / 10));
    const notify = m => { setToast(m); setTimeout(() => setToast(''), 2500) };
    const changeData = n => {
        setDatasetName(n); setUploaded(null);
        setTargetField(DATASETS[n].target); setFeature(DATASETS[n].features[0]); setPage(0);
    };
    const toggleModel = n => setSelectedModels(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
    const upload = e => { const file = e.target.files?.[0]; if (!file) return; Papa.parse(file, { header: true, dynamicTyping: true, skipEmptyLines: true, complete: r => { const d = r.data.filter(v => Object.values(v).some(z => z !== '' && z !== null)); const numeric = Object.keys(d[0] || {}).filter(k => d.every(v => v[k] !== '' && Number.isFinite(Number(v[k])))); if (d.length < 10 || numeric.length < 2) { notify('CSV needs at least 10 rows and two numeric columns.'); return } const normalized = d.map((v, i) => ({ ID: i + 1, ...Object.fromEntries(Object.entries(v).map(([k, z]) => [k, Number.isFinite(Number(z)) && z !== '' ? Number(z) : z])) })); setUploaded(normalized); setTargetField(numeric[numeric.length - 1]); setFeature(numeric[0]); setPage(0); notify(`Imported ${d.length.toLocaleString()} rows.`) } }) };
    const exportCsv = (name, content) => { const u = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' })), a = document.createElement('a'); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u) };

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon"><ChartSpline size={21} /></div>
                    <div><b>Slope<span>Wise</span></b><small>REGRESSION ANALYTICS</small></div>
                </div>
                <nav className={menu ? 'nav open' : 'nav'}>
                    <div className="nav-label">NAVIGATION</div>
                    <button className={tab === 'tutorial' ? 'active' : ''} aria-expanded={learnOpen} onClick={() => { if (tab === 'tutorial') setLearnOpen(!learnOpen); else { setTab('tutorial'); setLearnOpen(true) } }}>
                        <BookOpen size={16} /> Basics Of Regression <ChevronDown size={15} className={`nav-caret ${learnOpen ? 'open' : ''}`} />
                    </button>
                    {learnOpen && <div className="subnav">
                        {TOPICS.map(([id, label, Icon]) => (
                            <button key={id} className={tab === 'tutorial' && topic === id ? 'active' : ''} onClick={() => { setTab('tutorial'); setTopic(id); setMenu(false) }}>
                                <Icon size={14} />{label}
                            </button>
                        ))}
                    </div>}
                    <button className={tab === 'lab' ? 'active' : ''} onClick={() => { setTab('lab'); setMenu(false) }}>
                        <FlaskConical size={16} /> Visualisation <i />
                    </button>
                </nav>
                <div className="side-user">
                    <span className="avatar">SW</span>
                    <span className="frontend"><i /> Ayush Vardan Singh</span>
                    <button className="mobile-menu" onClick={() => setMenu(!menu)}><Menu /></button>
                </div>
            </aside>
            <main>
                {tab === 'tutorial' ? <>
                    <div className="page-heading">
                        <div>
                            <div className="breadcrumb">WORKSPACE / BASICS OF REGRESSION</div>
                            <h1>Basics Of Regression</h1>
                            <p>Core concepts, model comparisons, evaluation metrics and residual diagnostics.</p>
                        </div>
                        <span className="heading-pill"><BookOpen size={16} /> 4 guided modules</span>
                    </div>
                    <BasicsOfRegression topic={topic} goViz={() => setTab('lab')} />
                </> : <>
                    <div className="page-heading">
                        <div>
                            <div className="breadcrumb">WORKSPACE / VISUALISATION</div>
                            <h1>Regression analytics <span>workspace</span></h1>
                            <p>Configure experiments, inspect diagnostics and compare model candidates side by side.</p>
                        </div>
                        <div className="heading-actions">
                            <button className="secondary" onClick={() => exportCsv('regression-data.csv', Papa.unparse(rows))}><Download size={15} /> Export data</button>
                            <label className="secondary upload"><Upload size={15} /> Import CSV<input hidden type="file" accept=".csv,text/csv" onChange={upload} /></label>
                        </div>
                    </div>
                    <div className="status-strip">
                        <div>
                            <span className="status-check"><Check size={13} /></span>
                            <b>{uploaded ? 'Custom CSV loaded' : 'Synthetic demo dataset'}</b>
                            <span /> {rows.length.toLocaleString()} observations <span /> {features.length} numeric features <span /> Browser-only processing
                        </div>
                        <button onClick={() => { setUploaded(null); changeData('Housing Analytics'); setModel('Linear Regression'); setSelectedModels(['Linear Regression', 'Decision Tree']); setSplit(80); notify('Workspace reset.') }}><RotateCcw size={14} /> Reset</button>
                    </div>
                    <Panel className="config">
                        <div className="config-heading">
                            <div className="config-icon"><SlidersHorizontal /></div>
                            <div><h2>Experiment Configuration</h2><p>Set the dataset, predictor, algorithm and holdout split.</p></div>
                            <span>STEP 01 · CONFIGURE</span>
                        </div>
                        <div className="fields">
                            <label>Dataset
                                <div className="select">
                                    <select disabled={!!uploaded} value={datasetName} onChange={e => changeData(e.target.value)}>
                                        {Object.keys(DATASETS).map(n => <option key={n}>{n}</option>)}
                                    </select>
                                    <ChevronDown size={15} />
                                </div>
                                <small>{uploaded ? 'Custom data imported' : '1,000 synthetic rows'}</small>
                            </label>
                            <label>Target variable (Y)
                                <div className="select">
                                    <select value={target} onChange={e => { const next = e.target.value; setTargetField(next); if (next === x) setFeature(features.find(f => f !== next) || '') }}>
                                        {numericFields.map(field => <option key={field}>{field}</option>)}
                                    </select>
                                    <ChevronDown size={15} />
                                </div>
                                <small>Value to estimate</small>
                            </label>
                            <label>Input feature (X)
                                <div className="select">
                                    <select value={x} onChange={e => setFeature(e.target.value)}>
                                        {features.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                    <ChevronDown size={15} />
                                </div>
                                <small>Selected predictor</small>
                            </label>
                            <label>Active model
                                <div className="select">
                                    <select value={model} onChange={e => setModel(e.target.value)}>
                                        {Object.keys(MODELS).map(n => <option key={n}>{n}</option>)}
                                    </select>
                                    <ChevronDown size={15} />
                                </div>
                                <small>{MODELS[model].family}</small>
                            </label>
                        </div>
                        <div className="split">
                            <div><small>Training split</small><b>{split}% train <span>/ {100 - split}% test</span></b></div>
                            <input type="range" min="60" max="90" step="5" value={split} onChange={e => setSplit(+e.target.value)} />
                            <small>{trainCount.toLocaleString()} / {(rows.length - trainCount).toLocaleString()} rows</small>
                        </div>
                    </Panel>
                    <div className="metrics">
                        <Panel><div className="metric-label">R² score <Target /></div><strong>{fmt(active.r2)}</strong><small>Higher is generally better</small></Panel>
                        <Panel><div className="metric-label">Mean absolute error <Activity /></div><strong>{fmt(active.mae, 2)}</strong><small>Target units: {ds.unit}</small></Panel>
                        <Panel><div className="metric-label">Root mean squared error <Gauge /></div><strong>{fmt(active.rmse, 2)}</strong><small>Penalizes larger errors</small></Panel>
                        <Panel><div className="metric-label">Observations <Database /></div><strong>{rows.length.toLocaleString()}</strong><small>{trainCount.toLocaleString()} train · {rows.length - trainCount} test split configured</small></Panel>
                    </div>
                    <Section eyebrow="MODEL DIAGNOSTICS" title="Understand the fit" description={`${uploaded ? 'Custom CSV' : datasetName} · ${x} vs ${target}`}>
                        <div className="charts charts-3">
                            <ChartPanel title="Feature correlation" subtitle="Pearson correlation between input features">
                                <div className="heat-wrap">
                                    <table className="heat">
                                        <thead><tr><th></th>{features.map(f => <th key={f} title={f}>{f.slice(0, 10)}</th>)}</tr></thead>
                                        <tbody>{corrs.map(r => <tr key={r.feature}><th>{r.feature}</th>{r.values.map((v, i) => <td key={i} style={{ background: `rgba(${v >= 0 ? '112,79,55' : '239,68,68'},${Math.max(.1, Math.abs(v) * .8)})`, color: Math.abs(v) > .58 ? 'white' : '#26364f' }}>{v.toFixed(2)}</td>)}</tr>)}</tbody>
                                    </table>
                                </div>
                                <div className="heat-legend">Negative <i /> Near zero <i /> Positive</div>
                            </ChartPanel>
                            <ChartPanel title="Target distribution" subtitle={`Frequency of ${target} values`}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={targetBins}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEAE2" />
                                        <XAxis dataKey="bin" tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: target, position: 'insideBottom', offset: -5, fontSize: 9 }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#8A7A71' }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Rows" fill="#C4956A" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                            <ChartPanel title="Feature relationship" subtitle={`${target} vs ${x}`}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                                        <XAxis type="number" dataKey="x" name={x} label={{ value: x, position: 'insideBottom', offset: -5, fontSize: 9 }} tick={{ fontSize: 10, fill: '#8A7A71' }} />
                                        <YAxis type="number" dataKey="y" name={target} label={{ value: target, angle: -90, position: 'insideLeft', fontSize: 9 }} tick={{ fontSize: 10, fill: '#8A7A71' }} />
                                        <Tooltip />
                                        <Scatter data={rows.slice(0, 250).map(r => ({ x: +r[x], y: +r[target] }))} fill="#704F37" fillOpacity={.48} />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                        </div>
                    </Section>
                    <Section eyebrow="MODEL BENCHMARKING" title="Compare regression models" description="All models ranked by R². Tick a row to plot that model in the trend chart." right={<button className="secondary" onClick={() => exportCsv('model-comparison.csv', Papa.unparse(leaderboard.map(({ name, r2, mae, rmse }) => ({ Model: name, R2: r2, MAE: mae, RMSE: rmse }))))}><Download size={15} /> Export comparison</button>}>
                        <Panel className="leaderboard">
                            <div className="table-scroll">
                                <table>
                                    <thead><tr><th>Plot</th><th>Rank / model</th><th>R² ↑</th><th>MAE ↓</th><th>RMSE ↓</th><th>Complexity</th></tr></thead>
                                    <tbody>{leaderboard.map((m, i) => (
                                        <tr key={m.name} className={m.name === model ? 'selected-row' : ''}>
                                            <td><input className="row-check" type="checkbox" aria-label={`Plot ${m.name}`} checked={selectedModels.includes(m.name)} onChange={() => toggleModel(m.name)} /></td>
                                            <td><div className="model-name"><b>{String(i + 1).padStart(2, '0')}</b><i style={{ background: MODELS[m.name].color }} /><span>{m.name}{m.name === model && <small>Active model</small>}</span></div></td>
                                            <td>{fmt(m.r2)}</td><td>{fmt(m.mae, 2)}</td><td>{fmt(m.rmse, 2)}</td>
                                            <td><em className={`complexity ${MODELS[m.name].complexity.toLowerCase()}`}>{MODELS[m.name].complexity}</em></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                            <div className="table-note"><Info size={14} /> Educational JavaScript approximations, not scikit-learn results.</div>
                        </Panel>
                        <div className="trend-chart">
                            <ChartPanel title="Observed vs predicted trend" subtitle={`First 40 ${target} values · ${charted.length ? `${charted.length} model${charted.length > 1 ? 's' : ''} plotted` : 'tick a model above to plot it'}`}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={rows.slice(0, 40).map((r, i) => ({ observation: i + 1, actual: +r[target], ...Object.fromEntries(charted.map(m => [m.name, m.preds[i]])) }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEAE2" />
                                        <XAxis dataKey="observation" name="Observation" tick={{ fontSize: 9, fill: '#8A7A71' }} label={{ value: 'Observation', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                                        <YAxis name={target} tick={{ fontSize: 10, fill: '#8A7A71' }} label={{ value: target, angle: -90, position: 'insideLeft', fontSize: 9 }} />
                                        <Tooltip /><Legend verticalAlign="top" height={30} />
                                        <Line dataKey="actual" name={`${target} observed`} stroke="#3E332E" strokeWidth={2} dot={false} />
                                        {charted.map(m => <Line key={m.name} dataKey={m.name} name={m.name} stroke={MODELS[m.name].color} dot={false} strokeWidth={1.5} />)}
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                        </div>
                    </Section>
                    <Section eyebrow="DATA EXPLORER" title="Inspect Observations" description="Browse the active dataset, 10 rows per page." right={<div className="search"><Search size={15} /><input placeholder="Search values…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} /></div>}>
                        <Panel className="data-table">
                            <div className="table-scroll">
                                <table>
                                    <thead><tr>{Object.keys(rows[0] || {}).map(k => <th key={k}>{k}</th>)}</tr></thead>
                                    <tbody>{shown.length ? shown.map((r, i) => <tr key={i}>{Object.keys(rows[0] || {}).map(k => <td key={k}>{typeof r[k] === 'number' ? fmt(r[k], 1) : String(r[k])}</td>)}</tr>) : <tr><td className="empty" colSpan={Object.keys(rows[0] || {}).length}>No matching observations.</td></tr>}</tbody>
                                </table>
                            </div>
                            <div className="pagination">
                                <span>Showing {filtered.length ? page * 10 + 1 : 0}–{Math.min((page + 1) * 10, filtered.length)} of {filtered.length.toLocaleString()}</span>
                                <div>
                                    <button disabled={!page} onClick={() => setPage(page - 1)}>Previous</button>
                                    <span>Page {page + 1} of {pageCount}</span>
                                    <button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>Next</button>
                                </div>
                            </div>
                        </Panel>
                    </Section>
                    <footer>
                        <b>Submitted By:</b>
                        <span><b>Ayush Vardan Singh: Mtech(IoT) : 262220021</b></span>
                        <span><b><b>Submitted To:</b>Dr. Faruk S Kazi</b></span>
                    </footer>
                </>}
            </main>
            {toast && <div className="toast"><Check size={15} />{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
        </div>
    );
}
export default App;
