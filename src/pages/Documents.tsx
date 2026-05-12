import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UploadCloud, FileText, FileImage, Download, Trash2 } from 'lucide-react';
import { useBusinessStore } from '@/stores/businessStore';
import { useUIStore } from '@/stores/uiStore';
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/mockApi';
import type { Document as DocType, DocumentCategory } from '@/types';

const categoryTabs: { value: DocumentCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'contract', label: 'Contratos' },
  { value: 'invoice', label: 'Facturas' },
  { value: 'receipt', label: 'Recibos' },
  { value: 'logo', label: 'Logos' },
  { value: 'general', label: 'General' },
];

const docCategoryColors: Record<DocumentCategory, string> = {
  contract: '#DC2626',
  invoice: '#22C55E',
  receipt: '#F59E0B',
  logo: '#DC2626',
  general: '#64748B',
};

export default function Documents() {
  const { businesses } = useBusinessStore();
  const { showToast } = useUIStore();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [category, setCategory] = useState<DocumentCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
    setIsLoading(false);
  };

  const filteredDocs = documents.filter(d => {
    const matchesCategory = category === 'all' || d.category === category;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || d.name.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.name || 'Desconocido';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Mock upload - in real app, upload files here
    showToast({ type: 'success', title: 'Archivo recibido', description: 'El archivo se subira cuando configures Supabase Storage' });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast({ type: 'info', title: 'Subiendo archivo...', description: file.name });
    // Mock: create a document entry
    await uploadDocument({
      businessId: businesses[0]?.id || 'b1',
      name: file.name,
      filePath: `/docs/${file.name}`,
      fileType: file.type,
      fileSize: file.size,
      category: 'general',
    });
    await loadDocuments();
    showToast({ type: 'success', title: 'Archivo subido', description: file.name });
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    await loadDocuments();
    showToast({ type: 'success', title: 'Documento eliminado' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="shimmer rounded-xl h-32" style={{ backgroundColor: 'var(--bg-surface)' }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-48" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="rounded-xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer transition-all"
        style={{
          borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-medium)',
          backgroundColor: isDragging ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-surface)',
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <UploadCloud size={48} style={{ color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
        <p className="text-sm font-medium mt-3" style={{ color: 'var(--text-primary)' }}>
          Arrastra archivos aqui o haz clic para seleccionar
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          PDF, JPG, PNG hasta 10MB
        </p>
        <input id="file-input" type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {categoryTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategory(tab.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: category === tab.value ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: category === tab.value ? '#fff' : 'var(--text-secondary)',
                border: category === tab.value ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full h-10 rounded-lg pl-9 pr-4 text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <img src="/empty-state-documents.png" alt="" className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Sin documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc, index) => {
            const isImage = doc.fileType.startsWith('image/');
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-4 card-hover group"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                {/* File Preview */}
                <div className="flex items-center justify-center h-20 mb-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                  {isImage ? (
                    <FileImage size={32} style={{ color: docCategoryColors[doc.category] }} />
                  ) : (
                    <FileText size={32} style={{ color: docCategoryColors[doc.category] }} />
                  )}
                </div>

                {/* File Info */}
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} title={doc.name}>
                  {doc.name}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {getBusinessName(doc.businessId)}
                </p>

                {/* Category & Size */}
                <div className="flex items-center justify-between mt-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${docCategoryColors[doc.category]}15`, color: docCategoryColors[doc.category] }}
                  >
                    {doc.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(doc.fileSize / 1024).toFixed(0)}KB
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs transition-colors"
                    style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--accent-primary)' }}
                  >
                    <Download size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs transition-colors"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
