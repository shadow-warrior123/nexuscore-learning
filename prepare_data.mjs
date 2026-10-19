import fs from 'fs';
import path from 'path';

// Create src/data directory
fs.mkdirSync('src/data', { recursive: true });

// Load ML Journey questions
const journeyData = JSON.parse(fs.readFileSync('all_journey_questions.json', 'utf8'));

// Load NeetCode DSA questions
const dsaData = JSON.parse(fs.readFileSync('neetcode_dsa_questions.json', 'utf8'));

// Load NeetCode System Design
const sysdesData = JSON.parse(fs.readFileSync('neetcode_system_design.json', 'utf8'));

// Research papers mapping by topic/slug keyword
const researchPapers = [
  {
    topicMatch: ['attention', 'transformer', 'multi-head', 'self-attention'],
    title: "Attention Is All You Need",
    authors: "Vaswani et al. (Google Brain / Research, 2017)",
    year: 2017,
    arxiv: "https://arxiv.org/abs/1706.03762",
    pdf: "https://arxiv.org/pdf/1706.03762.pdf",
    mathFocus: "Scaled Dot-Product Attention: Attention(Q, K, V) = softmax((Q K^T) / sqrt(d_k)) * V",
    takeaway: "Eliminated recurrence and convolutions entirely, enabling massive parallelization for LLMs."
  },
  {
    topicMatch: ['adam', 'optimizer', 'momentum', 'rmsprop', 'learning-rate'],
    title: "Adam: A Method for Stochastic Optimization",
    authors: "Diederik P. Kingma, Jimmy Ba (2014)",
    year: 2014,
    arxiv: "https://arxiv.org/abs/1412.6980",
    pdf: "https://arxiv.org/pdf/1412.6980.pdf",
    mathFocus: "m_t = beta_1 * m_{t-1} + (1 - beta_1) * g_t,  v_t = beta_2 * v_{t-1} + (1 - beta_2) * g_t^2, bias-corrected: m_hat = m_t / (1 - beta_1^t)",
    takeaway: "Combines the benefits of AdaGrad and RMSProp with bias-corrected first and second moment estimates."
  },
  {
    topicMatch: ['resnet', 'residual', 'skip-connection', 'vanishing-gradient'],
    title: "Deep Residual Learning for Image Recognition",
    authors: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun (Microsoft Research, 2015)",
    year: 2015,
    arxiv: "https://arxiv.org/abs/1512.03385",
    pdf: "https://arxiv.org/pdf/1512.03385.pdf",
    mathFocus: "Residual Formulation: H(x) = F(x, {W_i}) + x, where F(x) is easier to push to 0 than learning identity from scratch.",
    takeaway: "Allowed training networks with over 100 to 1,000 layers without degradation or vanishing gradients."
  },
  {
    topicMatch: ['batch-norm', 'batchnorm', 'layer-norm', 'normalization'],
    title: "Batch Normalization: Accelerating Deep Network Training",
    authors: "Sergey Ioffe, Christian Szegedy (Google, 2015)",
    year: 2015,
    arxiv: "https://arxiv.org/abs/1502.03167",
    pdf: "https://arxiv.org/pdf/1502.03167.pdf",
    mathFocus: "x_hat = (x - mu_B) / sqrt(sigma_B^2 + epsilon),  y = gamma * x_hat + beta",
    takeaway: "Stabilizes internal covariate shift, enables higher learning rates, and acts as a regularizer."
  },
  {
    topicMatch: ['gan', 'generative', 'discriminator', 'generator'],
    title: "Generative Adversarial Nets",
    authors: "Ian Goodfellow, Jean Pouget-Abadie, Mehdi Mirza et al. (2014)",
    year: 2014,
    arxiv: "https://arxiv.org/abs/1406.2661",
    pdf: "https://arxiv.org/pdf/1406.2661.pdf",
    mathFocus: "Minimax Objective: min_G max_D V(D, G) = E[log D(x)] + E[log(1 - D(G(z)))]",
    takeaway: "Formulated unsupervised generative modeling as a two-player zero-sum game."
  },
  {
    topicMatch: ['reinforcement', 'q-learning', 'bellman', 'dqn', 'policy-gradient'],
    title: "Playing Atari with Deep Reinforcement Learning",
    authors: "Volodymyr Mnih et al. (DeepMind, 2013)",
    year: 2013,
    arxiv: "https://arxiv.org/abs/1312.5602",
    pdf: "https://arxiv.org/pdf/1312.5602.pdf",
    mathFocus: "Bellman Optimality: Q*(s, a) = E[r + gamma * max_{a'} Q*(s', a') | s, a]",
    takeaway: "First deep learning model to successfully learn control policies directly from high-dimensional sensory input using Q-learning and Experience Replay."
  },
  {
    topicMatch: ['xgboost', 'gradient-boost', 'ensemble', 'tree', 'random-forest'],
    title: "XGBoost: A Scalable Tree Boosting System",
    authors: "Tianqi Chen, Carlos Guestrin (University of Washington, 2016)",
    year: 2016,
    arxiv: "https://arxiv.org/abs/1603.02754",
    pdf: "https://arxiv.org/pdf/1603.02754.pdf",
    mathFocus: "Second-order Taylor expansion on loss: obj^(t) ~= sum [ g_i * f_t(x_i) + 0.5 * h_i * f_t^2(x_i) ] + Omega(f_t)",
    takeaway: "Introduced sparsity-aware split finding, cache-aware block structure, and column subsampling."
  },
  {
    topicMatch: ['embedding', 'word2vec', 'token', 'vocab', 'skip-gram'],
    title: "Distributed Representations of Words and Phrases (Word2Vec)",
    authors: "Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean (Google, 2013)",
    year: 2013,
    arxiv: "https://arxiv.org/abs/1310.4546",
    pdf: "https://arxiv.org/pdf/1310.4546.pdf",
    mathFocus: "Negative Sampling Objective: log sigma(v'_wO^T * v_wI) + sum_{i=1}^k E[log sigma(-v'_wi^T * v_wI)]",
    takeaway: "Showed continuous vector representations capture semantic word relationships via vector arithmetic (King - Man + Woman = Queen)."
  },
  {
    topicMatch: ['convolution', 'conv2d', 'pooling', 'cnn', 'kernel'],
    title: "Gradient-Based Learning Applied to Document Recognition (LeNet-5)",
    authors: "Yann LeCun, Leon Bottou, Yoshua Bengio, Patrick Haffner (1998)",
    year: 1998,
    arxiv: "https://ieeexplore.ieee.org/document/726791",
    pdf: "http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf",
    mathFocus: "Discrete 2D Cross-Correlation: (I * K)(i, j) = sum_m sum_n I(i + m, j + n) * K(m, n)",
    takeaway: "Established the foundations of convolutional neural networks with weight sharing and spatial subsampling."
  },
  {
    topicMatch: ['linear-regression', 'logistic', 'regression', 'loss', 'mse', 'gradient-descent'],
    title: "Learning Representations by Back-Propagating Errors",
    authors: "David E. Rumelhart, Geoffrey E. Hinton, Ronald J. Williams (Nature, 1986)",
    year: 1986,
    arxiv: "https://www.nature.com/articles/323533a0",
    pdf: "https://www.iro.umontreal.ca/~vincentp/ift3395/lectures/backprop_old.pdf",
    mathFocus: "Chain Rule of Calculus: dE/dw_ij = (dE/dy_j) * (dy_j/dx_j) * (dx_j/dw_ij)",
    takeaway: "Demonstrated that backpropagation can learn internal representations in hidden layers of neural networks."
  },
  {
    topicMatch: ['lora', 'fine-tune', 'peft', 'adaptation'],
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    authors: "Edward J. Hu et al. (Microsoft, 2021)",
    year: 2021,
    arxiv: "https://arxiv.org/abs/2106.09685",
    pdf: "https://arxiv.org/pdf/2106.09685.pdf",
    mathFocus: "W + Delta_W = W + (B * A) * (alpha / r), where B in R^{d x r}, A in R^{r x k}, and r << min(d, k)",
    takeaway: "Reduces trainable parameters by 10,000x and GPU memory requirement by 3x while matching full fine-tuning performance."
  },
  {
    topicMatch: ['pca', 'svd', 'dimension', 'eigen', 'covariance'],
    title: "On Lines and Planes of Closest Fit to Systems of Points in Space",
    authors: "Karl Pearson (Philosophical Magazine, 1901)",
    year: 1901,
    arxiv: "https://doi.org/10.1080/14786440109462720",
    pdf: "https://stat.ethz.ch/people/maechler/StatProg/Pearson-1901-PCA.pdf",
    mathFocus: "Eigen-decomposition of Covariance Matrix: Sigma = V * Lambda * V^T, projection y = V_k^T * (x - mu)",
    takeaway: "The foundation of linear dimensionality reduction: project data onto orthogonal axes maximizing variance."
  }
];

// Helper to attach relevant research paper to each question
function findPaperForQuestion(q, track, chapter) {
  const haystack = `${q.slug} ${q.title} ${track} ${chapter} ${q.tagline || ''}`.toLowerCase();
  for (const p of researchPapers) {
    if (p.topicMatch.some(m => haystack.includes(m))) {
      return p;
    }
  }
  return null;
}

// Enhance journey questions with research papers
for (const track of journeyData) {
  for (const ch of track.chapters) {
    for (const q of ch.questions) {
      const paper = findPaperForQuestion(q, track.trackTitle, ch.chapterTitle);
      if (paper) {
        q.researchPaper = paper;
      }
    }
  }
}

// Write bundled data to src/data/
fs.writeFileSync('src/data/journey.json', JSON.stringify(journeyData, null, 2), 'utf8');
fs.writeFileSync('src/data/dsa.json', JSON.stringify(dsaData, null, 2), 'utf8');
fs.writeFileSync('src/data/system_design.json', JSON.stringify(sysdesData, null, 2), 'utf8');
fs.writeFileSync('src/data/research_papers.json', JSON.stringify(researchPapers, null, 2), 'utf8');

console.log("src/data prepared successfully with Research Papers attached!");
