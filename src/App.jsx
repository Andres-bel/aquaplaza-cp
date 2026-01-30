import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, FileText, Copy, Check, Calculator, 
  User, Briefcase, Search, ArrowRight, Package, X,
  Sparkles, Percent, Wifi, RefreshCw, Loader2,
  Save, FolderOpen, RotateCcw, Clock, Download, Share, 
  Image as ImageIcon, Send, Share2, Camera, ChevronLeft, ChevronRight,
  Scan, FileSearch
} from 'lucide-react';

// --- НАСТРОЙКИ ---
const APP_VERSION = "8.3 (Sample Price)"; 
const API_URL = ''; 
const ITEMS_PER_PAGE = 6; 

// --- ВСТРОЕННЫЕ СТИЛИ (CSS) ---
const INTERNAL_STYLES = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
    background-color: #f3f4f6; 
    color: #1f2937; 
    margin: 0; 
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
    -webkit-font-smoothing: antialiased; 
    -webkit-tap-highlight-color: transparent;
  }
  .app-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); margin-bottom: 12px; border: 1px solid #f3f4f6; }
  .app-card-sm { padding: 12px; }
   
  .app-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-size: 14px; outline: none; transition: border-color 0.2s; color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
  .app-input:focus { border-color: #3b82f6; background: white; }
  .app-input::placeholder { color: #9ca3af; -webkit-text-fill-color: #9ca3af; }
   
  .app-input-ghost { background: transparent; border: none; padding: 0; margin: 0; width: 100%; outline: none; color: #000000 !important; }
   
  .app-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; box-sizing: border-box; }
  .app-btn:active { transform: scale(0.98); }
  .app-btn-primary { background-color: #2563eb; color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
  .app-btn-secondary { background-color: white; color: #374151; border: 1px solid #e5e7eb; }
  .app-btn-dashed { background-color: white; color: #2563eb; border: 1px dashed #93c5fd; }
  .app-btn-icon { padding: 8px; border-radius: 8px; color: #9ca3af; background: transparent; border: none; cursor: pointer; }
   
  .flex-between { display: flex; justify-content: space-between; align-items: center; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  .text-bold { font-weight: 700; }
  .text-gray { color: #6b7280; }
  .text-blue { color: #2563eb; }
  .text-orange { color: #f97316; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  
  #camera-input { display: none; }
  
  .camera-overlay { position: fixed; inset: 0; z-index: 100; background: black; display: flex; flex-direction: column; }
  .camera-video { width: 100%; height: 100%; object-fit: cover; }
  .camera-controls { position: absolute; bottom: 0; left: 0; right: 0; padding: 30px; padding-bottom: calc(30px + env(safe-area-inset-bottom)); display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
  .shutter-btn { width: 70px; height: 70px; border-radius: 50%; background: white; border: 4px solid rgba(255,255,255,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
  .shutter-btn:active { transform: scale(0.9); }
`;

// Загрузчик скриптов
const loadScript = (srcs, id) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const sources = Array.isArray(srcs) ? srcs : [srcs];
    const tryLoad = (index) => {
      if (index >= sources.length) return reject(new Error('Все источники скрипта недоступны'));
      const script = document.createElement('script');
      script.id = id;
      script.src = sources[index];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); tryLoad(index + 1); };
      document.head.appendChild(script);
    };
    tryLoad(0);
  });
};

const ProductRow = ({ item, onUpdate, onRemove, index }) => {
  const finalPrice = item.price * (1 - (item.discount || 0) / 100);
  const totalItemSum = finalPrice * item.qty;
  return (
    <div className="app-card app-card-sm animate-fade-in">
      <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1, marginRight: '8px' }}>
           {item.sku && (
             <span className="text-xs text-blue text-bold" style={{ backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
               #{item.sku}
               {item.isAiGenerated && <Sparkles size={8} />}
             </span>
           )}
           <textarea rows={item.name.length > 30 ? 2 : 1} placeholder="Название товара..." value={item.name} onChange={(e) => onUpdate(index, 'name', e.target.value)} className="app-input-ghost text-sm text-bold" style={{ color: '#000000', resize: 'none', minHeight: '24px' }} />
        </div>
        <button onClick={() => onRemove(index)} className="app-btn-icon"><Trash2 size={18} /></button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', padding: '8px', borderRadius: '8px' }}>
        <div style={{ flex: 1 }}><span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Цена</span><input type="number" value={item.price === 0 ? '' : item.price} onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)} placeholder="0" className="app-input-ghost text-bold" /></div>
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
        <div style={{ width: '50px', textAlign: 'center' }}><span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Скид%</span><input type="number" placeholder="-" value={item.discount || ''} onChange={(e) => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)} className="app-input-ghost text-bold text-orange" style={{ textAlign: 'center' }} /></div>
        <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
        <div style={{ width: '40px', textAlign: 'center' }}><span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Шт</span><input type="number" value={item.qty} onChange={(e) => onUpdate(index, 'qty', parseInt(e.target.value) || 1)} className="app-input-ghost text-bold" style={{ textAlign: 'center' }} /></div>
        <div style={{ minWidth: '70px', textAlign: 'right', paddingLeft: '8px', borderLeft: '1px solid transparent' }}><span className="text-xs text-gray" style={{ display: 'block', marginBottom: '2px' }}>Сумма</span><div className="text-sm text-bold text-blue">{totalItemSum.toLocaleString()}</div></div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // OCR States
  const [showCamera, setShowCamera] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(''); // Текстовый статус для UI
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
   
  const [currentPage, setCurrentPage] = useState(0);
   
  const [clientName, setClientName] = useState('');
  const [managerName, setManagerName] = useState('Менеджер Aquaplaza');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [items, setItems] = useState([{ sku: '32843000', name: 'Смеситель для кухни Grohe (Пример)', price: 12400, qty: 1, discount: 0, isAiGenerated: true }]);
  const [savedCPs, setSavedCPs] = useState([]);
  
  const receiptRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    try {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = INTERNAL_STYLES;
      document.head.appendChild(styleTag);
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      try { tg.ready(); tg.expand(); if (tg.setHeaderColor) tg.setHeaderColor('#ffffff'); } catch (e) {}
      if (tg.initDataUnsafe?.user?.first_name) setManagerName(`${tg.initDataUnsafe.user.first_name} (Aquaplaza)`);
    }
    try {
      const loadedHistory = localStorage.getItem('aquaplaza_history');
      if (loadedHistory) setSavedCPs(JSON.parse(loadedHistory)); 
    } catch (e) {}
    try {
      const draft = localStorage.getItem('aquaplaza_draft');
      if (draft) {
        const d = JSON.parse(draft);
        if (d.items?.length > 0) { setItems(d.items); setClientName(d.clientName || ''); setGlobalDiscount(d.globalDiscount || 0); if (d.managerName) setManagerName(d.managerName); }
      }
    } catch (e) {}
    return () => stopCamera();
  }, []);

  useEffect(() => {
    const draft = { items, clientName, globalDiscount, managerName };
    try { localStorage.setItem('aquaplaza_draft', JSON.stringify(draft)); } catch(e) {}
  }, [items, clientName, globalDiscount, managerName]);

  const generateCPText = () => {
    const date = new Date().toLocaleDateString('ru-RU');
    let text = `🌊 *Aquaplaza* | КП от ${date}\n`;
    if (clientName) text += `👤 Клиент: ${clientName}\n\n`;
    items.forEach((item, i) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      text += `${i + 1}. ${item.name}\n`;
      if (item.sku) text += `   Арт: ${item.sku}\n`;
      text += `   ${item.qty} шт × ${itemPrice.toLocaleString()} ₽ = ${(itemPrice * item.qty).toLocaleString()} ₽\n\n`;
    });
    text += `------------------\n`;
    const sub = items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0);
    const tot = sub * (1 - globalDiscount/100);
    text += `💎 *ИТОГО: ${tot.toLocaleString()} ₽*\n\n`;
    text += `📞 Ваш менеджер: ${managerName}`;
    return text;
  };

  // --- ЗАГРУЗКА ---
  const ensureTesseract = async () => {
    if (window.Tesseract) return;
    setOcrStatus('Подкл. модули...');
    await loadScript([
      "https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js",
      "https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js"
    ], "tesseract-script");
  };

  const ensureHtml2Canvas = async () => {
    if (window.html2canvas) return;
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas-script");
  };

  // --- КАМЕРА ---
  const startCamera = async () => {
    try {
      setIsProcessingOcr(true);
      await ensureTesseract();
      setOcrStatus('Камера...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      setOcrStatus('');
      setIsProcessingOcr(false);
    } catch (err) {
      console.error(err);
      setIsProcessingOcr(false);
      alert("Камера недоступна. Выберите фото из галереи.");
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1200 / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();
    canvas.toBlob(blob => processOcr(blob), 'image/jpeg', 0.7);
  };

  const processOcr = async (imageFile) => {
    if (!imageFile) return;
    setIsProcessingOcr(true);
    
    try {
      await ensureTesseract();
      setOcrStatus('Запуск OCR...');
      
      const Tesseract = window.Tesseract;
      
      const worker = await Tesseract.createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrStatus(`Читаю текст: ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'loading tesseract core') {
            setOcrStatus('Гружу ядро...');
          } else if (m.status.includes('loading language')) {
            setOcrStatus('Качаю словарь...');
          } else {
            setOcrStatus(m.status);
          }
        }
      });

      await worker.loadLanguage('rus+eng');
      await worker.initialize('rus+eng');
      
      const { data: { text } } = await worker.recognize(imageFile);
      console.log("OCR Result:", text);
      await worker.terminate();

      // --- АНАЛИЗ ТЕКСТА ---
      
      // 1. Поиск ВСЕХ цен
      const priceRegex = /(\d[\d\s]*[.,]?\d*)\s*(?:руб|rub|₽)/gi;
      const prices = [];
      let match;
      while ((match = priceRegex.exec(text)) !== null) {
         // Чистим цену от пробелов и меняем запятую на точку
         const cleanPrice = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
         if (!isNaN(cleanPrice) && cleanPrice > 0) {
            prices.push(cleanPrice);
         }
      }

      // Определяем, есть ли слово "образца"
      const isSample = /образца/i.test(text);
      
      let foundPrice = 0;
      let calculatedDiscount = 0;

      if (isSample && prices.length >= 2) {
          // Если это ценник образца и нашли 2+ цены:
          // Сортируем: Большая - это старая цена, Меньшая - это цена образца
          prices.sort((a,b) => b - a); // По убыванию
          const originalPrice = prices[0];
          const samplePrice = prices[prices.length - 1]; // Самая низкая найденная
          
          foundPrice = originalPrice;
          // Считаем скидку, чтобы получить samplePrice
          calculatedDiscount = Math.round((1 - samplePrice/originalPrice) * 100);
      } else if (prices.length > 0) {
          // Если обычный ценник, берем первую (обычно верхнюю) или самую большую
          foundPrice = prices[0];
      }

      // 2. Поиск артикула
      const skuMatch = text.match(/(?:Артикул|Арт)[:.\s]*([A-Z0-9]{4,15})/i) || 
                       text.match(/\b([A-Z]{2}\d{4}[A-Z]{2})\b/); 
      const codeMatch = text.match(/(?:Код|Code)[:.\s]*(\d{5,10})/i) ||
                        text.match(/\b00(\d{6})\b/); 

      const foundSku = skuMatch ? skuMatch[1] : (codeMatch ? codeMatch[1] : '');

      // 3. ПОИСК НАЗВАНИЯ (Исправленная логика: после слова "collection")
      const lines = text.split('\n');
      let nameStartIndex = 0;
      const collectionIndex = lines.findIndex(l => l.toLowerCase().includes('collection'));
      if (collectionIndex !== -1) {
        nameStartIndex = collectionIndex + 1; // Начинаем поиск СЛЕДУЮЩЕЙ строкой
      }

      const cleanLines = lines.slice(nameStartIndex).filter(line => {
        const l = line.trim().toLowerCase();
        if (l.length < 3) return false;
        if (l.includes('aqua plaza')) return false; 
        if (l.includes('артикул')) return false;
        if (l.includes('код товара')) return false;
        if (l.includes('ooo')) return false;
        if (l.includes('гармония')) return false;
        if (/\d{2}\.\d{2}\.\d{4}/.test(l)) return false; 
        // Если строка содержит найденную цену - пропускаем
        if (prices.some(p => l.includes(p.toString()) || l.replace(/\s/g,'').includes(p.toString()))) return false;
        if (/^\d+$/.test(l)) return false; 
        if (l.includes('руб') || l.includes('rub') || l.includes('₽')) return false;
        return true;
      });

      let foundName = cleanLines.slice(0, 3).join(' ').replace(/\s+/g, ' ').trim();
      if (!foundName) foundName = foundSku ? `Товар ${foundSku}` : "Товар с фото";

      // 4. РЕЗУЛЬТАТ
      if (foundPrice > 0 || foundSku.length > 3 || (foundName && foundName !== "Товар с фото")) {
        const msg = `Найдено:\n📦 ${foundName.substring(0, 50)}...\n💰 ${foundPrice.toLocaleString()} ₽ ${calculatedDiscount > 0 ? `(-${calculatedDiscount}%)` : ''}\n🔖 ${foundSku}\n\nДобавить?`;
        if (window.confirm(msg)) {
          setItems([...items, { sku: foundSku, name: foundName, price: foundPrice, qty: 1, discount: calculatedDiscount, isAiGenerated: true }]);
          setShowSearchModal(false);
        }
      } else {
        alert("Текст не распознан. Попробуйте четче.");
      }

    } catch (err) {
      console.error(err);
      alert("Ошибка OCR. Проверьте интернет.");
    } finally {
      setIsProcessingOcr(false);
      setOcrStatus('');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
  const handleShowImageForScreenshot = async () => {
    if (!receiptRef.current) return;
    try {
      await ensureHtml2Canvas();
      setIsGeneratingImage(true);
      const canvas = await window.html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      setGeneratedImage(canvas.toDataURL('image/png'));
      setShowImageModal(true);
    } catch (e) { alert("Ошибка фото"); } finally { setIsGeneratingImage(false); }
  };

  const handleSaveToHistory = () => {
    if (!clientName) { alert('Введите имя клиента'); return; }
    const sub = items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0);
    const newCP = { id: Date.now(), date: new Date().toLocaleDateString(), clientName, managerName, items, globalDiscount, total: sub * (1 - globalDiscount/100) };
    setSavedCPs([newCP, ...savedCPs]);
    try { localStorage.setItem('aquaplaza_history', JSON.stringify([newCP, ...savedCPs])); } catch(e){}
    alert('Сохранено');
  };

  return (
    <div className="min-h-screen">
      <input type="file" accept="image/*" id="camera-input" ref={cameraInputRef} onChange={(e) => e.target.files?.[0] && processOcr(e.target.files[0])} />

      {showCamera && (
        <div className="camera-overlay animate-fade-in">
          <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
          <div style={{position:'absolute',top:20,right:20,zIndex:101}}>
            <button onClick={stopCamera} style={{background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',padding:10}}><X color="white"/></button>
          </div>
          <div className="camera-controls">
            <button onClick={() => {cameraInputRef.current?.click(); stopCamera();}} style={{background:'transparent',border:'none',color:'white',display:'flex',flexDirection:'column',alignItems:'center'}}>
               <ImageIcon size={28}/><span style={{fontSize:10}}>Галерея</span>
            </button>
            <button onClick={takePhoto} className="shutter-btn"></button>
            <div style={{width:28}}></div>
          </div>
        </div>
      )}

      <div style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', padding:'16px', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:20 }}>
        <div className="flex-between" style={{ maxWidth:'480px', margin:'0 auto' }}>
          <h1 className="text-bold" style={{ fontSize:'18px' }}>КП Менеджер <span style={{fontSize:10,color:'#9ca3af'}}>{APP_VERSION}</span></h1>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setShowHistoryModal(true)} style={{ padding:8, background:'#f3f4f6', borderRadius:10, border:'none' }}><FolderOpen size={20} color="#4b5563"/></button>
            <div style={{ background:'#f3f4f6', padding:4, borderRadius:10, display:'flex' }}>
              {['editor', 'preview'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'6px 12px', borderRadius:8, border:'none', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#2563eb' : '#6b7280', boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>{tab === 'editor' ? 'Ред.' : 'Вид'}</button>))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'480px', margin:'0 auto', padding:'16px' }}>
        {activeTab === 'editor' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="app-card">
               <div style={{ marginBottom:12 }}><div className="text-xs text-bold text-gray" style={{ marginBottom:4 }}>КЛИЕНТ</div><input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Имя" className="app-input" /></div>
               <div><div className="text-xs text-bold text-gray" style={{ marginBottom:4 }}>МЕНЕДЖЕР</div><input value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Имя" className="app-input" /></div>
            </div>
            
            <div>
              {items.map((item, index) => (
                <ProductRow key={index} item={item} index={index} 
                  onUpdate={(idx, f, v) => { const n=[...items]; n[idx][f]=v; setItems(n); }} 
                  onRemove={(idx) => setItems(items.filter((_, i) => i !== idx))} 
                />
              ))}
              <button onClick={() => setShowSearchModal(true)} className="app-btn app-btn-dashed" style={{ marginTop:12 }}><Search size={16}/> Добавить товар</button>
            </div>

            <div className="app-card">
              <div className="flex-between"><span className="text-sm text-gray">Общая скидка</span><div style={{display:'flex',alignItems:'center',background:'#fff7ed',padding:'0 8px',borderRadius:8}}><input type="number" value={globalDiscount} onChange={(e)=>setGlobalDiscount(parseFloat(e.target.value)||0)} className="app-input-ghost text-bold text-orange" style={{width:30,textAlign:'right'}} /><span className="text-orange">%</span></div></div>
              <div className="flex-between" style={{marginTop:12,paddingTop:12,borderTop:'1px solid #f3f4f6'}}><span className="text-bold">Итого</span><span style={{fontSize:20,fontWeight:800}}>{(items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0) * (1 - globalDiscount/100)).toLocaleString()} ₽</span></div>
            </div>
            
            <div style={{ display:'flex', gap:8 }}>
               <button onClick={handleSaveToHistory} className="app-btn app-btn-secondary" style={{flex:1}}><Save size={16}/> Сохранить</button>
               <button onClick={() => {if(window.confirm('Очистить?')) {setClientName('');setItems([]);}}} className="app-btn app-btn-secondary"><RotateCcw size={16}/></button>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="animate-fade-in">
             <div ref={receiptRef} className="app-card" style={{padding:0,overflow:'hidden',minHeight:400}}>
                <div style={{background:'#2563eb',padding:24,color:'white'}}>
                   <div style={{opacity:0.8,fontSize:12,textTransform:'uppercase',marginBottom:16}}>Коммерческое предложение</div>
                   <div style={{fontSize:32,fontWeight:'bold'}}>{(items.reduce((s, i) => s + (i.price * (1 - (i.discount||0)/100) * i.qty), 0) * (1 - globalDiscount/100)).toLocaleString()} ₽</div>
                </div>
                <div style={{padding:20}}>
                   <div className="flex-between" style={{marginBottom:24,borderBottom:'1px solid #f3f4f6',paddingBottom:16}}>
                      <div><div className="text-xs text-gray">КЛИЕНТ</div><div className="text-bold">{clientName}</div></div>
                      <div style={{textAlign:'right'}}><div className="text-xs text-gray">МЕНЕДЖЕР</div><div className="text-bold">{managerName}</div></div>
                   </div>
                   {items.map((item, i) => (
                     <div key={i} className="flex-between" style={{marginBottom:12,alignItems:'flex-start'}}>
                       <div style={{flex:1,marginRight:12}}>
                         <div style={{fontSize:14,fontWeight:600}}>{item.name}</div>
                         {item.sku && <div style={{fontSize:10,color:'#9ca3af'}}>Арт: {item.sku}</div>}
                       </div>
                       <div style={{textAlign:'right'}}>
                         <div style={{fontWeight:600}}>{(item.price * (1-(item.discount||0)/100)).toLocaleString()} ₽</div>
                         <div style={{fontSize:10,color:'#9ca3af'}}>{item.qty} шт</div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
             <div style={{marginTop:16,display:'grid',gap:12,gridTemplateColumns:'1fr 1fr'}}>
                <button onClick={handleShowImageForScreenshot} className="app-btn app-btn-primary" disabled={isGeneratingImage}>{isGeneratingImage ? <Loader2 className="animate-spin"/> : <Camera/>} Скриншот</button>
                <button onClick={() => window.open(`https://t.me/share/url?text=${encodeURIComponent(generateCPText())}`)} className="app-btn app-btn-secondary"><Send/> Текст</button>
             </div>
          </div>
        )}
      </div>

      {/* SEARCH MODAL */}
      {showSearchModal && (
        <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end'}}>
           <div className="animate-fade-in" style={{background:'white',width:'100%',borderRadius:'20px 20px 0 0',padding:20}}>
              <div className="flex-between" style={{marginBottom:16}}>
                 <h3 className="text-bold">Добавить товар</h3>
                 <button onClick={() => setShowSearchModal(false)} className="app-btn-icon"><X/></button>
              </div>
              <div style={{position:'relative',marginBottom:12}}>
                 <Search style={{position:'absolute',left:12,top:12,color:'#9ca3af'}} size={18}/>
                 <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Артикул" className="app-input" style={{paddingLeft:40,paddingRight:100}} />
                 <button onClick={startCamera} className="app-btn-icon" style={{position:'absolute',right:4,top:4,bottom:4,width:'auto',padding:'0 12px',color:'#2563eb'}}>
                    {isProcessingOcr ? <span style={{fontSize:10,display:'flex',alignItems:'center',gap:4}}><Loader2 className="animate-spin" size={14}/> {ocrStatus || '...'}</span> : <Scan size={20}/>}
                 </button>
              </div>
              <button onClick={() => {setItems([...items, {sku:'', name:'Новый товар', price:0, qty:1}]); setShowSearchModal(false);}} className="app-btn app-btn-secondary">Вручную</button>
           </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end'}}>
           <div className="animate-fade-in" style={{background:'white',width:'100%',height:'80vh',borderRadius:'20px 20px 0 0',display:'flex',flexDirection:'column'}}>
              <div className="flex-between" style={{padding:20,borderBottom:'1px solid #f3f4f6'}}>
                 <h3 className="text-bold">История</h3>
                 <button onClick={() => setShowHistoryModal(false)} className="app-btn-icon"><X/></button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:16,background:'#f9fafb'}}>
                 {savedCPs.map(cp => (
                   <div key={cp.id} onClick={()=>{if(window.confirm('Загрузить?')){setClientName(cp.clientName);setItems(cp.items);setGlobalDiscount(cp.globalDiscount);setShowHistoryModal(false);}}} className="app-card" style={{marginBottom:12}}>
                      <div className="flex-between"><div className="text-bold">{cp.clientName}</div><div className="text-blue text-bold">{cp.total.toLocaleString()} ₽</div></div>
                      <div className="text-xs text-gray">{cp.date} • {cp.items.length} поз.</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {showImageModal && generatedImage && (
        <div style={{position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,0.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowImageModal(false)}>
           <img src={generatedImage} style={{maxWidth:'90%',maxHeight:'80vh',borderRadius:8}}/>
           <div style={{color:'white',marginTop:20}}>Сделайте скриншот</div>
        </div>
      )}
    </div>
  );
}
