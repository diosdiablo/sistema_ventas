import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingCart, Edit, Trash2, Plus, ArrowLeft, CheckCircle2, TrendingUp, Layers, Clock, DollarSign, X, CreditCard, Sparkles, AlertCircle, Printer, MessageCircle, FileDown, ScanBarcode, Sun, Moon, Wrench, Settings, Lock, Eye, EyeOff } from 'lucide-react';

const BRAND_NAME = "Multiservicios Thuiaguito";
const DEFAULT_PASSWORD = "thuiaguito2024";

const verifyPassword = (input) => input === cachedPassword;

function App() {
  const [mode, setMode] = useState('POS');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempMode, setTempMode] = useState('POS');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [cachedPassword, setCachedPassword] = useState(DEFAULT_PASSWORD);
  
  const fetchData = async () => {
    setLoading(true);
    let { data: productsData } = await supabase.from('products').select('*').order('nombre');
    let { data: salesData } = await supabase.from('sales').select('*').order('fecha', { ascending: false });
    if (productsData) setProducts(productsData);
    if (salesData) setSales(salesData);
    
    // Cargar contraseña
    const { data: configData } = await supabase.from('config').select('value').eq('key', 'admin_password').single();
    if (configData) setCachedPassword(configData.value);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 selection:bg-violet-200 dark:selection:bg-violet-700 transition-colors duration-300">
      <header className="no-print bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-800 dark:via-violet-800 dark:to-purple-800 text-white shadow-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="font-black text-2xl hidden sm:block tracking-tight drop-shadow-md">{BRAND_NAME}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex bg-black/10 p-1.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              <button onClick={() => setMode('POS')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'POS' ? 'bg-white text-violet-600 shadow-lg transform scale-105' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
                Nueva Venta
              </button>
              <button onClick={() => { setTempMode('ADMIN'); setShowAuthModal(true); setPasswordInput(''); setAuthError(''); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'ADMIN' ? 'bg-white text-violet-600 shadow-lg transform scale-105' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
                Administrar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-hidden flex flex-col pt-6 relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm -z-10"></div>
        <div className="no-print absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="no-print absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {mode === 'POS' ? (
          <PosView products={products} reloadData={fetchData} loading={loading} darkMode={darkMode} />
        ) : (
          <AdminView products={products} sales={sales} reloadData={fetchData} loading={loading} darkMode={darkMode} />
        )}
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="text-center mb-6">
              <div className={`inline-flex p-3 rounded-full mb-4 ${darkMode ? 'bg-violet-900' : 'bg-violet-100'}`}>
                <Lock className={`w-6 h-6 ${darkMode ? 'text-violet-400' : 'text-violet-600'}`} />
              </div>
              <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Acceso Restringido</h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ingresa la contraseña para administrar</p>
            </div>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Contraseña"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (verifyPassword(passwordInput)) {
                      setMode('ADMIN');
                      setShowAuthModal(false);
                    } else {
                      setAuthError('Contraseña incorrecta');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {authError && <p className="text-red-500 text-sm text-center mb-4 font-medium">{authError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAuthModal(false); setPasswordInput(''); setAuthError(''); }}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (verifyPassword(passwordInput)) {
                    setMode('ADMIN');
                    setShowAuthModal(false);
                    setPasswordInput('');
                  } else {
                    setAuthError('Contraseña incorrecta');
                  }
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-purple-700 transition-all"
              >
                Acceder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PosView({ products, reloadData, loading, darkMode }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');
  const [checkoutModal, setCheckoutModal] = useState(null);

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cantidad + 1 > product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cantidad + delta;
        if (newQ < 1 || newQ > item.stock) return item;
        return { ...item, cantidad: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  useEffect(() => {
    let barcodeBuffer = '';
    let readingTimeout = null;

    const handleKeyDown = (e) => {
      if (checkoutModal) return; 
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 2) {
          const product = products.find(p => p.codigo_barras === barcodeBuffer);
          if (product && product.stock > 0) {
            addToCart(product);
            setToast(`✅ ${product.nombre}`);
            setTimeout(() => setToast(''), 2000);
          } else if (product) {
             alert(`Agotado: ${product.nombre}`);
          } else {
             alert(`Código no encontrado.`);
          }
        }
        barcodeBuffer = '';
        return;
      }
      
      if (e.key !== 'Shift') {
        barcodeBuffer += e.key;
      }

      clearTimeout(readingTimeout);
      readingTimeout = setTimeout(() => { barcodeBuffer = ''; }, 100); 
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); clearTimeout(readingTimeout); };
  }, [products, checkoutModal]);

  const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalCost = cart.reduce((acc, item) => acc + (item.costo * item.cantidad), 0);
  const profit = total - totalCost;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const saleData = {
        items: cart.map(c => ({ productoId: c.id, nombre: c.nombre, cantidad: c.cantidad, precioUnitario: c.precio, costoUnitario: c.costo })),
        total, ganancia: profit, fecha: new Date().toISOString()
      };

      const { error: saleError } = await supabase.from('sales').insert([saleData]);
      if (saleError) throw saleError;

      for (const item of cart) {
        const { data: prodData } = await supabase.from('products').select('stock').eq('id', item.id).single();
        if (prodData) {
          await supabase.from('products').update({ stock: prodData.stock - item.cantidad }).eq('id', item.id);
        }
      }

      setCheckoutModal(saleData);
      setCart([]);
      reloadData();
    } catch (err) {
      alert('Error en checkout');
      console.error(err);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-violet-600"></div></div>;

  const cardBg = darkMode ? 'bg-slate-800/60' : 'bg-white/60';
  const panelBg = darkMode ? 'bg-slate-800' : 'bg-white';
  const inputBg = darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200';

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)] no-print relative">
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <TicketModal 
            detail={checkoutModal} 
            onClose={() => setCheckoutModal(null)} 
            successMode={true} 
            darkMode={darkMode}
          />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${cardBg} backdrop-blur-3xl rounded-3xl shadow-xl p-6 border ${darkMode ? 'border-slate-700' : 'border-white'}`}>
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${darkMode ? 'bg-violet-900' : 'bg-violet-100'}`}><Layers className={`w-6 h-6 ${darkMode ? 'text-violet-400' : 'text-violet-600'}`}/></div>
             <h2 className="text-2xl font-black">Catálogo</h2>
           </div>
           <div className={`text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-xl ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}><ScanBarcode className="w-4 h-4"/> Escáner Activo</div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} onClick={() => p.stock > 0 && addToCart(p)} className={`group relative p-5 border-2 rounded-2xl flex flex-col transition-all duration-300 ease-out ${p.stock > 0 ? `border-transparent ${panelBg} hover:border-violet-300 dark:hover:border-violet-700 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/20 cursor-pointer ${darkMode ? 'hover:bg-slate-700' : ''}` : 'opacity-50 bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
              <div className="flex-1 mb-3">
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-violet-400' : 'text-violet-500'}`}>{p.categoria || 'Variado'}</p>
                <h3 className={`font-bold line-clamp-2 text-lg leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{p.nombre}</h3>
                {p.codigo_barras && <p className={`text-[10px] flex items-center gap-1 mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}><ScanBarcode className="w-3 h-3"/> {p.codigo_barras}</p>}
              </div>
              <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className={`font-black text-2xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>${Number(p.precio).toFixed(2)}</span>
                {p.stock > 0 ? (
                  <span className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded-full ${p.stock <= 5 ? (darkMode ? 'bg-orange-900 text-orange-400 border border-orange-700' : 'bg-orange-100 text-orange-700 border border-orange-200') : (darkMode ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')}`}>
                    {p.stock} uds
                  </span>
                ) : (
                  <span className="text-[11px] uppercase font-bold px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700">Agotado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`w-full md:w-[400px] flex flex-col ${panelBg} rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 h-full overflow-hidden relative`}>
        <div className={`p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-pink-900 text-pink-400' : 'bg-pink-100 text-pink-600'}`}><ShoppingCart className="w-6 h-6"/></div>
            <h2 className="text-xl font-bold">Ticket Actual</h2>
          </div>
          <span className="bg-violet-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">{cart.length}</span>
        </div>
        
        <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'}`}>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-medium">Agrega productos o usa el escáner</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className={`group p-4 border rounded-2xl transition-colors shadow-sm hover:shadow-md ${darkMode ? 'border-slate-600 bg-slate-700 hover:border-violet-500' : 'border-slate-200 bg-white hover:border-violet-300'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold leading-tight pr-4 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.nombre}</span>
                    <button onClick={() => removeFromCart(item.id)} className={`p-1 rounded-lg transition-colors ${darkMode ? 'bg-slate-600 text-slate-400 hover:text-rose-400 hover:bg-rose-900' : 'bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}><X className="w-4 h-4"/></button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-black tracking-tight text-violet-600 dark:text-violet-400 text-lg">${(item.precio * item.cantidad).toFixed(2)}</span>
                    <div className={`flex items-center gap-1 p-1 rounded-xl border ${darkMode ? 'bg-slate-600 border-slate-500' : 'bg-slate-100 border-slate-200'}`}>
                      <button onClick={() => updateQuantity(item.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${darkMode ? 'hover:bg-slate-500 text-slate-300' : 'hover:bg-white text-slate-600'}`}>-</button>
                      <span className="w-8 font-black text-center text-sm">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${darkMode ? 'hover:bg-slate-500 text-slate-300' : 'hover:bg-white text-slate-600'}`}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`p-6 border-t border-slate-100 dark:border-slate-700 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] ${panelBg}`}>
          <div className="flex justify-between mb-5 items-end">
            <span className={`font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total a cobrar:</span>
            <span className="font-black text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">${total.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className={`w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all duration-300 ${cart.length === 0 ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-600' : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 active:scale-[0.98] text-white shadow-xl shadow-violet-500/30'}`}>
            <CreditCard className="w-6 h-6"/> Confirmar Venta
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white/20 p-1.5 rounded-full"><CheckCircle2 className="w-6 h-6"/></div>
          <span className="font-bold text-lg tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
}

