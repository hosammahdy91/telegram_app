"use client";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

type Lang = "ar" | "en" | "fr" | "es";
type Tab = "send" | "bridge" | "swap";
type TxRecord = {
  id: number;
  type: string;
  status: string;
  amount: string;
  token: string;
  txHash?: string;
  explorerUrl?: string;
  amountOut?: string;
  tokenOut?: string;
  time: string;
};

const ARC_LOGO = "https://pbs.twimg.com/profile_images/1955238194443849732/sHyVRItm_400x400.jpg";
const CIRCLE_LOGO = "https://www.circle.com/hubfs/Brand/Circle-favicon.png";

const translations: Record<Lang, any> = {
  ar: {
    dir: "rtl",
    title: "Velox",
    subtitle: "بوابتك للتحويلات الفورية",
    network: "Arc Testnet",
    notConnected: "يرجى ربط محفظتك أولاً",
    tabs: { send: "إرسال", bridge: "جسر", swap: "تحويل" },
    stats: { total: "إجمالي العمليات", success: "ناجحة", failed: "فاشلة" },
    send: { to: "عنوان المستقبل", amount: "المبلغ", token: "التوكن", btn: "إرسال", loading: "جاري الإرسال..." },
    bridge: { from: "من", to: "إلى", amount: "المبلغ (USDC)", btn: "نقل عبر الجسر", loading: "جاري النقل..." },
    swap: { from: "من", to: "إلى", amount: "المبلغ", btn: "تحويل", loading: "جاري التحويل..." },
    result: { success: "العملية نجحت!", view: "عرض المعاملة ←", received: "المبلغ المستقبَل" },
    history: { title: "سجل العمليات", empty: "لا توجد عمليات بعد", success: "نجح", failed: "فشل" },
    types: { send: "إرسال", bridge: "جسر", swap: "تحويل" },
  },
  en: {
    dir: "ltr",
    title: "Velox",
    subtitle: "Your Gateway to Instant Transfers",
    network: "Arc Testnet",
    notConnected: "Please connect your wallet first",
    tabs: { send: "Send", bridge: "Bridge", swap: "Swap" },
    stats: { total: "Total Operations", success: "Successful", failed: "Failed" },
    send: { to: "Recipient Address", amount: "Amount", token: "Token", btn: "Send", loading: "Sending..." },
    bridge: { from: "From", to: "To", amount: "Amount (USDC)", btn: "Bridge", loading: "Bridging..." },
    swap: { from: "From", to: "To", amount: "Amount", btn: "Swap", loading: "Swapping..." },
    result: { success: "Operation successful!", view: "View Transaction →", received: "Amount received" },
    history: { title: "Transaction History", empty: "No transactions yet", success: "Success", failed: "Failed" },
    types: { send: "Send", bridge: "Bridge", swap: "Swap" },
  },
  fr: {
    dir: "ltr",
    title: "Velox",
    subtitle: "Votre passerelle de transferts",
    network: "Arc Testnet",
    notConnected: "Veuillez connecter votre portefeuille",
    tabs: { send: "Envoyer", bridge: "Pont", swap: "Échanger" },
    stats: { total: "Total Opérations", success: "Réussies", failed: "Échouées" },
    send: { to: "Adresse", amount: "Montant", token: "Token", btn: "Envoyer", loading: "Envoi..." },
    bridge: { from: "De", to: "À", amount: "Montant (USDC)", btn: "Transférer", loading: "Transfert..." },
    swap: { from: "De", to: "À", amount: "Montant", btn: "Échanger", loading: "Échange..." },
    result: { success: "Opération réussie!", view: "Voir la transaction →", received: "Montant reçu" },
    history: { title: "Historique", empty: "Aucune transaction", success: "Réussi", failed: "Échoué" },
    types: { send: "Envoi", bridge: "Pont", swap: "Échange" },
  },
  es: {
    dir: "ltr",
    title: "Velox",
    subtitle: "Tu puerta a transferencias instantáneas",
    network: "Arc Testnet",
    notConnected: "Por favor conecta tu billetera",
    tabs: { send: "Enviar", bridge: "Puente", swap: "Intercambiar" },
    stats: { total: "Total Operaciones", success: "Exitosas", failed: "Fallidas" },
    send: { to: "Dirección", amount: "Monto", token: "Token", btn: "Enviar", loading: "Enviando..." },
    bridge: { from: "Desde", to: "Hacia", amount: "Monto (USDC)", btn: "Transferir", loading: "Transfiriendo..." },
    swap: { from: "Desde", to: "Hacia", amount: "Monto", btn: "Intercambiar", loading: "Intercambiando..." },
    result: { success: "¡Operación exitosa!", view: "Ver transacción →", received: "Monto recibido" },
    history: { title: "Historial", empty: "Sin transacciones", success: "Exitoso", failed: "Fallido" },
    types: { send: "Envío", bridge: "Puente", swap: "Intercambio" },
  },
};

