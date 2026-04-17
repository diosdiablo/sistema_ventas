import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ShoppingCart, Edit, Trash2, Plus, ArrowLeft, CheckCircle2, TrendingUp, Layers, Clock, DollarSign, X, CreditCard, Sparkles, AlertCircle, Printer, MessageCircle, FileDown, ScanBarcode } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('POS');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  
  const fetchData = async () => {
    setLoading(true);
    let { data: productsData } = await supabase.from('products').select('*').order('nombre');
    let { data: salesData } = await supabase.from('sales').select('*').order('fecha', { ascending: false });
    if (productsData) setProducts(productsData);
    if (salesData) setSales(salesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [mode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-purple-200">
      <header className="no-print bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white shadow-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="font-black text-2xl hidden sm:block tracking-tight drop-shadow-md">VantaPOS</span>
          </div>
          <div className="flex bg-black/10 p-1.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
            <button onClick={() => setMode('POS')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'POS' ? 'bg-white text-fuchsia-600 shadow-lg transform scale-105' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
              Nueva Venta
            </button>
            <button onClick={() => setMode('ADMIN')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'ADMIN' ? 'bg-white text-fuchsia-600 shadow-lg transform scale-105' : 'text-white/80 hover:text-white hover:bg-white/20'}`}>
              Administrar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 overflow-hidden flex flex-col pt-6 relative">
        <div className="no-print absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="no-print absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {mode === 'POS' ? (
          <PosView products={products} reloadData={fetchData} loading={loading} />
        ) : (
          <AdminView products={products} sales={sales} reloadData={fetchData} loading={loading} />
        )}
      </main>
    </div>
  );
}

function PosView({ products, reloadData, loading }) {
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
            setToast(`🛒 Añadido: ${product.nombre}`);
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

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-fuchsia-600"></div></div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)] no-print relative">
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <TicketModal 
            detail={checkoutModal} 
            onClose={() => setCheckoutModal(null)} 
            successMode={true} 
          />
        </div>
      )}

      {/* Catálogo con Glassmorphism Ligero */}
      <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-3xl rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-white">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
            <div className="bg-violet-100 p-2 rounded-xl"><Layers className="w-6 h-6 text-violet-600"/></div>
            <h2 className="text-2xl font-black text-slate-800">Catálogo</h2>
           </div>
           <div className="text-xs font-bold text-slate-400 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl"><ScanBarcode className="w-4 h-4"/> Escáner Activo</div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => (
            <div key={p.id} onClick={() => p.stock > 0 && addToCart(p)} className={`group relative p-5 border-2 rounded-2xl flex flex-col transition-all duration-300 ease-out ${p.stock > 0 ? 'border-transparent bg-white hover:border-fuchsia-200 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-fuchsia-500/20 cursor-pointer' : 'opacity-50 bg-slate-50 border-slate-100'}`}>
              <div className="flex-1 mb-3">
                <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">{p.categoria || 'Variado'}</p>
                <h3 className="font-bold text-slate-800 line-clamp-2 text-lg leading-tight group-hover:text-fuchsia-600 transition-colors">{p.nombre}</h3>
                {p.codigo_barras && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><ScanBarcode className="w-3 h-3"/> {p.codigo_barras}</p>}
              </div>
              <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-100">
                <span className="font-black text-2xl text-slate-900">${Number(p.precio).toFixed(2)}</span>
                {p.stock > 0 ? (
                  <span className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded-full ${p.stock <= 5 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                    {p.stock} uds
                  </span>
                ) : (
                  <span className="text-[11px] uppercase font-bold px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Agotado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel del Carrito de Ventas */}
      <div className="w-full md:w-[400px] flex flex-col bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 h-full overflow-hidden relative">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600"><ShoppingCart className="w-6 h-6"/></div>
            <h2 className="text-xl font-bold">Ticket Actual</h2>
          </div>
          <span className="bg-slate-800 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">{cart.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30 text-slate-400" />
              <p className="font-medium text-slate-500">Agrega productos o usa el escáner</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="group p-4 border border-slate-200 rounded-2xl bg-white hover:border-violet-300 transition-colors shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-700 leading-tight pr-4">{item.nombre}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 bg-slate-50 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-black tracking-tight text-fuchsia-600 text-lg">${(item.precio * item.cantidad).toFixed(2)}</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg font-bold text-slate-600 transition-colors shadow-sm">-</button>
                      <span className="w-8 font-black text-center text-sm">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg font-bold text-slate-600 transition-colors shadow-sm">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between mb-5 items-end">
            <span className="text-slate-500 font-semibold mb-1">Total a cobrar:</span>
            <span className="font-black text-4xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">${total.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className={`w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all duration-300 ease-in-out transform ${cart.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-600 active:scale-[0.98] text-white shadow-xl shadow-fuchsia-500/30'}`}>
            <CreditCard className="w-6 h-6"/> Confirmar Venta
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white/20 p-1.5 rounded-full"><CheckCircle2 className="w-6 h-6"/></div>
          <span className="font-bold text-lg tracking-wide">{toast}</span>
        </div>
      )}
    </div>
  );
}

function AdminView({ products, sales, reloadData, loading }) {
  const [tab, setTab] = useState('PRODUCTS');
  const [timeFilter, setTimeFilter] = useState('HOY');
  
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
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl w-max shadow-sm border border-slate-200 overflow-x-auto max-w-full">
          {['HOY', 'SEMANA', 'MES', 'AÑO', 'SIEMPRE'].map(f => (
            <button key={f} onClick={() => setTimeFilter(f)} className={`px-5 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${timeFilter === f ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md transform scale-105' : 'text-slate-500 hover:bg-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={`Ventas (${timeFilter})`} value={`$${tFilteredSales.toFixed(2)}`} icon={<Clock className="w-6 text-white"/>} gr="from-blue-500 to-cyan-400" />
          <StatCard title={`Ganancia (${timeFilter})`} value={`$${tFilteredProfit.toFixed(2)}`} icon={<TrendingUp className="w-6 text-white"/>} gr="from-emerald-500 to-teal-400" />
          <StatCard title="Ventas Históricas" value={`$${tSales.toFixed(2)}`} icon={<DollarSign className="w-6 text-white"/>} gr="from-violet-500 to-fuchsia-400" />
          <StatCard title="Ganancia Histórica" value={`$${tProfit.toFixed(2)}`} icon={<Sparkles className="w-6 text-white"/>} gr="from-amber-400 to-orange-400" />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white flex-1 overflow-hidden flex flex-col mt-2">
        <div className="flex gap-3 p-4 bg-slate-100/50 border-b border-slate-100">
          <button onClick={() => setTab('PRODUCTS')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${tab === 'PRODUCTS' ? 'bg-white text-violet-600 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'}`}>Gestión de Inventario</button>
          <button onClick={() => setTab('SALES')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${tab === 'SALES' ? 'bg-white text-violet-600 shadow-md transform scale-[1.02]' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'}`}>Historial de Ventas</button>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          {tab === 'PRODUCTS' ? <ProductsManager products={products} reloadData={reloadData}/> : <SalesHistory sales={filteredSalesInfo}/>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gr }) {
  return (
    <div className="p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gr} shadow-lg text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function ProductsManager({ products, reloadData }) {
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
        <h3 className="font-black text-xl text-slate-800">Directorio de Productos</h3>
        {!formVis && <button onClick={() => setFormVis(true)} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex gap-2 items-center shadow-lg shadow-violet-500/30 transform active:scale-95 transition-all"><Plus className="w-5 h-5"/> Agregar Producto</button>}
      </div>

      {formVis && (
        <form onSubmit={handleSave} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 border border-violet-100 shadow-xl shadow-fuchsia-100/50 animate-in slide-in-from-top-4 duration-300">
          <div className="lg:col-span-6 flex justify-between items-center pb-2">
            <h4 className="font-black text-violet-800 flex items-center gap-2"><Edit className="w-5 h-5"/> {editId ? 'Editando Producto' : 'Nuevo Producto'}</h4>
            <button type="button" onClick={resetForm} className="p-2 bg-white shadow hover:bg-rose-50 text-rose-500 border border-slate-100 rounded-xl transition-all"><X className="w-5 h-5"/></button>
          </div>
          <input required placeholder="Nombre descriptivo" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} className="lg:col-span-2 border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          <input placeholder="Cod. Barras (Opcional)" value={form.codigo_barras} onChange={e=>setForm({...form, codigo_barras: e.target.value})} className="border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          <input placeholder="Categoría" value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value})} className="border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          <input required type="number" placeholder="📦 Stock" min="0" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          <input required type="number" placeholder="📉 Costo ($)" step="0.01" min="0" value={form.costo} onChange={e=>setForm({...form, costo: e.target.value})} className="border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          <input required type="number" placeholder="📈 Venta ($)" step="0.01" min="0" value={form.precio} onChange={e=>setForm({...form, precio: e.target.value})} className="border-2 border-slate-200 focus:border-violet-500 bg-white p-3.5 rounded-xl outline-none transition-colors font-medium text-slate-700" />
          
          <div className="lg:col-span-6 flex justify-end gap-3 items-center mt-2">
            <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-800/20 active:scale-95 transition-all tracking-wide">Guardar Cambios</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-auto border border-slate-100 rounded-2xl bg-white shadow-inner">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b sticky top-0 z-10 text-slate-500 uppercase text-[11px] font-black tracking-wider">
            <tr><th className="p-4">Producto / Código</th><th className="p-4">Stock</th><th className="p-4">Costo</th><th className="p-4">Venta</th><th className="p-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4">
                  <p className="font-bold text-slate-800 text-base">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-500 bg-fuchsia-100 px-2.5 py-1 rounded-md">{p.categoria || 'Variado'}</span>
                    {p.codigo_barras && <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1"><ScanBarcode className="w-3 h-3"/> {p.codigo_barras}</span>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${p.stock <= 5 ? (p.stock === 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-orange-50 text-orange-600 border-orange-200') : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-400">${p.costo}</td>
                <td className="p-4 font-black text-slate-800 text-lg">${p.precio}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className="p-2 text-violet-600 hover:bg-violet-100 rounded-xl transition-colors"><Edit className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
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

function SalesHistory({ sales }) {
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
        <button onClick={() => setDetail(null)} className="mb-4 self-start px-4 py-2 bg-white shadow-sm border border-slate-200 hover:border-violet-300 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-slate-600 text-sm"><ArrowLeft className="w-4 h-4"/> Volver al historial</button>
        <TicketModal detail={detail} onClose={() => setDetail(null)} successMode={false} />
     </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><AlertCircle className="text-fuchsia-500 w-6 h-6"/> Movimientos</h3>
        <button onClick={exportToExcel} disabled={sales.length === 0} className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl font-bold text-sm flex gap-2 items-center shadow-sm transition-all"><FileDown className="w-4 h-4"/> Exportar Excel / CSV</button>
      </div>
      <div className="flex-1 overflow-auto border border-slate-100 rounded-3xl bg-white shadow-inner">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 text-slate-500 text-[11px] font-black uppercase tracking-wider">
            <tr><th className="p-5">Fecha Timestamp</th><th className="p-5">Tickets</th><th className="p-5">Total</th><th className="p-5">Ganancia</th><th className="p-5 text-center">Acción</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-violet-50/30 transition-colors group cursor-pointer" onClick={()=>setDetail(s)}>
                <td className="p-5 font-bold text-slate-600">{new Date(s.fecha).toLocaleString()}</td>
                <td className="p-5"><span className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-full text-xs">{s.items.reduce((a,b)=>a+b.cantidad, 0)} arts.</span></td>
                <td className="p-5 font-black text-slate-800 text-lg">${s.total}</td>
                <td className="p-5 font-black text-emerald-500 text-lg">+${s.ganancia}</td>
                <td className="p-5 text-center"><button className="text-violet-600 text-xs font-black uppercase tracking-wider bg-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-all px-4 py-2.5 rounded-xl shadow-sm">Ver Ticket</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TicketModal({ detail, onClose, successMode }) {
  const handlePrint = () => window.print();
  const handleWhatsApp = () => {
    const phone = prompt('Ingresa el celular del cliente con código de país (Ej: 525512345678):');
    if (!phone) return;
    let msg = `*VantaPOS - Ticket de Compra* \n\n*Fecha:* ${new Date(detail.fecha).toLocaleString()}\n\n*Detalle:*\n`;
    detail.items.forEach(i => { msg += `👉 ${i.cantidad}x ${i.nombre} - $${(i.precioUnitario * i.cantidad).toFixed(2)}\n`; });
    msg += `\n*TOTAL A PAGAR: $${detail.total}*\n\n¡Gracias por su preferencia!`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-auto border border-slate-200">
      <div id="ticket-print-area" className="p-8 bg-white text-slate-900 border-b border-dashed border-slate-300 relative">
        {successMode && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white rounded-full p-2 shadow-lg no-print"><CheckCircle2 className="w-8 h-8"/></div>}
        <div className="text-center mb-6 pt-4">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-1">VantaPOS</h2>
          <p className="text-xs font-bold text-slate-500 uppercase">Comprobante de Venta</p>
          <p className="text-sm font-semibold text-slate-600 mt-2">{new Date(detail.fecha).toLocaleString()}</p>
        </div>
        
        <table className="w-full text-sm text-left mb-6">
          <thead className="border-b-2 border-slate-800 font-bold uppercase text-xs">
            <tr><th className="py-2">Cant</th><th className="py-2">Item</th><th className="py-2 text-right">Sub</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {detail.items.map((i, x) => (
               <tr key={x}><td className="py-3 font-black text-slate-700">{i.cantidad}</td><td className="py-3 font-semibold text-slate-800">{i.nombre}</td><td className="py-3 text-right font-black text-slate-900">${(i.cantidad * i.precioUnitario).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end border-t-2 border-slate-800 pt-4">
          <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">Total:</span>
          <span className="font-black text-3xl text-slate-900">${detail.total}</span>
        </div>
        <p className="text-center text-xs font-bold text-slate-400 mt-8 mb-2 uppercase tracking-wide">¡Gracias por su compra!</p>
      </div>

      <div className="p-6 bg-slate-50 flex flex-col gap-3 no-print">
        <button onClick={handlePrint} className="w-full py-3.5 rounded-xl font-black bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"><Printer className="w-5 h-5"/> Imprimir Ticket</button>
        <button onClick={handleWhatsApp} className="w-full py-3.5 rounded-xl font-black bg-[#25D366] hover:bg-[#1ebd5b] text-white shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"><MessageCircle className="w-5 h-5"/> Enviar por WhatsApp</button>
        {successMode && <button onClick={onClose} className="w-full mt-2 py-3.5 rounded-xl font-bold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all">Cerrar y Nueva Venta</button>}
      </div>
    </div>
  );
}