function AdminView({ products, sales, reloadData, loading, darkMode }) {
  const [tab, setTab] = useState('PRODUCTS');
  const [timeFilter, setTimeFilter] = useState('HOY');
  const [configTab, setConfigTab] = useState({ show: false, currentPass: '', newPass: '', confirmPass: '', saveMsg: '' });
  
  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(s => {
      if (timeFilter === 'SIEMPRE') return true;
      const d = new Date(s.fecha);
      if (timeFilter === 'HOY') return d.toDateString() === now.toDateString();
      if (timeFilter === 'SEMANA') {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        return d >= pastWeek;
      }
      if (timeFilter === 'MES') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (timeFilter === 'AÑO') return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredSalesInfo = getFilteredSales();
  const tFilteredSales = filteredSalesInfo.reduce((acc, s) => acc + Number(s.total), 0);
  const tFilteredProfit = filteredSalesInfo.reduce((acc, s) => acc + Number(s.ganancia), 0);

  const tSales = sales.reduce((acc, s) => acc + Number(s.total), 0);
  const tProfit = sales.reduce((acc, s) => acc + Number(s.ganancia), 0);

  if (loading) return <div className="flex h-full items-center justify-center no-print"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-violet-600"></div></div>;

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col gap-6 overflow-y-auto w-full max-w-6xl mx-auto no-print">
      <div className="flex flex-col gap-4">
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl w-max shadow-sm border overflow-x-auto max-w-full ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/50 border-slate-200'}`}>
          {['HOY', 'SEMANA', 'MES', 'AÑO', 'SIEMPRE'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${timeFilter === f ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md transform scale-105' : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white')}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={`Ventas (${timeFilter})`} value={`$${tFilteredSales.toFixed(2)}`} icon={<Clock className="w-6 text-white"/>} gr="from-blue-500 to-cyan-400" darkMode={darkMode} />
          <StatCard title={`Ganancia (${timeFilter})`} value={`$${tFilteredProfit.toFixed(2)}`} icon={<TrendingUp className="w-6 text-white"/>} gr="from-emerald-500 to-teal-400" darkMode={darkMode} />
          <StatCard title="Ventas Históricas" value={`$${tSales.toFixed(2)}`} icon={<DollarSign className="w-6 text-white"/>} gr="from-violet-500 to-purple-400" darkMode={darkMode} />
          <StatCard title="Ganancia Histórica" value={`$${tProfit.toFixed(2)}`} icon={<Sparkles className="w-6 text-white"/>} gr="from-amber-400 to-orange-400" darkMode={darkMode} />
        </div>
      </div>

      <div className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border flex-1 overflow-hidden flex flex-col mt-2 ${darkMode ? 'border-slate-700' : 'border-white'}`}>
        <div className={`flex gap-3 p-4 border-b ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-slate-100'}`}>
          <button onClick={() => setTab('PRODUCTS')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${tab === 'PRODUCTS' ? (darkMode ? 'bg-slate-700 text-violet-400 shadow-md' : 'bg-white text-violet-600 shadow-md') + ' transform scale-[1.02]' : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800')}`}>Gestión de Inventario</button>
          <button onClick={() => setTab('SALES')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${tab === 'SALES' ? (darkMode ? 'bg-slate-700 text-violet-400 shadow-md' : 'bg-white text-violet-600 shadow-md') + ' transform scale-[1.02]' : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800')}`}>Historial de Ventas</button>
          <button onClick={() => setConfigTab({ ...configTab, show: true, currentPass: '', newPass: '', confirmPass: '', saveMsg: '' })} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${configTab.show ? (darkMode ? 'bg-slate-700 text-violet-400 shadow-md' : 'bg-white text-violet-600 shadow-md') + ' transform scale-[1.02]' : (darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800')}`}>Configuración</button>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          {tab === 'PRODUCTS' ? <ProductsManager products={products} reloadData={reloadData} darkMode={darkMode}/> : tab === 'SALES' ? <SalesHistory sales={filteredSalesInfo} darkMode={darkMode}/> : (
            <div className="flex flex-col gap-6">
              <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Configuración</h3>
              
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <h4 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Cambiar Contraseña de Administrador</h4>
                <div className="flex flex-col gap-4">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={configTab.currentPass}
                    onChange={(e) => setConfigTab({ ...configTab, currentPass: e.target.value, saveMsg: '' })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`}
                  />
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={configTab.newPass}
                    onChange={(e) => setConfigTab({ ...configTab, newPass: e.target.value, saveMsg: '' })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`}
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={configTab.confirmPass}
                    onChange={(e) => setConfigTab({ ...configTab, confirmPass: e.target.value, saveMsg: '' })}
                    className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`}
                  />
                  <button
                    onClick={async () => {
                      if (!verifyPassword(configTab.currentPass)) {
                        setConfigTab({ ...configTab, saveMsg: '❌ La contraseña actual es incorrecta' });
                        return;
                      }
                      if (configTab.newPass.length < 4) {
                        setConfigTab({ ...configTab, saveMsg: '❌ La nueva contraseña debe tener al menos 4 caracteres' });
                        return;
                      }
                      if (configTab.newPass !== configTab.confirmPass) {
                        setConfigTab({ ...configTab, saveMsg: '❌ Las contraseñas no coinciden' });
                        return;
                      }
                      // Save to Supabase
                      await supabase.from('config').upsert({ key: 'admin_password', value: configTab.newPass });
                      setCachedPassword(configTab.newPass);
                      setConfigTab({ ...configTab, currentPass: '', newPass: '', confirmPass: '', saveMsg: '✅ Contraseña actualizada correctamente' });
                      reloadData();
                    }}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-purple-700 transition-all"
                  >
                    Guardar Nueva Contraseña
                  </button>
                  {configTab.saveMsg && (
                    <p className={`text-center font-bold ${configTab.saveMsg.includes('✅') ? 'text-emerald-500' : 'text-red-500'}`}>{configTab.saveMsg}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gr, darkMode }) {
  return (
    <div className={`p-6 rounded-3xl shadow-xl flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100'}`}>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gr} shadow-lg text-white`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-bold tracking-wider uppercase mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
        <p className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  )
}

function ProductsManager({ products, reloadData, darkMode }) {
  const [formVis, setFormVis] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', costo: '', stock: '', categoria: '', codigo_barras: '' });

  const resetForm = () => { setForm({ nombre: '', precio: '', costo: '', stock: '', categoria: '', codigo_barras: '' }); setEditId(null); setFormVis(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { nombre: form.nombre, precio: parseFloat(form.precio), costo: parseFloat(form.costo), stock: parseInt(form.stock), categoria: form.categoria, codigo_barras: form.codigo_barras || null };
    if (editId) await supabase.from('products').update(data).eq('id', editId);
    else await supabase.from('products').insert([data]);
    resetForm(); reloadData();
  };

  const handleEdit = (p) => { setForm({ ...p, codigo_barras: p.codigo_barras || '' }); setEditId(p.id); setFormVis(true); };
  const handleDelete = async (id) => {
    if(confirm('¿Seguro que deseas eliminar este producto permanentemente?')) { await supabase.from('products').delete().eq('id', id); reloadData(); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`font-black text-xl ${darkMode ? 'text-white' : 'text-slate-800'}`}>Directorio de Productos</h3>
        {!formVis && <button onClick={() => setFormVis(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex gap-2 items-center shadow-lg shadow-violet-500/30 transform active:scale-95 transition-all"><Plus className="w-5 h-5"/> Agregar Producto</button>}
      </div>

      {formVis && (
        <form onSubmit={handleSave} className={`p-6 rounded-3xl mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 border shadow-xl animate-in slide-in-from-top-4 duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-slate-50 to-white border-violet-100'}`}>
          <div className="lg:col-span-6 flex justify-between items-center pb-2">
            <h4 className={`font-black flex items-center gap-2 ${darkMode ? 'text-violet-400' : 'text-violet-800'}`}><Edit className="w-5 h-5"/> {editId ? 'Editando Producto' : 'Nuevo Producto'}</h4>
            <button type="button" onClick={resetForm} className={`p-2 border rounded-xl transition-all ${darkMode ? 'bg-slate-700 hover:bg-rose-900 text-rose-400 border-slate-600' : 'bg-white hover:bg-rose-50 text-rose-500 border-slate-100'}`}><X className="w-5 h-5"/></button>
          </div>
          <input required placeholder="Nombre descriptivo" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className={`lg:col-span-2 border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          <input placeholder="Cod. Barras (Opcional)" value={form.codigo_barras} onChange={e=>setForm({...form, codigo_barras: e.target.value})} className={`border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          <input placeholder="Categoría" value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value})} className={`border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          <input required type="number" placeholder="Stock" min="0" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className={`border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          <input required type="number" placeholder="Costo ($)" step="0.01" min="0" value={form.costo} onChange={e=>setForm({...form, costo: e.target.value})} className={`border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          <input required type="number" placeholder="Venta ($)" step="0.01" min="0" value={form.precio} onChange={e=>setForm({...form, precio: e.target.value})} className={`border-2 p-3.5 rounded-xl outline-none transition-colors font-medium ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-white border-slate-200 text-slate-700 focus:border-violet-500'}`} />
          
          <div className="lg:col-span-6 flex justify-end gap-3 items-center mt-2">
            <button type="button" onClick={resetForm} className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200'}`}>Cancelar</button>
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-800/20 active:scale-95 transition-all tracking-wide">Guardar Cambios</button>
          </div>
        </form>
      )}

      <div className={`flex-1 overflow-auto border rounded-2xl shadow-inner ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <table className="w-full text-sm text-left">
          <thead className={`border-b sticky top-0 z-10 text-[11px] font-black uppercase tracking-wider ${darkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50/80 text-slate-500'}`}>
            <tr><th className="p-4">Producto / Código</th><th className="p-4">Stock</th><th className="p-4">Costo</th><th className="p-4">Venta</th><th className="p-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {products.map(p => (
              <tr key={p.id} className={`transition-colors group ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/50'}`}>
                <td className="p-4">
                  <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${darkMode ? 'text-violet-400 bg-violet-900' : 'text-fuchsia-500 bg-fuchsia-100'}`}>{p.categoria || 'Variado'}</span>
                    {p.codigo_barras && <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md flex items-center gap-1 ${darkMode ? 'text-slate-400 bg-slate-700 border border-slate-600' : 'text-slate-400 bg-slate-100 border border-slate-200'}`}><ScanBarcode className="w-3 h-3"/> {p.codigo_barras}</span>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${p.stock <= 5 ? (p.stock === 0 ? (darkMode ? 'bg-rose-900 text-rose-400 border-rose-700' : 'bg-rose-50 text-rose-600 border-rose-200') : (darkMode ? 'bg-orange-900 text-orange-400 border-orange-700' : 'bg-orange-50 text-orange-600 border-orange-200')) : (darkMode ? 'bg-emerald-900 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}`}>
                    {p.stock}
                  </span>
                </td>
                <td className={`p-4 font-bold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>${p.costo}</td>
                <td className={`p-4 font-black text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>${p.precio}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-violet-400 hover:bg-violet-900' : 'text-violet-600 hover:bg-violet-100'}`}><Edit className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(p.id)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-rose-400 hover:bg-rose-900' : 'text-rose-600 hover:bg-rose-100'}`}><Trash2 className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SalesHistory({ sales, darkMode }) {
  const [detail, setDetail] = useState(null);

  const exportToExcel = () => {
     let csv = "data:text/csv;charset=utf-8,Fecha,Artículos,Monto Total,Ganancia Neta\n";
     sales.forEach(s => {
       const dateStr = new Date(s.fecha).toLocaleString().replace(/,/g, '');
       const itemsCount = s.items.reduce((a,b)=>a+b.cantidad, 0);
       csv += `"${dateStr}",${itemsCount},${s.total},${s.ganancia}\n`;
     });
     const encodedUri = encodeURI(csv);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  if (detail) return (
     <div className="h-full flex flex-col pt-2 animate-in fade-in flex-1">
        <button onClick={() => setDetail(null)} className={`mb-4 self-start px-4 py-2 border rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-500' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'}`}><ArrowLeft className="w-4 h-4"/> Volver al historial</button>
        <TicketModal detail={detail} onClose={() => setDetail(null)} successMode={false} darkMode={darkMode} />
     </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className={`font-black text-xl flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}><AlertCircle className="text-violet-500 w-6 h-6"/> Movimientos</h3>
        <button onClick={exportToExcel} disabled={sales.length === 0} className={`px-4 py-2 rounded-xl font-bold text-sm flex gap-2 items-center shadow-sm transition-all ${darkMode ? 'bg-emerald-900 text-emerald-400 border border-emerald-700 hover:bg-emerald-800' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white'}`}><FileDown className="w-4 h-4"/> Exportar Excel / CSV</button>
      </div>
      <div className={`flex-1 overflow-auto border rounded-3xl shadow-inner ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <table className="w-full text-sm text-left">
          <thead className={`border-b sticky top-0 z-10 text-[11px] font-black uppercase tracking-wider ${darkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50/80 text-slate-500'}`}>
            <tr><th className="p-5">Fecha Timestamp</th><th className="p-5">Tickets</th><th className="p-5">Total</th><th className="p-5">Ganancia</th><th className="p-5 text-center">Acción</th></tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {sales.map(s => (
              <tr key={s.id} className={`transition-colors group cursor-pointer ${darkMode ? 'hover:bg-violet-900/30' : 'hover:bg-violet-50/30'}`} onClick={()=>setDetail(s)}>
                <td className={`p-5 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{new Date(s.fecha).toLocaleString()}</td>
                <td className="p-5"><span className={`font-bold px-3 py-1.5 rounded-full text-xs ${darkMode ? 'bg-slate-700 border border-slate-600 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>{s.items.reduce((a,b)=>a+b.cantidad, 0)} arts.</span></td>
                <td className={`p-5 font-black text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>${s.total}</td>
                <td className={`p-5 font-black text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`}>+${s.ganancia}</td>
                <td className="p-5 text-center"><button className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition-all ${darkMode ? 'bg-violet-900 text-violet-400 group-hover:bg-violet-800 group-hover:text-white' : 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}`}>Ver Ticket</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TicketModal({ detail, onClose, successMode, darkMode }) {
  const handlePrint = () => window.print();
  const handleWhatsApp = () => {
    const phone = prompt('Ingresa el celular del cliente con código de país (Ej: 525512345678):');
    if (!phone) return;
    let msg = `*${BRAND_NAME} - Ticket de Compra* \n\n*Fecha:* ${new Date(detail.fecha).toLocaleString()}\n\n*Detalle:*\n`;
    detail.items.forEach(i => { msg += `👉 ${i.cantidad}x ${i.nombre} - $${(i.precioUnitario * i.cantidad).toFixed(2)}\n`; });
    msg += `\n*TOTAL A PAGAR: $${detail.total}*\n\n¡Gracias por su preferencia!`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-auto border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div id="ticket-print-area" className={`p-8 border-b border-dashed ${darkMode ? 'border-slate-600 text-slate-100' : 'border-slate-300 text-slate-900'} relative`}>
        {successMode && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white rounded-full p-2 shadow-lg no-print"><CheckCircle2 className="w-8 h-8"/></div>}
        <div className="text-center mb-6 pt-4">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-1">{BRAND_NAME}</h2>
          <p className="text-xs font-bold uppercase">Comprobante de Venta</p>
          <p className="text-sm font-semibold mt-2">{new Date(detail.fecha).toLocaleString()}</p>
        </div>
        
        <table className="w-full text-sm text-left mb-6">
          <thead className="border-b-2 border-current font-bold uppercase text-xs">
            <tr><th className="py-2">Cant</th><th className="py-2">Item</th><th className="py-2 text-right">Sub</th></tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {detail.items.map((i, x) => (
               <tr key={x}><td className="py-3 font-black">{i.cantidad}</td><td className="py-3 font-semibold">{i.nombre}</td><td className="py-3 text-right font-black">${(i.cantidad * i.precioUnitario).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end border-t-2 border-current pt-4">
          <span className="font-bold uppercase tracking-wider text-sm">Total:</span>
          <span className="font-black text-3xl">${detail.total}</span>
        </div>
        <p className="text-center text-xs font-bold mt-8 mb-2 uppercase tracking-wide">¡Gracias por su compra!</p>
      </div>

      <div className={`p-6 flex flex-col gap-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <button onClick={handlePrint} className={`w-full py-3.5 rounded-xl font-black border-2 transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-slate-600 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-800 hover:bg-slate-800 hover:text-white'}`}><Printer className="w-5 h-5"/> Imprimir Ticket</button>
        <button onClick={handleWhatsApp} className="w-full py-3.5 rounded-xl font-black bg-[#25D366] hover:bg-[#1ebd5b] text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"><MessageCircle className="w-5 h-5"/> Enviar por WhatsApp</button>
        {successMode && <button onClick={onClose} className="w-full mt-2 py-3.5 rounded-xl font-bold transition-all bg-slate-200 text-slate-600 hover:bg-slate-300">Cerrar y Nueva Venta</button>}
      </div>
    </div>
  );
}

export default App;