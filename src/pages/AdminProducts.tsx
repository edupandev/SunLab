import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Star,
  Flame,
  CheckCircle,
  X,
  Search,
  RotateCcw,
  LogOut,
  ExternalLink,
  Layers,
  Save,
  UploadCloud,
  ImageIcon,
  ShoppingBag,
  Clock,
  Truck,
  MessageCircle,
  DollarSign
} from 'lucide-react';
import type { Product } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';
import SunLabLogo from '@/components/SunLabLogo';

interface OrderItem {
  name: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const AdminProducts: React.FC = () => {
  const { products, createProduct, updateProduct, deleteProduct, toggleProductField, resetToDefault } = useProducts();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Bloqueio rigoroso: apenas o administrador oficial tem permissão
  useEffect(() => {
    if (!isAdmin || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAdmin, user, navigate]);

  if (!isAdmin || user?.role !== 'admin') {
    return null;
  }

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Orders State (E-commerce 2.5)
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('sunlab_auth_token');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setActionFeedback({ message: `Status do pedido atualizado para: ${newStatus}` });
        setTimeout(() => setActionFeedback(null), 3500);
      }
    } catch (err) {
      setActionFeedback({ message: 'Falha ao atualizar pedido.', isError: true });
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (confirm(`Deseja remover o pedido ${orderNumber} do banco de dados?`)) {
      try {
        const token = localStorage.getItem('sunlab_auth_token');
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          setOrders(orders.filter(o => o.id !== orderId));
          setActionFeedback({ message: `Pedido ${orderNumber} removido com sucesso!` });
          setTimeout(() => setActionFeedback(null), 3500);
        }
      } catch (err) {
        setActionFeedback({ message: 'Erro ao excluir pedido.', isError: true });
      }
    }
  };
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Image Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !editingProduct) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.urls && data.urls.length) {
        const currentImages = editingProduct.images || [];
        setEditingProduct({
          ...editingProduct,
          images: [...currentImages, ...data.urls]
        });
        setActionFeedback({ message: `${data.urls.length} foto(s) enviada(s) para o servidor com sucesso!` });
      } else {
        setActionFeedback({ message: data.error || 'Falha ao enviar fotos.', isError: true });
      }
    } catch {
      setActionFeedback({ message: 'Erro de comunicação ao enviar fotos.', isError: true });
    } finally {
      setIsUploading(false);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !editingProduct) return;
    const currentImages = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: [...currentImages, newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editingProduct) return;
    const currentImages = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: currentImages.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSetAsCover = (indexToCover: number) => {
    if (!editingProduct) return;
    const currentImages = [...(editingProduct.images || [])];
    const [selected] = currentImages.splice(indexToCover, 1);
    currentImages.unshift(selected);
    setEditingProduct({
      ...editingProduct,
      images: currentImages
    });
  };

  // Stats calculation
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.inStock).length;
  const featuredCount = products.filter(p => p.featured).length;
  const bestsellersCount = products.filter(p => p.bestseller).length;

  // Orders calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pendente').length;
  const inProductionOrders = orders.filter(o => o.status === 'Em Produção 3D').length;
  const completedOrders = orders.filter(o => o.status === 'Concluído').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct({
      id: '',
      slug: '',
      name: '',
      tagline: '',
      description: '',
      story: '',
      price: 120.00,
      originalPrice: 150.00,
      category: 'decor',
      categoryLabel: 'Decoração',
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      leadTime: '2 a 3 dias úteis',
      featured: false,
      bestseller: false,
      newArrival: true,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'],
      colors: [
        { name: 'Onyx Black', hex: '#121214' },
        { name: 'Chalk White', hex: '#EBEAE5' }
      ],
      sizes: ['Padrão'],
      specs: {
        material: 'PLA Pro Biodegradável',
        layerHeight: '0.12 mm',
        dimensions: '150 x 150 x 180 mm',
        weight: '310g',
        infill: '25% Gyroid',
        finish: 'Textura mineral fosca e bordas polidas'
      },
      highlights: [
        'Geometria algorítmica exclusiva',
        'Fabricação local sem desperdício de plástico',
        'Compatível com decorações modernas'
      ]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);

    try {
      if (editingProduct.id) {
        // Update existing
        const res = await updateProduct(editingProduct.id, editingProduct);
        if (res.success) {
          setActionFeedback({ message: `Produto "${editingProduct.name}" atualizado com sucesso!` });
          setIsModalOpen(false);
        } else {
          setActionFeedback({ message: res.error || 'Erro ao atualizar produto.', isError: true });
        }
      } else {
        // Create new
        const res = await createProduct(editingProduct as any);
        if (res.success) {
          setActionFeedback({ message: `Novo produto "${editingProduct.name}" inserido com sucesso!` });
          setIsModalOpen(false);
        } else {
          setActionFeedback({ message: res.error || 'Erro ao cadastrar produto.', isError: true });
        }
      }
    } catch {
      setActionFeedback({ message: 'Erro de comunicação ao salvar produto.', isError: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o produto "${name}" do banco de dados?`)) {
      const res = await deleteProduct(id);
      if (res.success) {
        setActionFeedback({ message: `Produto "${name}" removido com sucesso!` });
      } else {
        setActionFeedback({ message: res.error || 'Erro ao excluir produto.', isError: true });
      }
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleToggle = async (id: string, field: 'in_stock' | 'featured' | 'bestseller') => {
    await toggleProductField(id, field);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <SunLabLogo size="md" variant="light" />
          <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Painel Administrativo
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] font-semibold text-zinc-700">
                SQLite Conectado
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              Gestão de Produtos no Servidor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/catalog"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 border border-zinc-200 transition-colors shadow-xs"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 border border-red-200 transition-colors cursor-pointer shadow-xs"
            title="Sair do painel e encerrar sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair ({user?.name ? user.name.split(' ')[0] : 'Admin'})</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
          actionFeedback.isError
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-zinc-100 border border-zinc-300 text-zinc-800'
        }`}>
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-zinc-500 hover:text-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Selector: Catálogo vs Pedidos (Inspirado no E-commerce 2.5) */}
      <div className="flex border-b border-zinc-200 gap-4 sm:gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-blue-600 text-blue-900 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Produtos</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-zinc-100 text-[11px] text-zinc-700 font-bold border border-zinc-200">
            {totalProducts}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-blue-600 text-blue-900 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Gestão de Pedidos (Vendas)</span>
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
            pendingOrders > 0
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
          }`}>
            {totalOrders}
          </span>
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          {/* Metrics Row - White & Gray with Blue Text */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Total no Banco</span>
                <Package className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{totalProducts}</div>
              <span className="text-[10px] text-blue-500">Produtos cadastrados</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Em Estoque</span>
                <CheckCircle className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{inStockCount}</div>
              <span className="text-[10px] text-blue-500">Pronta entrega disponível</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Em Destaque</span>
                <Star className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{featuredCount}</div>
              <span className="text-[10px] text-blue-500">Exibidos na Home</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Mais Vendidos</span>
                <Flame className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{bestsellersCount}</div>
              <span className="text-[10px] text-blue-500">Com selo Bestseller</span>
            </div>
          </div>

          {/* Toolbar & Filters */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Pesquisar por nome ou slug..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                <option value="decor">Decoração</option>
                <option value="utility">Utilitários</option>
                <option value="tech">Tecnologia</option>
                <option value="gifts">Presentes</option>
                <option value="custom">Personalizados</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer border border-zinc-200"
                title="Restaura os produtos originais de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>Novo Produto 3D</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-blue-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Preço (R$)</th>
                    <th className="py-3.5 px-4">Estoque</th>
                    <th className="py-3.5 px-4 text-center">Destaque</th>
                    <th className="py-3.5 px-4 text-center">Bestseller</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758'}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                          />
                          <div>
                            <Link
                              to={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-zinc-900 hover:text-zinc-600 transition-colors block text-sm"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-medium text-zinc-700">
                          {p.categoryLabel}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        {p.price > 0 ? (
                          <div>
                            <span className="font-bold text-zinc-900">
                              R$ {p.price.toFixed(2).replace('.', ',')}
                            </span>
                            {p.originalPrice && (
                              <span className="block text-[10px] text-zinc-400 line-through">
                                R$ {p.originalPrice.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-medium">Sob Consulta</span>
                        )}
                      </td>

                      {/* In Stock Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggle(p.id, 'in_stock')}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                              : 'bg-zinc-50 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          {p.inStock ? '✓ Em Estoque' : '✕ Esgotado'}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(p.id, 'featured')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            p.featured ? 'text-zinc-800 bg-zinc-100' : 'text-zinc-300 hover:text-zinc-600'
                          }`}
                          title={p.featured ? 'Remover do destaque' : 'Colocar em destaque'}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-zinc-700 text-zinc-800' : ''}`} />
                        </button>
                      </td>

                      {/* Bestseller Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggle(p.id, 'bestseller')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            p.bestseller ? 'text-zinc-800 bg-zinc-100' : 'text-zinc-300 hover:text-zinc-600'
                          }`}
                          title={p.bestseller ? 'Remover selo mais vendido' : 'Marcar como mais vendido'}
                        >
                          <Flame className={`w-4 h-4 ${p.bestseller ? 'fill-zinc-700 text-zinc-800' : ''}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
                            title="Editar produto no banco"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Orders Management Section (Inspired by E-commerce-Website-2.5) */
        <div className="space-y-6">
          {/* Orders Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Total de Pedidos</span>
                <ShoppingBag className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{totalOrders}</div>
              <span className="text-[10px] text-blue-500">Registrados na base</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 mb-1">
                <span className="text-xs font-medium">Aguardando Início</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-900 font-display">{pendingOrders}</div>
              <span className="text-[10px] text-amber-600">Pedidos pendentes</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-medium">Em Impressão 3D</span>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-950 font-display">{inProductionOrders}</div>
              <span className="text-[10px] text-blue-500">Fabricação em andamento</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-xs font-medium">Faturamento</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-900 font-display">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-[10px] text-emerald-600">{completedOrders} pedidos finalizados</span>
            </div>
          </div>

          {/* Orders Toolbar & Filters */}
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar por nº, cliente, email ou tel..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-500"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none focus:border-zinc-500 cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Produção 3D">Em Produção 3D</option>
                <option value="Enviado">Enviado</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-medium text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Atualizar Pedidos</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-blue-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Pedido / Data</th>
                    <th className="py-3.5 px-4">Cliente & Contato</th>
                    <th className="py-3.5 px-4">Itens Impressos</th>
                    <th className="py-3.5 px-4">Pagamento & Total</th>
                    <th className="py-3.5 px-4">Status do Pedido</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-500">
                        Nenhum pedido encontrado no banco de dados.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const cleanPhone = o.customerPhone.replace(/\D/g, '');
                      const whatsappText = encodeURIComponent(
                        `Olá ${o.customerName}, tudo bem? Sou da SunLab Impressão 3D e estou acompanhando seu pedido #${o.orderNumber}.`
                      );

                      return (
                        <tr key={o.id} className="hover:bg-zinc-50 transition-colors align-top">
                          {/* Order Number & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-zinc-900 text-sm block">
                              #{o.orderNumber}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              {new Date(o.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-900 text-sm">{o.customerName}</div>
                            <div className="text-[11px] text-zinc-500">{o.customerEmail}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono text-zinc-700">{o.customerPhone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/55${cleanPhone}?text=${whatsappText}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium hover:bg-emerald-100 transition-colors"
                                  title="Chamar no WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-1 max-w-[200px] truncate" title={o.shippingAddress}>
                              📍 {o.shippingAddress}
                            </div>
                          </td>

                          {/* Items */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5 max-w-[280px]">
                              {o.items && o.items.map((item, idx) => (
                                <div key={idx} className="flex items-start justify-between text-xs bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                                  <div>
                                    <div className="font-medium text-zinc-900 leading-tight">
                                      {item.quantity}x {item.name}
                                    </div>
                                    <div className="text-[10px] text-zinc-500">
                                      {item.color && `Cor: ${item.color}`}
                                      {item.size && ` • Tam: ${item.size}`}
                                    </div>
                                  </div>
                                  <span className="font-mono text-zinc-700 text-[11px] shrink-0 ml-2">
                                    R$ {(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Payment & Total */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-zinc-900 text-sm">
                              R$ {Number(o.totalAmount).toFixed(2).replace('.', ',')}
                            </div>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {o.paymentMethod || 'PIX'}
                            </span>
                          </td>

                          {/* Status Selector */}
                          <td className="py-3.5 px-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-all ${
                                o.status === 'Pendente'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : o.status === 'Em Produção 3D'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : o.status === 'Enviado'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : o.status === 'Concluído'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <option value="Pendente">🕒 Pendente</option>
                              <option value="Em Produção 3D">⚙️ Em Produção 3D</option>
                              <option value="Enviado">🚚 Enviado</option>
                              <option value="Concluído">✅ Concluído</option>
                              <option value="Cancelado">❌ Cancelado</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                              title="Remover pedido do banco"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-zinc-700" />
                <h3 className="text-base font-bold text-zinc-900">
                  {editingProduct.id ? `Editar Produto: ${editingProduct.name}` : 'Cadastrar Novo Produto 3D'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Nome do Produto *</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      setEditingProduct({
                        ...editingProduct,
                        name,
                        slug: editingProduct.id ? editingProduct.slug : slug
                      });
                    }}
                    placeholder="Ex: Vaso Paramétrico Ripple"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Slug da URL *</label>
                  <input
                    required
                    type="text"
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="ex: vaso-parametrico-ripple"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Price, Original Price, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Preço Atual (R$) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Preço Antigo / De: (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.originalPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Opcional"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Categoria *</label>
                  <select
                    value={editingProduct.category || 'decor'}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const label = cat === 'decor' ? 'Decoração' :
                        cat === 'utility' ? 'Utilitários' :
                        cat === 'tech' ? 'Tecnologia' :
                        cat === 'gifts' ? 'Presentes' : 'Personalizados';
                      setEditingProduct({ ...editingProduct, category: cat, categoryLabel: label });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-800 focus:border-zinc-500 outline-none cursor-pointer"
                  >
                    <option value="decor">Decoração</option>
                    <option value="utility">Utilitários</option>
                    <option value="tech">Tecnologia</option>
                    <option value="gifts">Presentes</option>
                    <option value="custom">Personalizados</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Tagline & Lead Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Frase de Efeito (Tagline)</label>
                  <input
                    type="text"
                    value={editingProduct.tagline || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                    placeholder="Ex: Geometria algorítmica inspirada na oscilação acústica."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Prazo de Fabricação</label>
                  <input
                    type="text"
                    value={editingProduct.leadTime || '2 a 3 dias úteis'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, leadTime: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Descrição Comercial</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Descrição completa do produto e seus materiais..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none resize-none"
                />
              </div>

              {/* Section: Photos of the product */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700">
                    <ImageIcon className="w-4 h-4" />
                    <span>Fotos do Produto (Upload para o Servidor)</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {editingProduct.images?.length || 0} foto(s) cadastrada(s)
                  </span>
                </div>

                {/* Drag and Drop & File Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative ${
                    isDraggingOver
                      ? 'border-zinc-600 bg-zinc-100'
                      : 'border-zinc-300 hover:border-zinc-500 bg-white shadow-inner'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900">
                        {isUploading ? 'Fazendo upload para o servidor...' : 'Clique para selecionar fotos do seu computador'}
                      </span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        ou arraste e solte arquivos de imagem aqui (.JPG, .PNG, .WEBP)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add by Image URL Alternative */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Ou cole o link direto de uma imagem na web (ex: https://...)"
                    className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Adicionar URL
                  </button>
                </div>

                {/* Thumbnails Grid of Added Photos */}
                {editingProduct.images && editingProduct.images.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider block">
                      Galeria de Fotos Atuais (a primeira é a Capa da Loja):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {editingProduct.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`group relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all ${
                            idx === 0
                              ? 'border-zinc-500 ring-2 ring-zinc-300 shadow-xs'
                              : 'border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Capa Badge */}
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-zinc-700 text-white text-[9px] font-bold shadow uppercase tracking-wider">
                              Capa
                            </span>
                          )}

                          {/* Overlay Action Buttons */}
                          <div className="absolute inset-0 bg-zinc-700/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="self-end p-1 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                              title="Remover foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(idx)}
                                className="w-full py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                Tornar Capa
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-zinc-700 bg-zinc-100 rounded-xl border border-zinc-200">
                    Nenhuma foto adicionada ainda. Adicione pelo menos 1 foto para o produto aparecer com destaque na loja.
                  </div>
                )}
              </div>

              {/* Technical 3D Specs */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Especificações Técnicas de Impressão 3D</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Material</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.material || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs!, material: e.target.value }
                      })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Resolução Camada</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.layerHeight || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs!, layerHeight: e.target.value }
                      })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1">Dimensões Físicas</label>
                    <input
                      type="text"
                      value={editingProduct.specs?.dimensions || ''}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs!, dimensions: e.target.value }
                      })}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer text-xs text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded text-zinc-800"
                  />
                  <span>Em Estoque</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer text-xs text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded text-zinc-800"
                  />
                  <span>Em Destaque</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer text-xs text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                    className="rounded text-zinc-800"
                  />
                  <span>Mais Vendido</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer text-xs text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.newArrival ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, newArrival: e.target.checked })}
                    className="rounded text-zinc-800"
                  />
                  <span>Lançamento</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando no Banco...' : 'Salvar no SQLite'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
