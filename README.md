# NexusCore | Advanced Engineering, DSA & AI/ML Learning Platform

[![GitHub Pages](https://img.shields.io/badge/Deployment-Live%20on%20GitHub%20Pages-success?style=for-the-badge&logo=github)](https://shadow-warrior123.github.io/nexuscore-learning/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_IDE-VS_Code_Engine-007ACC?style=for-the-badge&logo=visual-studio-code)](https://microsoft.github.io/monaco-editor/)
[![Pyodide](https://img.shields.io/badge/Python_Sandbox-WebAssembly_WASM-FFD43B?style=for-the-badge&logo=python)](https://pyodide.org/)

**NexusCore** is an interactive, browser-based technical learning and engineering mastery platform. It unifies four foundational computer science and engineering disciplines into a cohesive visual skill-tree with in-browser sandboxed code execution, landmark research papers, and multi-language pedagogical solutions.

---

## 🌟 Core Pillars & Curriculum

### 1. Data Structures & Algorithms (1,126 Curated Problems)
* Comprehensive coverage of **19 Core Algorithmic Patterns**:
  - Arrays & Hashing, Two Pointers, Sliding Window, Monotonic Stack
  - Binary Search, Linked Lists, Trees & BSTs, Tries, Heaps & Priority Queues
  - Backtracking, Graphs & Topological Sort, Advanced Graphs (Dijkstra, Bellman-Ford, Kruskal)
  - 1-D & 2-D Dynamic Programming, Greedy, Intervals, Bit Manipulation, Math & Geometry
* **Curated Subsets**:
  - 🚀 **Core 150**: Essential patterns for technical interviews
  - 🧠 **Foundation 75**: High-yield problem set
  - 🦄 **Comprehensive 250**: Advanced edge cases and multi-structure problems
  - 🌐 **All Problems**: Complete library of 1,126 algorithmic challenges

### 2. Large-Scale System Design & Distributed Architecture
* **High-Level Design (HLD)**:
  - Distributed Key-Value Stores, Rate Limiters, Message Queues
  - Real-world architectures: YouTube, Twitter/X, Discord, Google Drive, Google Maps, TinyURL
* **Low-Level Design (LLD)**:
  - Object-Oriented Modeling: Elevator Systems, Parking Lots, Chess, Blackjack, Bank Transactions
* **Design Patterns & Architecture**:
  - Creational (Factory, Singleton, Builder), Structural (Adapter, Decorator, Facade), Behavioral (Strategy, Observer, State)
  - Consistent Hashing, CAP Theorem, Database Sharding, Caching Strategies (Redis, CDNs)

### 3. Machine Learning & Deep Learning (with ArXiv Research Integration)
* **Mathematical Foundations & Core ML**:
  - Linear/Multivariate Regression, Logistic Regression, Cross-Entropy Loss, Gradient Descent & Backpropagation
  - Regularization (L1 Lasso, L2 Ridge), Ensembles (Random Forests, Gradient Boosting, XGBoost), Dimensionality Reduction (PCA, t-SNE)
* **Deep Learning & Tensors**:
  - PyTorch & TensorFlow tensor manipulation, autograd differentiation, custom neural modules (`nn.Module`)
  - Computer Vision (CNNs, ResNets), Sequence Models (RNNs, LSTMs), Attention Mechanisms & Transformers
* **In-App ArXiv Research Paper Reader**:
  - Embedded PDF viewer with mathematical formulas and architectural takeaways:
    - *Attention Is All You Need* (Vaswani et al., 2017)
    - *Adam: A Method for Stochastic Optimization* (Kingma & Ba, 2014)
    - *Deep Residual Learning for Image Recognition* (He et al., 2015)
    - *Generative Adversarial Nets* (Goodfellow et al., 2014)
    - *Batch Normalization* (Ioffe & Szegedy, 2015)
    - *LoRA: Low-Rank Adaptation of Large Language Models* (Hu et al., 2021)

### 4. Data Engineering & Scaled Analytics
* **NumPy Vectorization**: Broadcasting rules, axis aggregations, in-place memory manipulations, linear algebra kernels
* **Pandas Data Wrangling**: Series statistics, time series indexing, rolling windows, joins, pivot/melt transformations
* **SQL Analytics**: Advanced window functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`/`LEAD`), CTE chains, subqueries
* **PySpark & Big Data**: Distributed DataFrame operations, lazy execution plans, partition schemas, data pipelines

---

## 💻 Interactive Features

### 1. In-Browser VS Code Monaco Editor
- Full code intelligence powered by **`@monaco-editor/react`**
- Multi-language support: **Python 3, JavaScript (ES2024), C++, Java, and SQL**
- Built-in font zoom controls, minimap overview, bracket pair colorization, and auto-formatting
- Per-language draft persistence saved in local storage

### 2. Client-Side WebAssembly Execution
- **Python 3.13 via Pyodide WASM**: Executes Python code on the client's CPU with zero latency and zero server execution cost
- **JavaScript Engine**: Sandboxed execution with real-time console capture
- **Zero-Login Required**: Solved problems, stars, and code drafts persist across sessions

### 3. Pedagogical 3-Tier Multi-Approach Solutions
Every challenge features a structured breakdown:
- **Inspiration & Mental Model**: The Core Dilemma vs. The Mental Shift / Invariant
- **Approach 1: Brute Force (Naive Baseline)** with asymptotic complexity analysis
- **Approach 2: Better Approach (Intermediate)** with branch pruning and sorting
- **Approach 3: Optimal (Industry Gold Standard)** with in-place pointer/hash strategies
- **Step-by-Step Algorithm**: Numbered execution flow
- **Dry Run Trace Table**: Variable state tracking across each iteration
- **Common Pitfalls & Edge Cases**: Integer overflow, empty sets, duplicate handling

### 4. Interactive Prerequisite Skill-Tree
- Dependency DAG visualization connecting foundational patterns to advanced concepts
- Category completion progress bars and mastery percentage indicators

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & Design** | Tailwind CSS, Lucide Icons, Glassmorphism UI |
| **Animations** | Framer Motion |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Syntax Highlighting** | PrismJS (Python, C++, Java, SQL, JS) |
| **Math Formulation** | KaTeX |
| **In-Browser Sandbox** | Pyodide (Python WebAssembly), V8 Sandbox (JS) |
| **Local Backend & Storage** | Node.js, Express, native SQLite (`node:sqlite`) in WAL mode |
| **Deployment** | GitHub Pages (Automated CI/CD via GitHub Actions) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shadow-warrior123/nexuscore-learning.git
   cd nexuscore-learning
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Start Full-Stack Backend (Optional for SQLite persistence & PDF streaming proxy)**:
   ```bash
   npm run server
   ```
   Runs the Node.js SQLite server on [http://localhost:3001/](http://localhost:3001/).

---

## 🌐 Live Deployment

The platform is available 24/7 globally at:

👉 **[https://shadow-warrior123.github.io/nexuscore-learning/](https://shadow-warrior123.github.io/nexuscore-learning/)**

---

## 📄 License

This project is licensed under the MIT License.