const flags: Record<Lang, string> = { ar: "🇸🇦", en: "🇺🇸", fr: "🇫🇷", es: "🇪🇸" };

export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const [tab, setTab] = useState<Tab>("send");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<TxRecord[]>([]);

  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("1.00");
  const [sendToken, setSendToken] = useState("USDC");
  const [bridgeAmount, setBridgeAmount] = useState("1.00");
  const [swapTokenIn, setSwapTokenIn] = useState("EURC");
  const [swapTokenOut, setSwapTokenOut] = useState("USDC");
  const [swapAmount, setSwapAmount] = useState("1.00");

  const { isConnected } = useAccount();
  const t = translations[lang];

  function addToHistory(type: string, amount: string, token: string, data: any) {
    setHistory((prev) => [{
      id: Date.now(), type,
      status: data?.error ? t.history.failed : t.history.success,
      amount, token,
      txHash: data?.txHash,
      explorerUrl: data?.explorerUrl,
      amountOut: data?.amountOut,
      tokenOut: data?.tokenOut,
      time: new Date().toLocaleTimeString(),
    }, ...prev]);
  }

  async function handleSend() {
    if (!isConnected) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: sendTo, amount: sendAmount, token: sendToken }),
      });
      const data = await res.json();
      setResult(data);
      addToHistory(t.types.send, sendAmount, sendToken, data);
    } catch (e: any) {
      const err = { error: e?.message || "Unknown error" };
      setResult(err); addToHistory(t.types.send, sendAmount, sendToken, err);
    }
    setLoading(false);
  }

  async function handleBridge() {
    if (!isConnected) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/bridge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bridgeAmount }),
      });
      const data = await res.json();
      setResult(data);
      addToHistory(t.types.bridge, bridgeAmount, "USDC", data);
    } catch (e: any) {
      const err = { error: e?.message || "Unknown error" };
      setResult(err); addToHistory(t.types.bridge, bridgeAmount, "USDC", err);
    }
    setLoading(false);
  }

  async function handleSwap() {
    if (!isConnected) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/swap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenIn: swapTokenIn, tokenOut: swapTokenOut, amountIn: swapAmount }),
      });
      const data = await res.json();
      setResult(data);
      addToHistory(t.types.swap, swapAmount, swapTokenIn, data);
    } catch (e: any) {
      const err = { error: e?.message || "Unknown error" };
      setResult(err); addToHistory(t.types.swap, swapAmount, swapTokenIn, err);
    }
    setLoading(false);
  }

  const activeTabClass = (t2: Tab) => {
    if (tab !== t2) return "text-gray-400 hover:text-gray-600 border-b-2 border-transparent";
    const colors: Record<Tab, string> = {
      send: "text-blue-600 border-b-2 border-blue-600 bg-blue-50",
      bridge: "text-purple-600 border-b-2 border-purple-600 bg-purple-50",
      swap: "text-green-600 border-b-2 border-green-600 bg-green-50",
    };
    return colors[t2];
  };

  const btnClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-600 hover:bg-blue-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      green: "bg-green-600 hover:bg-green-700",
    };
    return `w-full ${colors[color]} disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir={t.dir}>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={CIRCLE_LOGO} alt="Circle" className="w-9 h-9 rounded-full shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="w-px h-7 bg-gray-200" />
            <img src={ARC_LOGO} alt="Arc" className="w-9 h-9 rounded-full shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Velox</h1>
            <p className="text-xs text-gray-400">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(Object.keys(flags) as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${lang === l ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                {flags[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <ConnectButton />
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {t.network}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <img src={CIRCLE_LOGO} alt="Circle" className="w-10 h-10 rounded-full bg-white p-1 shadow"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="text-white opacity-60 text-xl">×</div>
            <img src={ARC_LOGO} alt="Arc" className="w-10 h-10 rounded-full shadow"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div>
              <p className="text-xs opacity-70">Powered by</p>
              <p className="font-bold text-lg">Circle × Arc Network</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-xs opacity-70">{t.stats.total}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-300">{history.filter(h => h.status === t.history.success).length}</p>
              <p className="text-xs opacity-70">{t.stats.success}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-300">{history.filter(h => h.status === t.history.failed).length}</p>
              <p className="text-xs opacity-70">{t.stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Operations Panel */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(["send", "bridge", "swap"] as Tab[]).map((t2) => (
                <button key={t2} onClick={() => { setTab(t2); setResult(null); }}
                  className={`flex-1 py-4 text-sm font-medium transition-all ${activeTabClass(t2)}`}>
                  {t.tabs[t2]}
                </button>
              ))}
            </div>

            <div className="p-6">
              {!isConnected ? (
                <div className="text-center py-12">
                  <div className="flex justify-center items-center gap-4 mb-6">
                    <img src={CIRCLE_LOGO} alt="Circle" className="w-14 h-14 rounded-full shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-gray-300 text-2xl">×</span>
                    <img src={ARC_LOGO} alt="Arc" className="w-14 h-14 rounded-full shadow-md"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <p className="text-xl font-black text-gray-800 mb-1">Velox</p>
                  <p className="text-gray-500 mb-6 text-sm">{t.notConnected}</p>
                  <ConnectButton />
                </div>
              ) : (
                <>
                  {tab === "send" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.send.to}</label>
                        <input value={sendTo} onChange={(e) => setSendTo(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" placeholder="0x..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.send.amount}</label>
                          <input value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} type="number"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.send.token}</label>
                          <select value={sendToken} onChange={(e) => setSendToken(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                            <option>USDC</option><option>EURC</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={handleSend} disabled={loading} className={btnClass("blue")}>
                        {loading ? t.send.loading : t.send.btn}
                      </button>
                    </div>
                  )}

                  {tab === "bridge" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                          <p className="text-xs text-gray-400 mb-2">{t.bridge.from}</p>
                          <img src={ARC_LOGO} alt="Arc" className="w-8 h-8 rounded-full mx-auto mb-1 shadow"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <p className="font-semibold text-sm">Arc Testnet</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                          <p className="text-xs text-gray-400 mb-2">{t.bridge.to}</p>
                          <div className="w-8 h-8 bg-gray-800 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-sm font-bold shadow">Ξ</div>
                          <p className="font-semibold text-sm">Ethereum Sepolia</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.bridge.amount}</label>
                        <input value={bridgeAmount} onChange={(e) => setBridgeAmount(e.target.value)} type="number"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" />
                      </div>
                      <button onClick={handleBridge} disabled={loading} className={btnClass("purple")}>
                        {loading ? t.bridge.loading : t.bridge.btn}
                      </button>
                    </div>
                  )}

                  {tab === "swap" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.swap.from}</label>
                          <select value={swapTokenIn} onChange={(e) => setSwapTokenIn(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
                            <option>EURC</option><option>USDC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.swap.to}</label>
                          <select value={swapTokenOut} onChange={(e) => setSwapTokenOut(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
                            <option>USDC</option><option>EURC</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.swap.amount}</label>
                        <input value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} type="number"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50" />
                      </div>
                      <button onClick={handleSwap} disabled={loading} className={btnClass("green")}>
                        {loading ? t.swap.loading : t.swap.btn}
                      </button>
                    </div>
                  )}

                  {result && (
                    <div className={`mt-4 p-4 rounded-xl text-sm ${result.error ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
                      {result.error ? <p>❌ {result.error}</p> : (
                        <div className="space-y-1">
                          <p>✅ {t.result.success}</p>
                          {result.txHash && (
                            <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs break-all">
                              {t.result.view}
                            </a>
                          )}
                          {result.amountOut && <p>{t.result.received}: {result.amountOut} {result.tokenOut}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* History */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span>📋</span>
              <h2 className="font-semibold text-sm">{t.history.title}</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-gray-400 text-sm">{t.history.empty}</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div key={tx.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{tx.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.status === t.history.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{tx.amount} {tx.token}</p>
                    {tx.txHash && (
                      <a href={tx.explorerUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        {tx.txHash.slice(0, 10)}...
                      </a>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{tx.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}