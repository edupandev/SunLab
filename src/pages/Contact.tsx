import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Send, CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Dúvida sobre produto',
    message: ''
  });

  const [sent, setSent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', subject: 'Dúvida sobre produto', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: 'Os produtos suportam água e exposição solar?',
      a: 'Nossos vasos para flores possuem tratamento e selagem resinada impermeável na parte interna, permitindo colocar água fresca sem vazamentos. Para produtos decorativos internos, utilizamos PLA mineral. Para itens que ficarão expostos a calor automotivo ou sol constante, recomendamos a produção em PETG ou ASA que resistem a temperaturas de até 85°C.'
    },
    {
      q: 'Qual o prazo total entre o pedido e o recebimento?',
      a: 'Como trabalhamos com manufatura on-demand sob demanda, o tempo de impressão e acabamento artesanal leva de 1 a 3 dias úteis. Em seguida, a encomenda é despachada via Correios ou transportadora com rastreio total enviado para o seu e-mail e WhatsApp.'
    },
    {
      q: 'Posso solicitar uma cor especial Pantone ou acabamento diferenciado?',
      a: 'Com certeza! Nosso atelier dispõe de mais de 40 tons de filamentos técnicos, incluindo filamentos carregados com fibra de carbono, madeira verdadeira, pó de pedra basáltica, e filamentos de seda metálica. Acesse nossa página de Personalizados para nos consultar.'
    },
    {
      q: 'Vocês imprimem arquivos prontos (.STL / .OBJ baixados da internet)?',
      a: 'Sim! Se você encontrou um modelo no Printables, MakerWorld ou Thingiverse, basta nos enviar o link ou arquivo através da página de Personalizados. Calcularemos o tempo de máquina, peso em gramas e enviaremos o orçamento exato em minutos.'
    },
    {
      q: 'Como funciona a garantia e a política de trocas?',
      a: 'Garantimos 1 ano contra defeitos de fabricação ou delaminação de camadas. Além disso, de acordo com o Código de Defesa do Consumidor, você possui 7 dias incondicionais após o recebimento para troca ou reembolso total se não estiver 100% satisfeito.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Suporte & Atendimento
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight font-display">
          Fale com a SunLab
        </h1>
        <p className="text-sm text-blue-800/85 leading-relaxed">
          Tem dúvidas sobre medidas, acabamentos ou prazos? Nossa equipe técnica está disponível para responder prontamente.
        </p>
      </div>

      {/* Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">WhatsApp Comercial</h3>
            <p className="text-xs text-slate-500">Atendimento ágil de segunda a sexta, das 9h às 18h.</p>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%20SunLab!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-1"
            >
              <span>(11) 99999-9999</span>
              <span>→</span>
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">E-mail do Studio</h3>
            <p className="text-xs text-slate-500">Para orçamentos corporativos, parcerias e imprensa.</p>
            <a
              href="mailto:contato@sunlab.com.br"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1"
            >
              <span>contato@sunlab.com.br</span>
              <span>→</span>
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Atelier & Fábrica</h3>
            <p className="text-xs text-slate-500">Av. Paulista, 1000 — Bela Vista, São Paulo/SP</p>
            <span className="text-[11px] text-slate-400 block pt-1">
              *Produção fechada; visitas técnicas com agendamento prévio.
            </span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Envie uma Mensagem
            </h3>

            {sent ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Mensagem Recebida!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Entraremos em contato com você pelo e-mail ou WhatsApp nas próximas horas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Seu Nome *</label>
                    <input
                      required
                      type="text"
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Seu E-mail *</label>
                    <input
                      required
                      type="email"
                      placeholder="email@dominio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assunto</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Dúvida sobre produto">Dúvida sobre produto do catálogo</option>
                    <option value="Prazo de entrega">Prazo ou rastreio de pedido</option>
                    <option value="Parceria comercial">Parceria comercial / Arquitetura</option>
                    <option value="Outro assunto">Outro assunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mensagem *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Como podemos te ajudar hoje?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-xs transition-all shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4 text-zinc-700" />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-6 pt-10 border-t border-slate-200 max-w-4xl mx-auto">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <HelpCircle className="w-4 h-4" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Dúvidas Comuns dos Clientes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Contact;
