/**
 * Pyodide In-Browser Execution & Structural Verification Engine
 * Runs Python 3.13 in WebAssembly with NumPy, Pandas, SQLite3,
 * plus built-in NumPy-backed shims for PyTorch, TensorFlow, and PySpark.
 */

let pyodideInstance = null;
let initPromise = null;

const PYTHON_SHIMS_AND_HARNESS = `
import sys, types, math, json
import numpy as np

def _nexus_install_shims():
    # =========================================================================
    # 1. PYTORCH SHIM (torch, torch.nn, torch.nn.functional, torch.optim)
    # =========================================================================
    if 'torch' not in sys.modules:
        torch = types.ModuleType('torch')
        torch.float32 = np.float32
        torch.float64 = np.float64
        torch.int64 = np.int64
        torch.int32 = np.int32
        torch.bool = np.bool_
        _grad_enabled = [True]

        class no_grad:
            def __enter__(self):
                self.prev = _grad_enabled[0]
                _grad_enabled[0] = False
            def __exit__(self, *args):
                _grad_enabled[0] = self.prev

        torch.no_grad = no_grad

        class Tensor:
            def __init__(self, data, dtype=None, requires_grad=False, _op=None, _parents=()):
                if isinstance(data, Tensor):
                    arr = data._data.copy()
                    if dtype is not None:
                        arr = arr.astype(dtype)
                elif isinstance(data, np.ndarray):
                    arr = data.astype(dtype) if dtype is not None else data.copy()
                else:
                    arr = np.array(data, dtype=dtype if dtype is not None else np.float32 if isinstance(data, float) or (isinstance(data, (list, tuple)) and any(isinstance(x, float) for x in (data if not (data and isinstance(data[0], (list, tuple))) else data[0]))) else None)
                if arr.dtype == np.float64 and dtype is None:
                    arr = arr.astype(np.float32)
                self._data = arr
                self.requires_grad = bool(requires_grad) and _grad_enabled[0]
                self.grad = None
                self._op = _op if _grad_enabled[0] else None
                self._parents = _parents if _grad_enabled[0] else ()
                self._backward_fn = lambda: None

            @property
            def shape(self):
                return tuple(self._data.shape)

            @property
            def ndim(self):
                return self._data.ndim

            @property
            def dtype(self):
                return self._data.dtype

            @property
            def T(self):
                out = Tensor(self._data.T, requires_grad=self.requires_grad, _op='T', _parents=(self,))
                def _bw():
                    if self.requires_grad and out.grad is not None:
                        g = out.grad._data.T
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def tolist(self):
                if self._data.dtype == np.float32:
                    return np.round(self._data.astype(np.float64), 6).tolist()
                return self._data.tolist()

            def item(self):
                val = self._data.item()
                return round(float(val), 6) if isinstance(val, (float, np.floating)) else val

            def numpy(self):
                return self._data

            def clone(self):
                return Tensor(self._data.copy(), dtype=self.dtype, requires_grad=self.requires_grad)

            def detach(self):
                return Tensor(self._data.copy(), dtype=self.dtype, requires_grad=False)

            def float(self):
                return self.to(np.float32)

            def long(self):
                return self.to(np.int64)

            def to(self, dtype):
                out = Tensor(self._data.astype(dtype), dtype=dtype, requires_grad=self.requires_grad, _op='to', _parents=(self,))
                return out

            def reshape(self, *shape):
                if len(shape) == 1 and isinstance(shape[0], (list, tuple)):
                    shape = tuple(shape[0])
                out = Tensor(self._data.reshape(shape), dtype=self.dtype, requires_grad=self.requires_grad, _op='reshape', _parents=(self,))
                def _bw():
                    if self.requires_grad and out.grad is not None:
                        g = out.grad._data.reshape(self._data.shape)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def view(self, *shape):
                return self.reshape(*shape)

            def transpose(self, dim0, dim1):
                axes = list(range(self.ndim))
                axes[dim0], axes[dim1] = axes[dim1], axes[dim0]
                out = Tensor(np.transpose(self._data, axes), dtype=self.dtype, requires_grad=self.requires_grad, _op='transpose', _parents=(self,))
                return out

            def squeeze(self, dim=None):
                return Tensor(np.squeeze(self._data, axis=dim), dtype=self.dtype, requires_grad=self.requires_grad)

            def unsqueeze(self, dim):
                return Tensor(np.expand_dims(self._data, axis=dim), dtype=self.dtype, requires_grad=self.requires_grad)

            def __getitem__(self, idx):
                return Tensor(self._data[idx], dtype=self.dtype, requires_grad=self.requires_grad)

            def __len__(self):
                return len(self._data)

            def _ensure_tensor(self, other):
                return other if isinstance(other, Tensor) else Tensor(other, dtype=self.dtype)

            def __add__(self, other):
                o = self._ensure_tensor(other)
                req = (self.requires_grad or o.requires_grad) and _grad_enabled[0]
                out = Tensor(self._data + o._data, dtype=np.result_type(self._data, o._data), requires_grad=req, _op='add', _parents=(self, o))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data
                        while g.ndim > self._data.ndim: g = g.sum(axis=0)
                        for ax, (s_d, g_d) in enumerate(zip(self._data.shape, g.shape)):
                            if s_d == 1 and g_d > 1: g = g.sum(axis=ax, keepdims=True)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                    if o.requires_grad:
                        g = out.grad._data
                        while g.ndim > o._data.ndim: g = g.sum(axis=0)
                        for ax, (s_d, g_d) in enumerate(zip(o._data.shape, g.shape)):
                            if s_d == 1 and g_d > 1: g = g.sum(axis=ax, keepdims=True)
                        o.grad = Tensor(g) if o.grad is None else Tensor(o.grad._data + g)
                out._backward_fn = _bw
                return out

            def __radd__(self, other):
                return self.__add__(other)

            def __sub__(self, other):
                o = self._ensure_tensor(other)
                return self + (o * -1.0)

            def __rsub__(self, other):
                o = self._ensure_tensor(other)
                return o - self

            def __neg__(self):
                return self * -1.0

            def __mul__(self, other):
                o = self._ensure_tensor(other)
                req = (self.requires_grad or o.requires_grad) and _grad_enabled[0]
                out = Tensor(self._data * o._data, dtype=np.result_type(self._data, o._data), requires_grad=req, _op='mul', _parents=(self, o))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data * o._data
                        while g.ndim > self._data.ndim: g = g.sum(axis=0)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                    if o.requires_grad:
                        g = out.grad._data * self._data
                        while g.ndim > o._data.ndim: g = g.sum(axis=0)
                        o.grad = Tensor(g) if o.grad is None else Tensor(o.grad._data + g)
                out._backward_fn = _bw
                return out

            def __rmul__(self, other):
                return self.__mul__(other)

            def __truediv__(self, other):
                o = self._ensure_tensor(other)
                req = (self.requires_grad or o.requires_grad) and _grad_enabled[0]
                out = Tensor(self._data / o._data, dtype=np.float32, requires_grad=req, _op='div', _parents=(self, o))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data / o._data
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                    if o.requires_grad:
                        g = -out.grad._data * self._data / (o._data ** 2)
                        o.grad = Tensor(g) if o.grad is None else Tensor(o.grad._data + g)
                out._backward_fn = _bw
                return out

            def __pow__(self, power):
                req = self.requires_grad and _grad_enabled[0]
                out = Tensor(self._data ** power, dtype=np.float32, requires_grad=req, _op='pow', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data * (power * (self._data ** (power - 1)))
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def __matmul__(self, other):
                o = self._ensure_tensor(other)
                req = (self.requires_grad or o.requires_grad) and _grad_enabled[0]
                out = Tensor(np.matmul(self._data, o._data), dtype=np.float32, requires_grad=req, _op='matmul', _parents=(self, o))
                def _bw():
                    if out.grad is None: return
                    g = out.grad._data
                    if self.requires_grad:
                        if self._data.ndim == 1 and o._data.ndim == 1:
                            gs = g * o._data
                        elif o._data.ndim == 1:
                            gs = np.outer(g, o._data) if g.ndim == 1 else g[..., None] * o._data
                        else:
                            gs = np.matmul(g, np.swapaxes(o._data, -1, -2))
                        self.grad = Tensor(gs) if self.grad is None else Tensor(self.grad._data + gs)
                    if o.requires_grad:
                        if self._data.ndim == 1 and o._data.ndim == 1:
                            go = g * self._data
                        elif self._data.ndim == 1:
                            go = np.outer(self._data, g)
                        else:
                            go = np.matmul(np.swapaxes(self._data, -1, -2), g)
                        o.grad = Tensor(go) if o.grad is None else Tensor(o.grad._data + go)
                out._backward_fn = _bw
                return out

            def sum(self, dim=None, keepdim=False):
                req = self.requires_grad and _grad_enabled[0]
                out = Tensor(self._data.sum(axis=dim, keepdims=keepdim), dtype=np.float32, requires_grad=req, _op='sum', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data
                        if dim is not None and not keepdim:
                            g = np.expand_dims(g, axis=dim)
                        g = np.broadcast_to(g, self._data.shape).copy()
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def mean(self, dim=None, keepdim=False):
                req = self.requires_grad and _grad_enabled[0]
                out = Tensor(self._data.mean(axis=dim, keepdims=keepdim), dtype=np.float32, requires_grad=req, _op='mean', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data
                        cnt = self._data.size if dim is None else self._data.shape[dim]
                        if dim is not None and not keepdim:
                            g = np.expand_dims(g, axis=dim)
                        g = np.broadcast_to(g / cnt, self._data.shape).copy()
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def relu(self):
                req = self.requires_grad and _grad_enabled[0]
                out = Tensor(np.maximum(0, self._data), dtype=np.float32, requires_grad=req, _op='relu', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data * (self._data > 0).astype(np.float32)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def sigmoid(self):
                req = self.requires_grad and _grad_enabled[0]
                s = 1.0 / (1.0 + np.exp(-np.clip(self._data, -500, 500)))
                out = Tensor(s, dtype=np.float32, requires_grad=req, _op='sigmoid', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data * s * (1.0 - s)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def tanh(self):
                req = self.requires_grad and _grad_enabled[0]
                t = np.tanh(self._data)
                out = Tensor(t, dtype=np.float32, requires_grad=req, _op='tanh', _parents=(self,))
                def _bw():
                    if out.grad is None: return
                    if self.requires_grad:
                        g = out.grad._data * (1.0 - t ** 2)
                        self.grad = Tensor(g) if self.grad is None else Tensor(self.grad._data + g)
                out._backward_fn = _bw
                return out

            def argmax(self, dim=None):
                return Tensor(np.argmax(self._data, axis=dim), dtype=np.int64)

            def backward(self, grad=None):
                topo = []
                visited = set()
                def build(v):
                    if id(v) not in visited:
                        visited.add(id(v))
                        for p in v._parents:
                            build(p)
                        topo.append(v)
                build(self)
                if grad is None:
                    self.grad = Tensor(np.ones_like(self._data, dtype=np.float32))
                else:
                    self.grad = grad if isinstance(grad, Tensor) else Tensor(grad, dtype=np.float32)
                for v in reversed(topo):
                    v._backward_fn()

        def _torch_softmax(x, dim=-1):
            arr = x._data if isinstance(x, Tensor) else np.array(x, dtype=np.float32)
            shifted = arr - np.max(arr, axis=dim, keepdims=True)
            exps = np.exp(shifted)
            probs = exps / np.sum(exps, axis=dim, keepdims=True)
            return Tensor(probs, dtype=np.float32, requires_grad=getattr(x, 'requires_grad', False))

        def _torch_stack(tensors, dim=0):
            arrs = [t._data if isinstance(t, Tensor) else np.array(t) for t in tensors]
            return Tensor(np.stack(arrs, axis=dim))

        def _torch_cat(tensors, dim=0):
            arrs = [t._data if isinstance(t, Tensor) else np.array(t) for t in tensors]
            return Tensor(np.concatenate(arrs, axis=dim))

        class Generator:
            def __init__(self, device='cpu'):
                self.rng = np.random.RandomState(0)
            def manual_seed(self, s):
                self.rng = np.random.RandomState(int(s))
                return self

        Tensor.softmax = lambda self, dim=-1: _torch_softmax(self, dim=dim)

        torch.Tensor = Tensor
        torch.Generator = Generator
        torch.tensor = lambda data, dtype=None, requires_grad=False: Tensor(data, dtype=dtype, requires_grad=requires_grad)
        torch.zeros = lambda *shape, dtype=np.float32, requires_grad=False: Tensor(np.zeros(shape[0] if len(shape)==1 and isinstance(shape[0], (list, tuple)) else shape, dtype=dtype), dtype=dtype, requires_grad=requires_grad)
        torch.ones = lambda *shape, dtype=np.float32, requires_grad=False: Tensor(np.ones(shape[0] if len(shape)==1 and isinstance(shape[0], (list, tuple)) else shape, dtype=dtype), dtype=dtype, requires_grad=requires_grad)
        torch.arange = lambda *args, dtype=None, requires_grad=False: Tensor(np.arange(*args, dtype=dtype), dtype=dtype, requires_grad=requires_grad)
        torch.from_numpy = lambda arr: Tensor(arr.copy(), dtype=arr.dtype)
        torch.matmul = lambda a, b: a @ b
        torch.relu = lambda x: x.relu()
        torch.sigmoid = lambda x: x.sigmoid()
        torch.tanh = lambda x: x.tanh()
        torch.softmax = _torch_softmax
        torch.stack = _torch_stack
        torch.cat = _torch_cat
        torch.exp = lambda x: Tensor(np.exp(x._data), requires_grad=x.requires_grad)
        torch.log = lambda x: Tensor(np.log(x._data), requires_grad=x.requires_grad)
        torch.manual_seed = lambda s: np.random.seed(s)

        # torch.nn, torch.nn.functional, torch.optim
        torch_nn = types.ModuleType('torch.nn')
        torch_nn.__path__ = []
        torch_F = types.ModuleType('torch.nn.functional')
        torch_optim = types.ModuleType('torch.optim')

        class Parameter(Tensor):
            def __init__(self, data, requires_grad=True):
                super().__init__(data, dtype=np.float32, requires_grad=requires_grad)

        class Module:
            def __init__(self):
                self._modules = {}
                self._parameters = {}
                self.training = True

            def __setattr__(self, name, value):
                if isinstance(value, Parameter):
                    if '_parameters' not in self.__dict__:
                        self.__dict__['_parameters'] = {}
                    self.__dict__['_parameters'][name] = value
                elif isinstance(value, Module):
                    if '_modules' not in self.__dict__:
                        self.__dict__['_modules'] = {}
                    self.__dict__['_modules'][name] = value
                super().__setattr__(name, value)

            def parameters(self):
                params = list(getattr(self, '_parameters', {}).values())
                for m in getattr(self, '_modules', {}).values():
                    params.extend(m.parameters())
                return params

            def train(self, mode=True):
                self.training = bool(mode)
                for m in getattr(self, '_modules', {}).values():
                    m.train(mode)
                return self

            def eval(self):
                return self.train(False)

            def zero_grad(self):
                for p in self.parameters():
                    p.grad = None

            def __call__(self, *args, **kwargs):
                return self.forward(*args, **kwargs)

        class Linear(Module):
            def __init__(self, in_features, out_features, bias=True):
                super().__init__()
                self.in_features = in_features
                self.out_features = out_features
                self.weight = Parameter(np.zeros((out_features, in_features), dtype=np.float32))
                self.bias = Parameter(np.zeros((out_features,), dtype=np.float32)) if bias else None

            def forward(self, x):
                if not isinstance(x, Tensor):
                    x = Tensor(x, dtype=np.float32)
                out = x @ self.weight.T
                if self.bias is not None:
                    out = out + self.bias
                return out

        class ReLU(Module):
            def forward(self, x):
                return x.relu() if isinstance(x, Tensor) else Tensor(x).relu()

        class Sigmoid(Module):
            def forward(self, x):
                return x.sigmoid() if isinstance(x, Tensor) else Tensor(x).sigmoid()

        class Tanh(Module):
            def forward(self, x):
                return x.tanh() if isinstance(x, Tensor) else Tensor(x).tanh()

        class Sequential(Module):
            def __init__(self, *layers):
                super().__init__()
                self.layers = list(layers)
                for i, l in enumerate(self.layers):
                    self._modules[str(i)] = l
            def __getitem__(self, idx):
                return self.layers[idx]
            def forward(self, x):
                for l in self.layers:
                    x = l(x)
                return x

        class Embedding(Module):
            def __init__(self, num_embeddings, embedding_dim):
                super().__init__()
                self.num_embeddings = num_embeddings
                self.embedding_dim = embedding_dim
                self.weight = Parameter(np.zeros((num_embeddings, embedding_dim), dtype=np.float32))
            def forward(self, idx):
                indices = idx._data.astype(np.int64) if isinstance(idx, Tensor) else np.array(idx, dtype=np.int64)
                out_arr = self.weight._data[indices]
                out = Tensor(out_arr, dtype=np.float32, requires_grad=self.weight.requires_grad, _op='embedding', _parents=(self.weight,))
                def _bw():
                    if out.grad is None or not self.weight.requires_grad: return
                    g = np.zeros_like(self.weight._data)
                    np.add.at(g, indices, out.grad._data)
                    self.weight.grad = Tensor(g) if self.weight.grad is None else Tensor(self.weight.grad._data + g)
                out._backward_fn = _bw
                return out

        class Conv2d(Module):
            def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, bias=True):
                super().__init__()
                k = kernel_size if isinstance(kernel_size, int) else kernel_size[0]
                self.kernel_size = k
                self.stride = stride
                self.padding = padding
                self.weight = Parameter(np.zeros((out_channels, in_channels, k, k), dtype=np.float32))
                self.bias = Parameter(np.zeros((out_channels,), dtype=np.float32)) if bias else None
            def forward(self, x):
                arr = x._data if isinstance(x, Tensor) else np.array(x, dtype=np.float32)
                single = (arr.ndim == 3)
                if single: arr = arr[None, ...]
                N, C, H, W = arr.shape
                k = self.kernel_size
                s = self.stride
                p = self.padding
                if p > 0:
                    arr = np.pad(arr, ((0,0),(0,0),(p,p),(p,p)), mode='constant')
                H_out = (arr.shape[2] - k) // s + 1
                W_out = (arr.shape[3] - k) // s + 1
                O = self.weight._data.shape[0]
                out = np.zeros((N, O, H_out, W_out), dtype=np.float32)
                for i in range(H_out):
                    for j in range(W_out):
                        patch = arr[:, :, i*s:i*s+k, j*s:j*s+k]
                        out[:, :, i, j] = np.tensordot(patch, self.weight._data, axes=([1,2,3],[1,2,3]))
                if self.bias is not None:
                    out += self.bias._data[None, :, None, None]
                return Tensor(out[0] if single else out, dtype=np.float32)

        class MSELoss(Module):
            def forward(self, pred, target):
                p = pred if isinstance(pred, Tensor) else Tensor(pred, dtype=np.float32)
                t = target if isinstance(target, Tensor) else Tensor(target, dtype=np.float32)
                if p._data.shape != t._data.shape and p._data.size == t._data.size:
                    t = Tensor(t._data.reshape(p._data.shape), dtype=np.float32)
                return ((p - t) ** 2).mean()

        class CrossEntropyLoss(Module):
            def forward(self, logits, targets):
                l = logits if isinstance(logits, Tensor) else Tensor(logits, dtype=np.float32)
                t_arr = targets._data.astype(np.int64) if isinstance(targets, Tensor) else np.array(targets, dtype=np.int64)
                arr = l._data
                if arr.ndim == 1:
                    arr = arr[None, :]
                shifted = arr - np.max(arr, axis=-1, keepdims=True)
                exps = np.exp(shifted)
                probs = exps / np.sum(exps, axis=-1, keepdims=True)
                N = arr.shape[0]
                loss_val = -np.mean(np.log(np.clip(probs[np.arange(N), t_arr], 1e-12, 1.0)))
                out = Tensor(loss_val, dtype=np.float32, requires_grad=l.requires_grad, _op='ce', _parents=(l,))
                def _bw():
                    if out.grad is None or not l.requires_grad: return
                    grad_l = probs.copy()
                    grad_l[np.arange(N), t_arr] -= 1.0
                    grad_l = (grad_l / N) * float(out.grad._data)
                    if l._data.ndim == 1: grad_l = grad_l[0]
                    l.grad = Tensor(grad_l) if l.grad is None else Tensor(l.grad._data + grad_l)
                out._backward_fn = _bw
                return out

        class SGD:
            def __init__(self, params, lr=0.01, momentum=0.0, weight_decay=0.0):
                self.params = list(params)
                self.lr = float(lr)
                self.momentum = float(momentum)
                self.weight_decay = float(weight_decay)
                self.velocities = [np.zeros_like(p._data) for p in self.params]
            def zero_grad(self):
                for p in self.params:
                    p.grad = None
            def step(self):
                for i, p in enumerate(self.params):
                    if p.grad is None: continue
                    g = p.grad._data.copy()
                    if self.weight_decay != 0.0:
                        g = g + self.weight_decay * p._data
                    if self.momentum != 0.0:
                        self.velocities[i] = self.momentum * self.velocities[i] + g
                        g = self.velocities[i]
                    p._data = p._data - self.lr * g

        class Adam:
            def __init__(self, params, lr=0.001, betas=(0.9, 0.999), eps=1e-8):
                self.params = list(params)
                self.lr = float(lr)
                self.b1, self.b2 = betas
                self.eps = eps
                self.t = 0
                self.m = [np.zeros_like(p._data) for p in self.params]
                self.v = [np.zeros_like(p._data) for p in self.params]
            def zero_grad(self):
                for p in self.params:
                    p.grad = None
            def step(self):
                self.t += 1
                for i, p in enumerate(self.params):
                    if p.grad is None: continue
                    g = p.grad._data
                    self.m[i] = self.b1 * self.m[i] + (1.0 - self.b1) * g
                    self.v[i] = self.b2 * self.v[i] + (1.0 - self.b2) * (g ** 2)
                    m_hat = self.m[i] / (1.0 - self.b1 ** self.t)
                    v_hat = self.v[i] / (1.0 - self.b2 ** self.t)
                    p._data = p._data - self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

        torch_nn.Parameter = Parameter
        torch_nn.Module = Module
        torch_nn.Linear = Linear
        torch_nn.ReLU = ReLU
        torch_nn.Sigmoid = Sigmoid
        torch_nn.Tanh = Tanh
        torch_nn.Sequential = Sequential
        torch_nn.Embedding = Embedding
        torch_nn.Conv2d = Conv2d
        torch_nn.MSELoss = MSELoss
        torch_nn.CrossEntropyLoss = CrossEntropyLoss
        torch_nn.functional = torch_F

        torch_F.relu = lambda x: x.relu()
        torch_F.sigmoid = lambda x: x.sigmoid()
        torch_F.tanh = lambda x: x.tanh()
        torch_F.softmax = _torch_softmax
        torch_F.mse_loss = lambda p, t: MSELoss()(p, t)
        torch_F.cross_entropy = lambda l, t: CrossEntropyLoss()(l, t)

        torch_optim.SGD = SGD
        torch_optim.Adam = Adam

        torch.__path__ = []
        torch.nn = torch_nn
        torch.optim = torch_optim

        sys.modules['torch'] = torch
        sys.modules['torch.nn'] = torch_nn
        sys.modules['torch.nn.functional'] = torch_F
        sys.modules['torch.optim'] = torch_optim


    # =========================================================================
    # 2. TENSORFLOW SHIM (tensorflow as tf)
    # =========================================================================
    if 'tensorflow' not in sys.modules:
        tf = types.ModuleType('tensorflow')
        tf.float32 = np.float32
        tf.float64 = np.float64
        tf.int32 = np.int32
        tf.int64 = np.int64
        tf.bool = np.bool_

        _active_tapes = []

        class TFTensor:
            def __init__(self, data, dtype=None, _op=None, _parents=()):
                if isinstance(data, TFTensor):
                    arr = data._data.copy()
                elif isinstance(data, np.ndarray):
                    arr = data.copy()
                else:
                    arr = np.array(data)
                if dtype is not None:
                    arr = arr.astype(dtype)
                elif arr.dtype == np.float64:
                    arr = arr.astype(np.float32)
                self._data = arr
                self._op = _op
                self._parents = _parents
                self._backward_fn = lambda g: None

            @property
            def shape(self):
                return tuple(self._data.shape)

            @property
            def dtype(self):
                return self._data.dtype

            def numpy(self):
                return self._data

            def tolist(self):
                if self._data.dtype in (np.float32, np.float64):
                    return np.round(self._data.astype(np.float64), 6).tolist()
                return self._data.tolist()

            def _wrap(self, other):
                return other if isinstance(other, TFTensor) else TFTensor(other, dtype=self.dtype)

            def __add__(self, other):
                o = self._wrap(other)
                out = TFTensor(self._data + o._data, _op='add', _parents=(self, o))
                def _bw(g):
                    return [(self, g), (o, g)]
                out._backward_fn = _bw
                return out

            def __radd__(self, other):
                return self.__add__(other)

            def __sub__(self, other):
                o = self._wrap(other)
                out = TFTensor(self._data - o._data, _op='sub', _parents=(self, o))
                def _bw(g):
                    return [(self, g), (o, -g)]
                out._backward_fn = _bw
                return out

            def __rsub__(self, other):
                o = self._wrap(other)
                return o.__sub__(self)

            def __mul__(self, other):
                o = self._wrap(other)
                out = TFTensor(self._data * o._data, _op='mul', _parents=(self, o))
                def _bw(g):
                    return [(self, g * o._data), (o, g * self._data)]
                out._backward_fn = _bw
                return out

            def __rmul__(self, other):
                return self.__mul__(other)

            def __truediv__(self, other):
                o = self._wrap(other)
                out = TFTensor(self._data / o._data, _op='div', _parents=(self, o))
                def _bw(g):
                    return [(self, g / o._data), (o, -g * self._data / (o._data ** 2))]
                out._backward_fn = _bw
                return out

            def __pow__(self, power):
                out = TFTensor(self._data ** power, _op='pow', _parents=(self,))
                def _bw(g):
                    return [(self, g * power * (self._data ** (power - 1)))]
                out._backward_fn = _bw
                return out

            def __matmul__(self, other):
                o = self._wrap(other)
                out = TFTensor(np.matmul(self._data, o._data), _op='matmul', _parents=(self, o))
                def _bw(g):
                    gs = np.matmul(g, np.swapaxes(o._data, -1, -2)) if o._data.ndim > 1 else np.outer(g, o._data)
                    go = np.matmul(np.swapaxes(self._data, -1, -2), g) if self._data.ndim > 1 else np.outer(self._data, g)
                    return [(self, gs), (o, go)]
                out._backward_fn = _bw
                return out

            def __getitem__(self, idx):
                return TFTensor(self._data[idx], dtype=self.dtype)

        class Variable(TFTensor):
            def __init__(self, initial_value, dtype=None, trainable=True):
                super().__init__(initial_value, dtype=dtype)
                self.trainable = trainable

            def assign(self, value):
                v = value._data if isinstance(value, TFTensor) else np.array(value, dtype=self.dtype)
                self._data = v.copy()
                return self

            def assign_add(self, delta):
                d = delta._data if isinstance(delta, TFTensor) else np.array(delta, dtype=self.dtype)
                self._data = self._data + d
                return self

            def assign_sub(self, delta):
                d = delta._data if isinstance(delta, TFTensor) else np.array(delta, dtype=self.dtype)
                self._data = self._data - d
                return self

        class GradientTape:
            def __init__(self, persistent=False):
                self.persistent = persistent
                self.watched = set()

            def __enter__(self):
                _active_tapes.append(self)
                return self

            def __exit__(self, *args):
                if self in _active_tapes:
                    _active_tapes.remove(self)

            def watch(self, tensor):
                self.watched.add(id(tensor))

            def gradient(self, target, sources):
                is_single = not isinstance(sources, (list, tuple))
                src_list = [sources] if is_single else list(sources)
                grads = {id(t): np.ones_like(target._data, dtype=np.float32) for t in [target]}

                topo = []
                visited = set()
                def build(v):
                    if id(v) not in visited and isinstance(v, TFTensor):
                        visited.add(id(v))
                        for p in v._parents:
                            build(p)
                        topo.append(v)
                build(target)

                for node in reversed(topo):
                    g = grads.get(id(node))
                    if g is None:
                        continue
                    for parent, pg in node._backward_fn(g):
                        while pg.ndim > parent._data.ndim:
                            pg = pg.sum(axis=0)
                        grads[id(parent)] = grads.get(id(parent), 0.0) + pg

                res = [TFTensor(grads.get(id(s), np.zeros_like(s._data))) for s in src_list]
                return res[0] if is_single else res

        tf.Tensor = TFTensor
        tf.Variable = Variable
        tf.GradientTape = GradientTape
        tf.constant = lambda val, dtype=None, shape=None: TFTensor(np.full(shape, val) if shape is not None and np.ndim(val)==0 else np.array(val).reshape(shape) if shape is not None else val, dtype=dtype)
        tf.convert_to_tensor = lambda val, dtype=None: TFTensor(val, dtype=dtype)
        tf.zeros = lambda shape, dtype=np.float32: TFTensor(np.zeros(shape, dtype=dtype), dtype=dtype)
        tf.ones = lambda shape, dtype=np.float32: TFTensor(np.ones(shape, dtype=dtype), dtype=dtype)
        tf.fill = lambda dims, value: TFTensor(np.full(dims, value))
        tf.cast = lambda x, dtype: TFTensor(np.trunc(x._data).astype(dtype) if dtype in (np.int32, np.int64, int) else x._data.astype(dtype), dtype=dtype)
        tf.reshape = lambda x, shape: TFTensor(x._data.reshape(shape), dtype=x.dtype)
        tf.transpose = lambda x: TFTensor(x._data.T, dtype=x.dtype)
        tf.matmul = lambda a, b: a @ b
        tf.reduce_sum = lambda x, axis=None, keepdims=False: TFTensor(x._data.sum(axis=axis, keepdims=keepdims), _parents=(x,))
        tf.reduce_mean = lambda x, axis=None, keepdims=False: TFTensor(x._data.mean(axis=axis, keepdims=keepdims), _parents=(x,))

        # tf.random, tf.data, tf.keras
        tf_random = types.ModuleType('tensorflow.random')
        tf_random.set_seed = lambda s: np.random.seed(int(s))

        tf_data = types.ModuleType('tensorflow.data')
        class TFDataset:
            def __init__(self, items):
                self._items = list(items)
            @staticmethod
            def from_tensor_slices(slices):
                if isinstance(slices, tuple):
                    cols = [s._data if isinstance(s, TFTensor) else np.array(s) for s in slices]
                    n = len(cols[0])
                    items = [tuple(TFTensor(c[i]) for c in cols) for i in range(n)]
                    return TFDataset(items)
                arr = slices._data if isinstance(slices, TFTensor) else np.array(slices)
                return TFDataset([TFTensor(arr[i]) for i in range(len(arr))])
            def shuffle(self, buffer_size, seed=None):
                items = list(self._items)
                if seed is not None:
                    rng = np.random.RandomState(int(seed))
                    idx = rng.permutation(len(items))
                    items = [items[i] for i in idx]
                return TFDataset(items)
            def batch(self, batch_size, drop_remainder=False):
                out = []
                for i in range(0, len(self._items), batch_size):
                    chunk = self._items[i:i+batch_size]
                    if drop_remainder and len(chunk) < batch_size:
                        continue
                    if isinstance(chunk[0], tuple):
                        k = len(chunk[0])
                        out.append(tuple(TFTensor(np.stack([r[j]._data for r in chunk])) for j in range(k)))
                    else:
                        out.append(TFTensor(np.stack([r._data for r in chunk])))
                return TFDataset(out)
            def map(self, fn):
                out = []
                for item in self._items:
                    res = fn(*item) if isinstance(item, tuple) else fn(item)
                    out.append(res)
                return TFDataset(out)
            def __iter__(self):
                return iter(self._items)

        tf_data.Dataset = TFDataset

        tf_keras = types.ModuleType('tensorflow.keras')
        tf_keras_losses = types.ModuleType('tensorflow.keras.losses')
        tf_keras_optimizers = types.ModuleType('tensorflow.keras.optimizers')

        class TFMeanSquaredError:
            def __call__(self, y_true, y_pred):
                t = y_true if isinstance(y_true, TFTensor) else TFTensor(y_true)
                p = y_pred if isinstance(y_pred, TFTensor) else TFTensor(y_pred)
                return tf.reduce_mean((t - p) ** 2)

        class TFSparseCategoricalCrossentropy:
            def __init__(self, from_logits=False):
                self.from_logits = from_logits
            def __call__(self, y_true, y_pred):
                t_arr = y_true._data.astype(np.int64) if isinstance(y_true, TFTensor) else np.array(y_true, dtype=np.int64)
                p = y_pred if isinstance(y_pred, TFTensor) else TFTensor(y_pred)
                arr = p._data
                if arr.ndim == 1: arr = arr[None, :]
                if self.from_logits:
                    shifted = arr - np.max(arr, axis=-1, keepdims=True)
                    exps = np.exp(shifted)
                    probs = exps / np.sum(exps, axis=-1, keepdims=True)
                else:
                    probs = np.clip(arr, 1e-12, 1.0)
                    probs = probs / np.sum(probs, axis=-1, keepdims=True)
                N = arr.shape[0]
                loss_val = -np.mean(np.log(np.clip(probs[np.arange(N), t_arr], 1e-12, 1.0)))
                out = TFTensor(loss_val, _op='scce', _parents=(p,))
                def _bw(g):
                    grad_p = probs.copy()
                    grad_p[np.arange(N), t_arr] -= 1.0
                    grad_p = (grad_p / N) * float(g)
                    return [(p, grad_p)]
                out._backward_fn = _bw
                return out

        class TFSGD:
            def __init__(self, learning_rate=0.01):
                self.lr = float(learning_rate)
            def apply_gradients(self, grads_and_vars):
                for g, v in grads_and_vars:
                    if g is not None:
                        v.assign_sub(g._data * self.lr)

        class TFAdam:
            def __init__(self, learning_rate=0.001, beta_1=0.9, beta_2=0.999, epsilon=1e-7):
                self.lr = float(learning_rate)
                self.b1 = beta_1
                self.b2 = beta_2
                self.eps = epsilon
                self.t = 0
                self.m = {}
                self.v = {}
            def apply_gradients(self, grads_and_vars):
                self.t += 1
                for g, var in grads_and_vars:
                    if g is None: continue
                    vid = id(var)
                    g_arr = g._data if isinstance(g, TFTensor) else np.array(g)
                    if vid not in self.m:
                        self.m[vid] = np.zeros_like(var._data)
                        self.v[vid] = np.zeros_like(var._data)
                    self.m[vid] = self.b1 * self.m[vid] + (1.0 - self.b1) * g_arr
                    self.v[vid] = self.b2 * self.v[vid] + (1.0 - self.b2) * (g_arr ** 2)
                    m_hat = self.m[vid] / (1.0 - self.b1 ** self.t)
                    v_hat = self.v[vid] / (1.0 - self.b2 ** self.t)
                    var.assign_sub(self.lr * m_hat / (np.sqrt(v_hat) + self.eps))

        tf_keras_losses.MeanSquaredError = TFMeanSquaredError
        tf_keras_losses.SparseCategoricalCrossentropy = TFSparseCategoricalCrossentropy
        tf_keras_optimizers.SGD = TFSGD
        tf_keras_optimizers.Adam = TFAdam
        tf_keras.losses = tf_keras_losses
        tf_keras.optimizers = tf_keras_optimizers

        tf.__path__ = []
        tf.random = tf_random
        tf.data = tf_data
        tf.keras = tf_keras

        sys.modules['tensorflow'] = tf
        sys.modules['tensorflow.random'] = tf_random
        sys.modules['tensorflow.data'] = tf_data
        sys.modules['tensorflow.keras'] = tf_keras
        sys.modules['tensorflow.keras.losses'] = tf_keras_losses
        sys.modules['tensorflow.keras.optimizers'] = tf_keras_optimizers

    # =========================================================================
    # 3. PYSPARK SHIM (pyspark, pyspark.sql, pyspark.sql.functions, Window, Row)
    # =========================================================================
    if 'pyspark' not in sys.modules:
        pyspark = types.ModuleType('pyspark')
        pyspark_sql = types.ModuleType('pyspark.sql')
        pyspark_funcs = types.ModuleType('pyspark.sql.functions')
        pyspark_window = types.ModuleType('pyspark.sql.window')

        class Row(dict):
            def __init__(self, *args, **kwargs):
                if args and not kwargs:
                    super().__init__(enumerate(args))
                    self._Positional = list(args)
                else:
                    super().__init__(**kwargs)
                    self._Positional = None
            def __getattr__(self, name):
                if name in self:
                    return self[name]
                raise AttributeError(name)
            def __getitem__(self, key):
                if isinstance(key, int) and getattr(self, '_Positional', None) is not None:
                    return self._Positional[key]
                if isinstance(key, int):
                    return list(self.values())[key]
                return super().__getitem__(key)
            def asDict(self):
                return dict(self)

        class SparkBuilder:
            def __init__(self):
                self._name = "default"
            def appName(self, name):
                self._name = name
                return self
            def master(self, m):
                return self
            def getOrCreate(self):
                return SparkSession(self._name)

        class SparkDataFrame:
            def __init__(self, rows, columns=None, plan_steps=None):
                self._rows = [dict(r) for r in rows]
                if columns is not None:
                    self._columns = list(columns)
                elif self._rows:
                    self._columns = list(self._rows[0].keys())
                else:
                    self._columns = []
                self.plan_steps = list(plan_steps or [])

            @property
            def columns(self):
                return list(self._columns)

            def count(self):
                return len(self._rows)

            def collect(self):
                return [Row(**{c: r.get(c) for c in self._columns}) for r in self._rows]

            def first(self):
                c = self.collect()
                return c[0] if c else None

            def take(self, n):
                return self.collect()[:n]

            def select(self, *cols):
                flat = []
                for c in cols:
                    if isinstance(c, (list, tuple)): flat.extend(c)
                    else: flat.append(c)
                col_names = [c if isinstance(c, str) else getattr(c, 'name', str(c)) for c in flat]
                new_rows = [{k: r.get(k) for k in col_names} for r in self._rows]
                return SparkDataFrame(new_rows, col_names, self.plan_steps + ['select'])

            def filter(self, cond):
                if callable(cond):
                    new_rows = [r for r in self._rows if cond(r)]
                else:
                    new_rows = list(self._rows)
                return SparkDataFrame(new_rows, self._columns, self.plan_steps + ['filter'])

            where = filter

            def orderBy(self, *cols, ascending=True):
                flat = []
                for c in cols:
                    if isinstance(c, (list, tuple)): flat.extend(c)
                    else: flat.append(c)
                def sort_key(r):
                    return tuple((r.get(c) is None, r.get(c)) for c in flat)
                new_rows = sorted(self._rows, key=sort_key, reverse=not ascending)
                return SparkDataFrame(new_rows, self._columns, self.plan_steps + ['orderBy'])

            sort = orderBy

            def withColumnRenamed(self, old, new):
                cols = [new if c == old else c for c in self._columns]
                rows = [{ (new if k == old else k): v for k, v in r.items() } for r in self._rows]
                return SparkDataFrame(rows, cols, self.plan_steps + ['withColumnRenamed'])

            def drop(self, *cols):
                flat = []
                for c in cols:
                    if isinstance(c, (list, tuple)): flat.extend(c)
                    else: flat.append(c)
                keep = [c for c in self._columns if c not in flat]
                rows = [{k: r.get(k) for k in keep} for r in self._rows]
                return SparkDataFrame(rows, keep, self.plan_steps + ['drop'])

            def union(self, other):
                return SparkDataFrame(self._rows + other._rows, self._columns, self.plan_steps + ['union'])

            def unionByName(self, other):
                return SparkDataFrame(self._rows + other._rows, self._columns, self.plan_steps + ['unionByName'])

            def dropDuplicates(self, subset=None):
                keys = subset or self._columns
                seen = set()
                out = []
                for r in self._rows:
                    k = tuple(r.get(c) for c in keys)
                    if k not in seen:
                        seen.add(k)
                        out.append(r)
                return SparkDataFrame(out, self._columns, self.plan_steps + ['dropDuplicates'])

        class SparkSession:
            builder = SparkBuilder()
            def __init__(self, app_name="default"):
                self.app_name = app_name
            def createDataFrame(self, data, schema=None):
                if not data:
                    return SparkDataFrame([], schema or [])
                first = data[0]
                if isinstance(first, dict):
                    cols = schema if isinstance(schema, list) else list(first.keys())
                    return SparkDataFrame(data, cols)
                else:
                    cols = list(schema) if schema else [f"_{i+1}" for i in range(len(first))]
                    rows = [dict(zip(cols, tup)) for tup in data]
                    return SparkDataFrame(rows, cols)
            def stop(self):
                pass

        class WindowSpec:
            def __init__(self, part_cols=(), order_cols=()):
                self.part_cols = part_cols
                self.order_cols = order_cols
            def partitionBy(self, *cols):
                return WindowSpec(cols, self.order_cols)
            def orderBy(self, *cols):
                return WindowSpec(self.part_cols, cols)

        class Window:
            @staticmethod
            def partitionBy(*cols):
                return WindowSpec(part_cols=cols)
            @staticmethod
            def orderBy(*cols):
                return WindowSpec(order_cols=cols)

        pyspark_window.Window = Window
        pyspark.__path__ = []
        pyspark_sql.__path__ = []
        pyspark_sql.SparkSession = SparkSession
        pyspark_sql.DataFrame = SparkDataFrame
        pyspark_sql.Row = Row
        pyspark_sql.functions = pyspark_funcs
        pyspark_sql.Window = Window
        pyspark.sql = pyspark_sql

        sys.modules['pyspark'] = pyspark
        sys.modules['pyspark.sql'] = pyspark_sql
        sys.modules['pyspark.sql.functions'] = pyspark_funcs
        sys.modules['pyspark.sql.window'] = pyspark_window

_nexus_install_shims()

def _nexus_normalize(val):
    if isinstance(val, np.ndarray):
        return _nexus_normalize(val.tolist())
    if hasattr(val, 'tolist') and callable(val.tolist):
        return _nexus_normalize(val.tolist())
    if isinstance(val, (float, np.floating)):
        if math.isnan(val) or math.isinf(val): return str(val)
        return round(float(val), 4)
    if isinstance(val, (int, np.integer)) and not isinstance(val, bool):
        return int(val)
    if isinstance(val, (list, tuple)):
        return [_nexus_normalize(x) for x in val]
    if isinstance(val, dict):
        return {str(k): _nexus_normalize(v) for k, v in val.items()}
    return val

def _nexus_deep_equal(a, b, tol=1e-3):
    if a is None and b is not None:
        return False
    if isinstance(a, (int, float, np.number)) and isinstance(b, (int, float, np.number)) and not isinstance(a, bool) and not isinstance(b, bool):
        return abs(float(a) - float(b)) <= tol * max(1.0, abs(float(b)))
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if len(a) != len(b): return False
        return all(_nexus_deep_equal(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        if set(map(str, a.keys())) != set(map(str, b.keys())): return False
        return all(_nexus_deep_equal(a[k], b.get(k, b.get(str(k))), tol) for k in a)
    return str(a).strip() == str(b).strip()
`;

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window.loadPyodide !== 'function') {
      throw new Error("Pyodide runtime script not loaded. Please check your network connection.");
    }
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });
    try {
      await pyodide.loadPackage(['numpy', 'pandas', 'sqlite3']);
    } catch (e) {
      console.warn("Package preload warning:", e);
    }
    await pyodide.runPythonAsync(PYTHON_SHIMS_AND_HARNESS);
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return initPromise;
}

