import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { documentsData } from '@/data/documentsData';
import { nhsData } from '@/data/nhsData';
import { mainChecklist } from '@/data/checklistsData';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const searchResults = () => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ id: string; title: string; type: string; icon: string }> = [];

    // Search documents
    documentsData.forEach(doc => {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        results.push({ id: doc.id, title: doc.title, type: 'document', icon: doc.icon });
      }
    });

    // Search NHS
    nhsData.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery) || 
          item.content.some(c => c.toLowerCase().includes(lowerQuery))) {
        results.push({ id: item.id, title: item.title, type: 'nhs', icon: item.icon });
      }
    });

    // Search checklist
    mainChecklist.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery) || 
          item.description.toLowerCase().includes(lowerQuery)) {
        results.push({ id: item.id, title: item.title, type: 'checklist', icon: '✅' });
      }
    });

    return results;
  };

  const results = searchResults();

  const handleResultClick = (result: ReturnType<typeof searchResults>[0]) => {
    if (result.type === 'document') {
      navigate(`/documents/${result.id}`);
    } else if (result.type === 'nhs') {
      navigate(`/nhs/${result.id}`);
    } else if (result.type === 'checklist') {
      navigate(`/checklists/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Search" />
      
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents, NHS, checklists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {query.trim() === '' ? (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Start typing to search</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((result, i) => (
              <Card
                key={`${result.type}-${result.id}-${i}`}
                icon={result.icon}
                title={result.title}
                description={result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                onClick={() => handleResultClick(result)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
