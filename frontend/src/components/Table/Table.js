import React from 'react';
import styles from './Table.module.css';

const Table = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  showDeleteFor = () => true
}) => {
  const tieneAcciones = onEdit || onDelete || onView;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.scrollX}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {tieneAcciones && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (tieneAcciones ? 1 : 0)} className={styles.empty}>
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {tieneAcciones && (
                    <td className={styles.actions}>
                      {onView && (
                        <button
                          className={`${styles.btn} ${styles.btnVer}`}
                          onClick={() => onView(row)}
                        >
                          Ver
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className={`${styles.btn} ${styles.btnEdit}`}
                          onClick={() => onEdit(row)}
                        >
                          {editLabel}
                        </button>
                      )}
                      {onDelete && showDeleteFor(row) && (
                        <button
                          className={`${styles.btn} ${styles.btnDelete}`}
                          onClick={() => onDelete(row.id)}
                        >
                          {deleteLabel}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