/**
 * Execute arbitrary Python code and capture stdout, stderr, and return value
 */
export async function runPythonCode(code) {
  const pyodide = await getPyodide();
  const startTime = performance.now();

  let stdout = [];
  let stderr = [];

  pyodide.setStdout({ batched: (str) => stdout.push(str) });
  pyodide.setStderr({ batched: (str) => stderr.push(str) });

  try {
    const result = await pyodide.runPythonAsync(code);
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
      result: result !== undefined ? String(result) : null,
      durationMs
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: stdout.join('\n'),
      stderr: err.message,
      error: err.message,
      durationMs
    };
  }
}

/**
 * Run problem test cases against user code with structural & numerical tolerance verification
 */
export async function runTests(userCode, testCases) {
  const pyodide = await getPyodide();
  const startTime = performance.now();

  let stdout = [];
  pyodide.setStdout({ batched: (str) => stdout.push(str) });

  const results = [];
  let allPassed = true;

  try {
    await pyodide.runPythonAsync(userCode);
  } catch (err) {
    return {
      passed: false,
      syntaxError: err.message,
      results: [],
      durationMs: Math.round(performance.now() - startTime),
      stdout: stdout.join('\n')
    };
  }

  const funcMatch = userCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  const funcName = funcMatch ? funcMatch[1] : null;

  if (!testCases || testCases.length === 0) {
    // Guard against unimplemented starter code (pass or = None placeholders)
    const hasUnimplementedNone = /=\s*None(\s*#|\s*$)/m.test(userCode);
    const hasBarePass = /def\s+[a-zA-Z0-9_]+\([^)]*\)[\s\S]*?:\s*(?:"""[\s\S]*?"""\s*)?(?:#[^\n]*\n\s*)*pass\s*$/m.test(userCode.trim());
    if (hasUnimplementedNone || hasBarePass) {
      return {
        passed: false,
        syntaxError: "Function body is still unimplemented (contains placeholder `pass` or `= None`). Implement the solution before submitting.",
        results: [{
          id: 1,
          callStr: funcName ? `${funcName}(...)` : 'solution()',
          expected: 'Valid Output',
          actual: 'None (Unimplemented)',
          passed: false
        }],
        durationMs: Math.round(performance.now() - startTime),
        stdout: stdout.join('\n')
      };
    }

    return {
      passed: true,
      results: [{ id: 1, callStr: funcName ? `${funcName}()` : "Execution Check", passed: true, expected: "Valid Execution", actual: stdout.join('\n') || "OK" }],
      durationMs: Math.round(performance.now() - startTime),
      stdout: stdout.join('\n')
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      let callStr = '';
      if (tc.input) {
        callStr = tc.input;
      } else if (funcName && tc.input_data !== undefined) {
        if (typeof tc.input_data === 'object' && !Array.isArray(tc.input_data) && tc.input_data !== null) {
          const args = Object.entries(tc.input_data).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ');
          callStr = `${funcName}(${args})`;
        } else {
          callStr = `${funcName}(${JSON.stringify(tc.input_data)})`;
        }
      } else {
        callStr = funcName ? `${funcName}()` : 'None';
      }

      const expectedRaw = tc.expectedOutput !== undefined ? tc.expectedOutput :
                          (tc.expected_output?.result !== undefined ? tc.expected_output.result : tc.expected_output);

      // Run evaluation and comparison inside Python for exact structural & float tolerance matching
      const checkScript = `
_actual_val = _nexus_normalize(${callStr})
_expected_raw = ${JSON.stringify(expectedRaw)}
try:
    _expected_val = _nexus_normalize(eval(_expected_raw)) if isinstance(_expected_raw, str) else _nexus_normalize(_expected_raw)
except Exception:
    _expected_val = _expected_raw

_is_pass = bool(_nexus_deep_equal(_actual_val, _expected_val))
json.dumps({
    "passed": _is_pass,
    "actual": str(_actual_val),
    "expected": str(_expected_val)
})
`;
      const resJson = await pyodide.runPythonAsync(checkScript);
      const parsed = JSON.parse(resJson);

      if (!parsed.passed) allPassed = false;

      results.push({
        id: tc.id || (i + 1),
        isSample: tc.isSample !== undefined ? tc.isSample : true,
        callStr,
        expected: parsed.expected,
        actual: parsed.actual,
        passed: parsed.passed
      });
    } catch (testErr) {
      allPassed = false;
      results.push({
        id: tc.id || (i + 1),
        isSample: tc.isSample !== undefined ? tc.isSample : true,
        callStr: tc.input || (funcName ? `${funcName}(...)` : 'test'),
        error: testErr.message.split('\n').slice(-2).join(' '),
        passed: false
      });
    }
  }

  return {
    passed: allPassed,
    results,
    durationMs: Math.round(performance.now() - startTime),
    stdout: stdout.join('\n')
  };
}
