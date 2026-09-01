import './DataTable.css';

// Generic table: columns = [{ key, label, render?(row) }]
export default function DataTable({ columns, rows, rowKey = '_id', emptyMessage = 'Koi data nahi mila.' }) {
  if (!rows || rows.length === 0) {
    return <p className="admin-state-message">{emptyMessage}</p>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
