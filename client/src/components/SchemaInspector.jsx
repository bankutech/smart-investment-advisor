import React, { useState, useEffect } from 'react';
import { Database, Key, Link2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';

export default function SchemaInspector() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSchemaInspector()
      .then(data => setSchema(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-mono text-xs text-slate-400">Introspecting relational database schema...</div>;
  }

  const tableNames = Object.keys(schema || {});

  return (
    <div className="space-y-6">
      <div className="bg-[#10131F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
          <Database className="w-4 h-4" />
          <span>RELATIONAL DBMS INTROSPECTION</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white tracking-tight">
          Normalized 8-Table Schema Architecture
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Implementing 3NF Relational Schemas, Primary &amp; Foreign Key Constraints, and Referencing Views
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tableNames.map(tableName => {
          const tableInfo = schema[tableName];
          const columns = tableInfo.columns || [];
          const fks = tableInfo.foreignKeys || [];

          return (
            <div key={tableName} className="bg-[#10131F] border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-sm font-bold text-cyan-400 uppercase">
                  {tableName}
                </span>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  {columns.length} columns
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {columns.map(col => {
                  const isPk = col.pk === 1;
                  const isFk = fks.some(f => f.from === col.name);
                  return (
                    <div key={col.name} className="flex items-center justify-between py-1 border-b border-slate-800/40 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        {isPk && <Key className="w-3 h-3 text-amber-400" title="Primary Key" />}
                        {isFk && <Link2 className="w-3 h-3 text-cyan-400" title="Foreign Key" />}
                        <span className={isPk ? 'text-amber-300 font-bold' : isFk ? 'text-cyan-300' : 'text-slate-300'}>
                          {col.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{col.type}</span>
                    </div>
                  );
                })}
              </div>

              {fks.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1">
                  <span className="text-slate-500 block uppercase">Foreign Key Relations:</span>
                  {fks.map((fk, idx) => (
                    <div key={idx} className="text-cyan-300">
                      → {fk.from} ➔ {fk.table}({fk.to})
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
