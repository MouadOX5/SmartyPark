import React, { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { journalApi } from '../api/journalApi';
import { formatDateTime } from '../utils/formatters';
import { JournalResponse } from '../types';

export function JournalPage() {
  const [entries, setEntries] = useState<JournalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    journalApi.getAll().then(setEntries).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Journal d'activité</h1>
        <p className="page-subtitle">Historique des actions du système</p>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <ScrollText size={40} />
            <div className="empty-state-title">Aucune entrée</div>
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Détails</th>
                  <th>Acteur</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(e.dateAction)}</td>
                    <td><span className="badge badge-info">{e.action}</span></td>
                    <td style={{ maxWidth: 480 }}>{e.details}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{e.acteurPrenom} {e.acteurNom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
