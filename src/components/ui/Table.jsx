function Table({ columns, emptyMessage = "No records found.", rows }) {
  return <div className="table-wrap"><table className="table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, rowIndex) => <tr key={row.id || rowIndex}>{columns.map((column) => <td data-label={column.label} key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td className="table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>}</tbody></table></div>;
}

export default Table;
