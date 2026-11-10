import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Package,
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  Search,
  MessageCircle,
  Printer,
  RotateCcw,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard,
  Sparkles,
  LogOut,
  Lock,
  LogIn
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS } from '@/data/products';

interface OrderItem {
  name: string;
  slug?: string;
  image?: string;
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

export const Orders: React.FC = () => {
  const { addToCart, openCart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [customerEmailFilter, setCustomerEmailFilter] = useState('');

  // Fetch orders from server + localStorage (somente para usuário autenticado)
  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Limpar pedidos mockados antigos do localStorage
      try {
        const stored = localStorage.getItem('sunlab_my_orders');
        if (stored) {
          const parsed: Order[] = JSON.parse(stored);
          const valid = parsed.filter(o => 
            !o.items?.some(i => 
              i.name?.includes('Waveform') || 
              i.name?.includes('Voronoi') || 
              i.name?.includes('MagSafe')
            ) && o.orderNumber !== 'SLB-942817' && o.orderNumber !== 'SLB-718294'
          );
          if (valid.length !== parsed.length) {
            localStorage.setItem('sunlab_my_orders', JSON.stringify(valid));
          }
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      // 2. Buscar pedidos reais da API (ou Vercel)
      let serverOrders: Order[] = [];
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            serverOrders = data.filter((o: Order) => 
              !o.items?.some(i => 
                i.name?.includes('Waveform') || 
                i.name?.includes('Voronoi') || 
                i.name?.includes('MagSafe')
              ) && o.orderNumber !== 'SLB-942817' && o.orderNumber !== 'SLB-718294'
            );
          }
        }
      } catch {}

      // 3. Buscar pedidos salvos no checkout local
      let localOrders: Order[] = [];
      try {
        const stored = localStorage.getItem('sunlab_my_orders');
        if (stored) {
          localOrders = JSON.parse(stored);
        }
      } catch {}

      // Mesclar pedidos reais sem duplicatas
      const mergedMap = new Map<string, Order>();
      serverOrders.forEach(o => mergedMap.set(o.orderNumber, o));
      localOrders.forEach(o => {
        if (!mergedMap.has(o.orderNumber)) {
          mergedMap.set(o.orderNumber, o);
        }
      });

      let combined = Array.from(mergedMap.values());

      // Se for cliente comum (não admin), mostrar exclusivamente os pedidos vinculados ao e-mail dele
      if (!isAdmin && user?.email) {
        combined = combined.filter(o => 
          o.customerEmail.toLowerCase().trim() === user.email.toLowerCase().trim()
        );
      }

      // Ordenar mais recentes primeiro
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(combined);
    } catch (err) {
      console.warn('Error loading orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setCustomerEmailFilter(user.email);
      loadOrders();
    } else {
      setOrders([]);
      setCustomerEmailFilter('');
      setLoading(false);
    }
  }, [user]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }

    if (customerEmailFilter.trim()) {
      const emailMatch = order.customerEmail.toLowerCase().includes(customerEmailFilter.toLowerCase().trim());
      if (!emailMatch && !searchQuery.trim()) {
        // If user is searching specifically, don't restrict strictly by email
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inNumber = order.orderNumber.toLowerCase().includes(q);
      const inName = order.customerName.toLowerCase().includes(q);
      const inEmail = order.customerEmail.toLowerCase().includes(q);
      const inPhone = order.customerPhone.includes(q);
      const inItems = order.items && order.items.some(it => it.name.toLowerCase().includes(q));
      return inNumber || inName || inEmail || inPhone || inItems;
    }

    return true;
  });

  // Helper to get image for item if missing
  const getItemImage = (item: OrderItem) => {
    if (item.image) return item.image;
    if (item.slug) {
      const match = PRODUCTS.find(p => p.slug === item.slug);
      if (match && match.images[0]) return match.images[0];
    }
    const nameMatch = PRODUCTS.find(p => p.name.toLowerCase() === item.name.toLowerCase());
    if (nameMatch && nameMatch.images[0]) return nameMatch.images[0];
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  };

  // Helper to re-order items
  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      const prod = PRODUCTS.find(p => p.slug === item.slug || p.name === item.name) || PRODUCTS[0];
      addToCart(prod, item.quantity);
    });
    openCart();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Aguardando Pagamento no WhatsApp</span>
          </span>
        );
      case 'Confirmado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pagamento Confirmado</span>
          </span>
        );
      case 'Em Produção 3D':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>Em Produção 3D</span>
          </span>
        );
      case 'Enviado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Enviado ao Destinatário</span>
          </span>
        );
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pedido Entregue</span>
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
            <span>Cancelado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 1;
      case 'Confirmado':
        return 2;
      case 'Em Produção 3D':
        return 2;
      case 'Enviado':
        return 3;
      case 'Concluído':
        return 4;
      default:
        return 1;
    }
  };

  // Se o usuário não estiver logado, não exibir compras ou dados de pedidos
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full animate-in fade-in duration-200">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-zinc-900 font-display">
              Acesso Protegido aos Pedidos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Para sua privacidade e segurança, as compras e pedidos só ficam visíveis quando você estiver conectado à sua conta SunLab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login?redirect=/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Fazer Login</span>
            </Link>
            <Link
              to="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-200 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-600" />
              <span>Ver Catálogo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Painel do Cliente SunLab
            </span>
            <span className="text-xs font-medium text-zinc-400">• Manufatura 3D</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-display tracking-tight">
            Produtos Comprados & Meus Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
            Consulte abaixo os produtos adquiridos, status de impressão na matriz, envio e comprovantes detalhados com suporte direto via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-blue-700" />
            <span>Explorar Mais Produtos</span>
          </Link>
          <button
            onClick={loadOrders}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer"
            title="Atualizar lista de pedidos"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {user && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Sair desta conta"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair ({user.name.split(' ')[0]})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nº pedido (#WVK...), produto, e-mail..."
            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Pendente', label: '🕒 Pendentes' },
            { id: 'Em Produção 3D', label: '⚙️ Em Produção' },
            { id: 'Enviado', label: '🚚 Enviados' },
            { id: 'Concluído', label: '✅ Entregues' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-blue-50 text-blue-900 border border-blue-300 shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Notice if email detected */}
      {customerEmailFilter && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span>Mostrando compras registradas para: <strong>{customerEmailFilter}</strong></span>
          </div>
          <button
            onClick={() => setCustomerEmailFilter('')}
            className="text-xs text-blue-700 hover:text-blue-950 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Ver todos os pedidos
          </button>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 space-y-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Carregando seus pedidos no banco de dados...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-zinc-200 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200">
            <Package className="w-8 h-8 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhum pedido encontrado</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? 'Nenhum resultado corresponde à sua pesquisa. Verifique os termos ou remova o filtro.'
                : 'Você ainda não finalizou compras neste dispositivo ou o e-mail não possui registros.'}
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 font-semibold text-xs transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-blue-700" />
            <span>Ir para o Catálogo da Loja</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const stepIndex = getStepIndex(order.status);
            const dateStr = new Date(order.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const buildOrderWhatsAppMessage = (o: Order) => {
              const itemsText = (o.items || [])
                .map(
                  (it, idx) =>
                    `   ${idx + 1}. *${it.name}*\n` +
                    `      🎨 Cor: ${it.color || 'Padrão'}${it.size ? ` | Tam: ${it.size}` : ''}\n` +
                    `      🔢 Quantidade: ${it.quantity}x | Valor unit.: R$ ${Number(it.unitPrice).toFixed(2).replace('.', ',')}`
                )
                .join('\n\n');

              return (
                `👋 *Olá equipe SunLab 3D!*\n` +
                `Gostaria de informações e acompanhamento sobre a produção/envio do meu pedido:\n\n` +
                `🔖 *CÓDIGO DO PEDIDO:* #${o.orderNumber}\n` +
                `📊 *Status Atual:* ${o.status}\n` +
                `💰 *Valor Total Pago:* R$ ${Number(o.totalAmount).toFixed(2).replace('.', ',')} (Pix 5% OFF)\n` +
                `💳 *Pagamento:* ${o.paymentMethod || 'Pix Instantâneo (5% OFF)'}\n\n` +
                `👤 *MEUS DADOS:*\n` +
                `• *Nome:* ${o.customerName}\n` +
                `• *E-mail:* ${o.customerEmail}\n` +
                `• *WhatsApp/Telefone:* ${o.customerPhone || 'Não informado'}\n\n` +
                `📍 *ENDEREÇO DE ENTREGA:*\n` +
                `• ${o.shippingAddress}\n\n` +
                `📦 *ITENS DO PEDIDO:*\n` +
                `${itemsText || '   (Projeto / Peça sob consulta)'}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Vocês poderiam me atualizar sobre a previsão de conclusão da impressão 3D e o envio/rastreio? Muito obrigado!`
              );
            };

            const whatsappMessage = encodeURIComponent(buildOrderWhatsAppMessage(order));

            return (
              <div
                key={order.id}
                className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs transition-all hover:border-zinc-300"
              >
                {/* Order Top Bar */}
                <div className="bg-zinc-50/80 border-b border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-extrabold text-blue-950 text-base">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {dateStr}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Progress Stepper for 3D Manufacturing */}
                <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 bg-white">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-3">
                    Etapas da Produção 3D & Envio:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { step: 1, title: '1. Pedido Confirmado', desc: 'Dados salvos no banco' },
                      { step: 2, title: '2. Em Impressão 3D', desc: 'Filamento sendo extrusado' },
                      { step: 3, title: '3. Acabamento & QA', desc: 'Remoção de suportes e cura' },
                      { step: 4, title: '4. Enviado / Entregue', desc: 'Despachado ao destinatário' }
                    ].map((st) => {
                      const isDone = stepIndex >= st.step;
                      const isCurrent = stepIndex === st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            isCurrent
                              ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs'
                              : isDone
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                              : 'bg-white border-zinc-100 text-zinc-400 opacity-60'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 text-[9px] flex items-center justify-center">
                                {st.step}
                              </span>
                            )}
                            <span className="truncate">{st.title}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">{st.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Products Purchased Table / Cards */}
                <div className="p-6 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Produtos Fabricados no Pedido:
                  </div>

                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                    {order.items && order.items.map((item, idx) => {
                      const image = getItemImage(item);

                      return (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={image}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0 shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-zinc-900 text-sm">
                                  {item.name}
                                </h4>
                                {item.slug && (
                                  <Link
                                    to={`/product/${item.slug}`}
                                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                    title="Ver detalhes do produto"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {item.color && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] text-zinc-700 border border-zinc-200">
                                    <span>Cor: <strong>{item.color}</strong></span>
                                  </span>
                                )}
                                {item.size && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] text-zinc-700 border border-zinc-200">
                                    <span>Tam: <strong>{item.size}</strong></span>
                                  </span>
                                )}
                                <span className="text-[11px] text-zinc-500 font-mono">
                                  Qtd: {item.quantity}x
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:self-center">
                            <span className="text-xs text-zinc-500 block">
                              {item.quantity}x de R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="font-bold text-zinc-900 text-sm font-mono">
                              R$ {(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Buyer & Address Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Endereço de Envio:</span>
                      </div>
                      <p className="text-zinc-700 pl-5">{order.shippingAddress}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Comprador & Contato:</span>
                      </div>
                      <p className="text-zinc-700 pl-5">
                        {order.customerName} • {order.customerEmail} • {order.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with Totals and Actions */}
                <div className="bg-zinc-50 border-t border-zinc-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <span className="text-xs text-zinc-500">Valor Total:</span>
                    <span className="font-mono font-extrabold text-zinc-900 text-lg">
                      R$ {Number(order.totalAmount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* WhatsApp Action */}
                    <a
                      href={`https://wa.me/5513996061681?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Acompanhar no WhatsApp</span>
                    </a>

                    {/* Print Receipt */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>

                    {/* Buy Again */}
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
                      <span>Comprar Novamente</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;
