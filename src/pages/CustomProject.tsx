import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  MessageCircle,
  X
} from 'lucide-react';

export const CustomProject: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    projectType: 'decor',
    material: 'pla',
    quantity: '1',
    description: '',
    notes: '',
  });

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `*Solicitação de Projeto Personalizado - SunLab 3D*\n\n` +
    `*Nome:* ${formData.name}\n` +
    `*WhatsApp:* ${formData.whatsapp}\n` +
    `*Tipo de Projeto:* ${formData.projectType}\n` +
    `*Material Preferido:* ${formData.material}\n` +
    `*Quantidade:* ${formData.quantity}\n` +
    `*Descrição:* ${formData.description}\n` +
    (formData.notes ? `*Observações:* ${formData.notes}\n` : '') +
    (uploadedFile ? `*Arquivo Anexado:* ${uploadedFile.name}\n` : '')
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-lime-600" />
          <span>Atelier de Fabricação Exclusiva</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight font-display">
          Criar Algo Personalizado
        </h1>
        <p className="text-sm text-blue-800/85 max-w-xl mx-auto leading-relaxed">
          Transforme sua ideia, modelo 3D ou projeto arquitetônico em realidade. Preencha o formulário abaixo para receber uma análise técnica e orçamento personalizado sem compromisso.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Orçamento Solicitado com Sucesso!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Obrigado, <strong className="text-slate-900">{formData.name}</strong>. Nossa equipe de engenheiros e designers industriais já recebeu suas especificações e retornará em até 24 horas úteis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1.5">
            <div className="flex justify-between">
              <span>Contato cadastrado:</span>
              <span className="text-slate-900 font-medium">{formData.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantidade:</span>
              <span className="text-slate-900 font-medium">{formData.quantity} unidade(s)</span>
            </div>
            {uploadedFile && (
              <div className="flex justify-between">
                <span>Arquivo de Referência:</span>
                <span className="text-blue-600 font-medium truncate max-w-[200px]">{uploadedFile.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={`https://wa.me/5513996061681?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Acelerar Atendimento pelo WhatsApp</span>
            </a>
            <button
              onClick={() => {
                setSubmitted(false);
                setUploadedFile(null);
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors cursor-pointer border border-slate-200"
            >
              Enviar Outro Projeto
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 space-y-8 shadow-xl">
          
          {/* Step 1: Dados Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>1. Informações de Contato</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Ana Clara Martins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  required
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                E-mail para Orçamento Formal *
              </label>
              <input
                required
                type="email"
                placeholder="seuemail@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>

          {/* Step 2: Detalhes do Projeto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>2. Especificações do Projeto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Projeto
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="decor">Peça de Decoração / Arquitetura</option>
                  <option value="tech">Suporte / Acessório Tech</option>
                  <option value="prototype">Protótipo Funcional / Engenharia</option>
                  <option value="gifts">Brinde Corporativo / Troféu</option>
                  <option value="replacement">Reposição de Peça Quebrada</option>
                  <option value="other">Outro Projeto Exclusivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Material Sugerido
                </label>
                <select
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="pla">PLA Premium (Acabamento Fosco)</option>
                  <option value="petg">PETG Resistente (Uso Externo/Mecânico)</option>
                  <option value="resin">Resina UV 8K (Altíssimo Nível de Detalhe)</option>
                  <option value="carbon">PETG Carbon Fiber (Alta Rigidez)</option>
                  <option value="tpu">TPU Flexível (Emborrachado)</option>
                  <option value="recommend">Não sei, recomendar o melhor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quantidade Desejada *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descrição do Projeto e Dimensões Estimadas *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Descreva a finalidade da peça, dimensões aproximadas (altura, largura, profundidade), cor desejada e qualquer requisito especial..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          {/* Step 3: Upload de Referência Visual ou Arquivo 3D */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>3. Referência Visual ou Arquivo 3D (.STL, .OBJ, Fotos)</span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                isDragging
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50'
              }`}
            >
              <input
                type="file"
                accept=".stl,.obj,.step,.3mf,.zip,.png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3 text-slate-800">
                  <FileCheck className="w-8 h-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900">{uploadedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{uploadedFile.size}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      Arraste e solte o arquivo aqui, ou <strong className="text-blue-600 underline">clique para selecionar</strong>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Aceita arquivos .STL, .OBJ, .STEP, .3MF ou fotos de referência visual (.PNG, .JPG) até 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observações Adicionais (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Preciso pronto até o dia 20 para um evento / Peça requer rosca M4..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-zinc-700" />
              <span>Solicitar Orçamento Gratuito</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              Não cobramos pelo orçamento. Resposta com estimativa de custo e prazo de fabricação em poucas horas.
            </p>
          </div>

        </form>
      )}

    </div>
  );
};

export default CustomProject;
