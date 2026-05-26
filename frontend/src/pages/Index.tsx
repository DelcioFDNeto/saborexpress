
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center py-16 px-4 md:py-24 overflow-hidden">
        {/* Sleek Gradient Overlay for superior text contrast */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-950/95 via-gray-900/90 to-gray-950/95 backdrop-blur-[2px]"></div>
        
        {/* Dynamic ambient lights (glowing blobs in background) */}
        <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-sabor-dark/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-sabor-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <span className="inline-block text-xs md:text-sm font-bold tracking-widest text-sabor-primary uppercase bg-sabor-dark/40 border border-sabor-primary/20 px-4 py-2 rounded-full mb-6 backdrop-blur-md">
            🍴 Bem-vindo à experiência amazônica
          </span>

          {/* Premium Logo Container to prevent color overlay issue */}
          <div className="flex justify-center mb-6">
            <div className="inline-block bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-all duration-500 hover:shadow-sabor-primary/20">
              <img src="/logo-horizontal.png" alt="SaborExpress" className="h-12 sm:h-14 md:h-16 object-contain" />
            </div>
          </div>

          {/* Main Hero Header */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            O Sabor Autêntico da <span className="bg-linear-to-r from-sabor-primary to-emerald-400 bg-clip-text text-transparent">Amazônia</span> na sua Mesa
          </h1>
          
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Do Tacacá com jambu treme-treme à tradicional Maniçoba de sete dias. Peça agora e experimente o tempero inconfundível de Belém do Pará.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link 
              to="/cardapio" 
              className="w-full sm:w-auto px-8 py-4 bg-sabor-primary hover:bg-sabor-primary/90 text-sabor-dark font-extrabold text-lg rounded-2xl transition-all shadow-[0_8px_25px_rgba(74,222,128,0.25)] hover:shadow-[0_12px_35px_rgba(74,222,128,0.4)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Ver Nosso Cardápio
            </Link>
            <Link 
              to="/delivery" 
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-lg rounded-2xl transition-all border border-white/20 hover:border-white/35 backdrop-blur-sm hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Pedir no Delivery
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Por que escolher o <span className="text-sabor-dark">SaborExpress</span>?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base font-medium">
              Oferecemos uma experiência culinária inesquecível, unindo a riqueza dos ingredientes originais com um atendimento excepcional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Highlight 1 */}
            <div className="p-8 bg-gray-50 hover:bg-sabor-light/50 border border-gray-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-sabor-light text-sabor-dark rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ingredientes Originais</h3>
              <p className="text-gray-500 font-normal leading-relaxed">
                Jambu selecionado, tucupi artesanal e peixes frescos da Bacia Amazônica trazidos diretamente dos melhores produtores.
              </p>
            </div>

            {/* Highlight 2 */}
            <div className="p-8 bg-gray-50 hover:bg-amber-50/50 border border-gray-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Entrega Rápida e Quente</h3>
              <p className="text-gray-500 font-normal leading-relaxed">
                Nossa embalagem térmica exclusiva e sistema logístico ágil garantem que o seu prato chegue na temperatura perfeita para consumo.
              </p>
            </div>

            {/* Highlight 3 */}
            <div className="p-8 bg-gray-50 hover:bg-indigo-50/50 border border-gray-100 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tradição & Amor</h3>
              <p className="text-gray-500 font-normal leading-relaxed">
                Nossas receitas centenárias são preparadas com técnicas tradicionais para honrar a cultura e a história paraense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes Section */}
      <section className="py-16 md:py-24 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-sabor-dark uppercase tracking-wider block mb-2">⭐ Recomendado</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Especialidades da Casa</h2>
            </div>
            <Link to="/cardapio" className="mt-4 md:mt-0 text-sabor-dark text-sm md:text-base font-bold hover:text-sabor-dark/80 transition-colors flex items-center gap-2 group">
              Ver cardápio completo
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dish 1 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col group border border-gray-100">
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop" 
                  alt="Tacacá" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-sabor-primary text-sabor-dark text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 stroke-sabor-dark fill-none" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                  </svg>
                  <span>Mais Pedido</span>
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Tacacá Tradicional</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Clássico caldo de tucupi fervente com goma de mandioca, folhas generosas de jambu (que causam o famoso tremor) e camarões secos de excelente qualidade.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-2xl font-black text-sabor-dark">R$ 29,90</span>
                  <Link to="/delivery" className="px-4 py-2 bg-sabor-light text-sabor-dark hover:bg-sabor-primary hover:text-white font-bold text-sm rounded-xl transition-all">
                    Pedir Agora
                  </Link>
                </div>
              </div>
            </div>

            {/* Dish 2 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col group border border-gray-100">
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop" 
                  alt="Maniçoba" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-sabor-dark text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-md">
                  Tradição Centenária
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Maniçoba Paraense</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Feita com a maniva (folha da mandioca) cozida por 7 longos dias para eliminar a toxicidade, misturada com carnes nobres de porco e defumados. Acompanha arroz e farinha.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-2xl font-black text-sabor-dark">R$ 38,95</span>
                  <Link to="/delivery" className="px-4 py-2 bg-sabor-light text-sabor-dark hover:bg-sabor-primary hover:text-white font-bold text-sm rounded-xl transition-all">
                    Pedir Agora
                  </Link>
                </div>
              </div>
            </div>

            {/* Dish 3 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col group border border-gray-100">
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop" 
                  alt="Vatapá" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-md">
                  Delicioso ✨
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Vatapá Paraense</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Textura aveludada à base de pão, leite de coco, azeite de dendê e temperos típicos, coroado com camarões secos inteiros e servido bem quente. Acompanha arroz branco.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-2xl font-black text-sabor-dark">R$ 27,50</span>
                  <Link to="/delivery" className="px-4 py-2 bg-sabor-light text-sabor-dark hover:bg-sabor-primary hover:text-white font-bold text-sm rounded-xl transition-all">
                    Pedir Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-sabor-dark uppercase tracking-wider block mb-2">⚡ Rápido & Prático</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Como funciona o seu pedido</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative text-center p-6 rounded-3xl hover:bg-gray-50/50 transition-colors group">
              <span className="absolute top-0 right-4 md:right-8 text-7xl font-black text-gray-100 select-none group-hover:text-sabor-light/70 transition-colors z-0">01</span>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-sabor-light text-sabor-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Explore o Cardápio</h3>
                <p className="text-gray-500 text-sm">Navegue pelas opções típicas em nossa plataforma digital.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center p-6 rounded-3xl hover:bg-gray-50/50 transition-colors group">
              <span className="absolute top-0 right-4 md:right-8 text-7xl font-black text-gray-100 select-none group-hover:text-sabor-light/70 transition-colors z-0">02</span>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-sabor-light text-sabor-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Faça o Pedido</h3>
                <p className="text-gray-500 text-sm">Adicione os itens ao carrinho e informe o local de entrega.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center p-6 rounded-3xl hover:bg-gray-50/50 transition-colors group">
              <span className="absolute top-0 right-4 md:right-8 text-7xl font-black text-gray-100 select-none group-hover:text-sabor-light/70 transition-colors z-0">03</span>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-sabor-light text-sabor-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Preparo Premium</h3>
                <p className="text-gray-500 text-sm">Nossa cozinha prepara seu prato seguindo rigorosas normas.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative text-center p-6 rounded-3xl hover:bg-gray-50/50 transition-colors group">
              <span className="absolute top-0 right-4 md:right-8 text-7xl font-black text-gray-100 select-none group-hover:text-sabor-light/70 transition-colors z-0">04</span>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-sabor-light text-sabor-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Saboreie</h3>
                <p className="text-gray-500 text-sm">Receba em casa embalado na temperatura ideal e aproveite.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-sabor-dark uppercase tracking-wider block mb-2">💬 Depoimentos</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">O que dizem os nossos clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-6">
                  "O Tacacá do SaborExpress é o melhor que já comi em delivery! O jambu veio no ponto certo, tremendo bastante e o caldo super quente e saboroso. Super recomendo!"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 flex-row">
                <div className="w-12 h-12 rounded-full bg-sabor-light text-sabor-dark font-extrabold flex items-center justify-center shadow-inner shrink-0">AS</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Ana Silva</h4>
                  <span className="text-xs text-gray-400 font-medium block">Cliente Fiel - Belém/PA</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-6">
                  "A maniçoba é sensacional! É muito difícil encontrar uma maniçoba de verdade fora de época de Círio que seja tão bem cozida e saborosa. Vocês resgataram a tradição de forma brilhante."
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 flex-row">
                <div className="w-12 h-12 rounded-full bg-sabor-light text-sabor-dark font-extrabold flex items-center justify-center shadow-inner shrink-0">MC</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Marcos Costa</h4>
                  <span className="text-xs text-gray-400 font-medium block">Gourmet - Ananindeua/PA</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed mb-6">
                  "O sistema de delivery é muito rápido! O prato veio extremamente bem embalado, sem derramar uma gota de tucupi. E o sabor é 100% autêntico e de alta qualidade. Ganharam um cliente!"
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50 flex-row">
                <div className="w-12 h-12 rounded-full bg-sabor-light text-sabor-dark font-extrabold flex items-center justify-center shadow-inner shrink-0">JO</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Juliana Oliveira</h4>
                  <span className="text-xs text-gray-400 font-medium block">Turista - São Paulo/SP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden px-4">
        <div className="max-w-5xl mx-auto bg-linear-to-r from-sabor-dark to-slate-900 rounded-[2rem] relative overflow-hidden shadow-2xl p-8 md:p-12 text-center">
          {/* Subtle decoration dots */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-sabor-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-sabor-primary/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
              Pronto para saborear a <span className="text-sabor-primary">verdadeira</span> Amazônia?
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
              Crie a sua conta agora mesmo ou faça seu login para ter acesso a promoções exclusivas, cupons de desconto e entrega expressa!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-6 py-3.5 bg-sabor-primary hover:bg-sabor-primary/95 text-sabor-dark font-bold rounded-xl transition-all shadow-[0_5px_20px_rgba(74,222,128,0.2)] hover:-translate-y-0.5 text-center"
              >
                Criar Minha Conta Grátis
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm hover:-translate-y-0.5 text-center"
              >
                Entrar na Minha Conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Logo & Info */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/95 px-4 py-3 rounded-xl inline-block max-w-[200px] shadow-md">
              <img src="/logo-horizontal.png" alt="SaborExpress Logo" className="h-10 object-contain" />
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Levando a essência gastronômica de Belém do Pará até você. O melhor tacacá, maniçoba, açaí puro e peixes locais no conforto do seu lar.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-sabor-dark text-white hover:text-sabor-primary transition-colors flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-sabor-dark text-white hover:text-sabor-primary transition-colors flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-sabor-dark text-white hover:text-sabor-primary transition-colors flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Col 2: Horários */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Funcionamento</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Segunda a Sábado</span>
                <span className="text-white font-medium">11:30 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Domingos</span>
                <span className="text-white font-medium">11:30 - 17:00</span>
              </li>
              <li className="flex justify-between pb-2 text-rose-400">
                <span>Feriados</span>
                <span className="font-semibold">Consulte nossas redes</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Links Rápidos */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Links Úteis</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/cardapio" className="hover:text-sabor-primary transition-colors">Nosso Cardápio</Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-sabor-primary transition-colors">Pedir Delivery</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sabor-primary transition-colors">Minha Conta</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-sabor-primary transition-colors">Cadastre-se</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contatos */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Endereço & Contato</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-sabor-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Av. Nazaré, 452 - Nazaré<br/>Belém - PA, 66035-170</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-sabor-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>(91) 98765-4321 / 3222-1111</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-sabor-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>contato@saborexpress.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
          <p>© {new Date().getFullYear()} SaborExpress. Todos os direitos reservados. Culinária Amazônica com orgulho.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Políticas de Privacidade</a>
            <a href="#" className="hover:underline">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
