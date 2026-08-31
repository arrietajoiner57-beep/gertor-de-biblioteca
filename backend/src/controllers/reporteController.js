const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Prestamo = require('../models/Prestamo');
const Usuario = require('../models/Usuario');
const Libro = require('../models/Libro');

const ESTADO_ETIQUETA = {
  activo: 'Activo',
  devuelto: 'Devuelto',
  vencido: 'Vencido',
  pendiente: 'Pendiente'
};

function formatearFecha(valor) {
  if (!valor) return '-';
  return String(valor).split(' ')[0];
}

async function obtenerDatosPrestamos() {
  return Prestamo.getAll({});
}

function setExcelHeader(ws, columnas) {
  ws.columns = columnas;
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0A1628' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 22;
  ws.getRow(1).eachCell((cell) => {
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF0A1628' } }
    };
  });
  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

function autoFitColumns(ws, anchoMin = 12, anchoMax = 30) {
  ws.columns.forEach((column) => {
    let maxLength = (column.header ? String(column.header).length : 10) + 2;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(Math.max(maxLength, anchoMin), anchoMax);
  });
}

const reporteController = {
  // ============ PRÉSTAMOS ============
  async prestamosExcel(req, res) {
    try {
      const prestamos = await obtenerDatosPrestamos();

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema de Biblioteca';
      workbook.created = new Date();
      const ws = workbook.addWorksheet('Prestamos');

      setExcelHeader(ws, [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Usuario', key: 'usuario', width: 22 },
        { header: 'Fecha Prestamo', key: 'fecha_prestamo', width: 16 },
        { header: 'Fecha Devolucion', key: 'fecha_devolucion', width: 16 },
        { header: 'Estado', key: 'estado', width: 14 }
      ]);

      prestamos.forEach((p) => {
        ws.addRow({
          id: p.id,
          usuario: p.nombre_usuario,
          fecha_prestamo: formatearFecha(p.fecha_prestamo),
          fecha_devolucion: formatearFecha(p.fecha_devolucion),
          estado: ESTADO_ETIQUETA[p.estado] || p.estado
        });
      });

      autoFitColumns(ws);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_prestamos_${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de prestamos' });
    }
  },

  async prestamosPdf(req, res) {
    try {
      const prestamos = await obtenerDatosPrestamos();
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_prestamos_${Date.now()}.pdf"`);
      doc.pipe(res);

      dibujarCabecera(doc, 'Reporte de Préstamos', 'Sistema de Gestión Bibliotecaria');

      const tablaTop = doc.y + 10;
      const columnas = [
        { label: 'ID', width: 40 },
        { label: 'Usuario', width: 150 },
        { label: 'Fecha Préstamo', width: 120 },
        { label: 'Fecha Devol.', width: 120 },
        { label: 'Estado', width: 100 }
      ];

      dibujarFilaTabla(doc, columnas, ['ID', 'Usuario', 'Fecha Préstamo', 'Fecha Devolución', 'Estado'], true, tablaTop);

      let y = doc.y + 4;
      prestamos.forEach((p, i) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = doc.y + 8;
          dibujarFilaTabla(doc, columnas, ['ID', 'Usuario', 'Fecha Préstamo', 'Fecha Devolución', 'Estado'], true, y);
          y = doc.y + 4;
        }
        dibujarFilaTabla(doc, columnas, [
          String(p.id),
          p.nombre_usuario || '-',
          formatearFecha(p.fecha_prestamo),
          formatearFecha(p.fecha_devolucion),
          ESTADO_ETIQUETA[p.estado] || p.estado
        ], false, y, i % 2 === 0);
        y = doc.y + 4;
      });

      dibujarPie(doc, `Total de préstamos: ${prestamos.length}`);
      doc.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de prestamos' });
    }
  },

  // ============ USUARIOS ============
  async usuariosExcel(req, res) {
    try {
      const usuarios = await Usuario.getAll();

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Usuarios');
      setExcelHeader(ws, [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Nombre', key: 'nombre', width: 24 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Teléfono', key: 'telefono', width: 16 },
        { header: 'Rol', key: 'rol', width: 16 },
        { header: 'Registro', key: 'fecha_registro', width: 16 }
      ]);

      const rolEtiquetas = { admin: 'Administrador', bibliotecario: 'Bibliotecario', user: 'Usuario' };
      usuarios.forEach((u) => {
        ws.addRow({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          telefono: u.telefono || '-',
          rol: rolEtiquetas[u.rol] || u.rol,
          fecha_registro: formatearFecha(u.fecha_registro)
        });
      });

      autoFitColumns(ws);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_usuarios_${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de usuarios' });
    }
  },

  async usuariosPdf(req, res) {
    try {
      const usuarios = await Usuario.getAll();
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_usuarios_${Date.now()}.pdf"`);
      doc.pipe(res);

      dibujarCabecera(doc, 'Reporte de Usuarios', 'Sistema de Gestión Bibliotecaria');

      const columnas = [
        { label: 'ID', width: 40 },
        { label: 'Nombre', width: 170 },
        { label: 'Email', width: 200 },
        { label: 'Rol', width: 120 }
      ];

      let y = doc.y + 10;
      dibujarFilaTabla(doc, columnas, ['ID', 'Nombre', 'Email', 'Rol'], true, y);
      y = doc.y + 4;

      const rolEtiquetas = { admin: 'Administrador', bibliotecario: 'Bibliotecario', user: 'Usuario' };
      usuarios.forEach((u, i) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = doc.y + 8;
          dibujarFilaTabla(doc, columnas, ['ID', 'Nombre', 'Email', 'Rol'], true, y);
          y = doc.y + 4;
        }
        dibujarFilaTabla(doc, columnas, [
          String(u.id),
          u.nombre || '-',
          u.email || '-',
          rolEtiquetas[u.rol] || u.rol
        ], false, y, i % 2 === 0);
        y = doc.y + 4;
      });

      dibujarPie(doc, `Total de usuarios: ${usuarios.length}`);
      doc.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de usuarios' });
    }
  },

  // ============ LIBROS ============
  async librosExcel(req, res) {
    try {
      const libros = await Libro.getAll();

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Libros');
      setExcelHeader(ws, [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Título', key: 'titulo', width: 30 },
        { header: 'Autor', key: 'autor', width: 24 },
        { header: 'ISBN', key: 'isbn', width: 20 },
        { header: 'Género', key: 'genero', width: 18 },
        { header: 'Año', key: 'anio', width: 8 },
        { header: 'Disponibles', key: 'disponibles', width: 12 }
      ]);

      libros.forEach((l) => {
        ws.addRow({
          id: l.id,
          titulo: l.titulo,
          autor: l.autor,
          isbn: l.isbn,
          genero: l.genero || '-',
          anio: l.anio_publicacion || '-',
          disponibles: l.cantidad_disponible
        });
      });

      autoFitColumns(ws);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_libros_${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de libros' });
    }
  },

  async librosPdf(req, res) {
    try {
      const libros = await Libro.getAll();
      const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_libros_${Date.now()}.pdf"`);
      doc.pipe(res);

      dibujarCabecera(doc, 'Reporte de Libros', 'Sistema de Gestión Bibliotecaria');

      const columnas = [
        { label: 'ID', width: 40 },
        { label: 'Título', width: 180 },
        { label: 'Autor', width: 150 },
        { label: 'Género', width: 110 },
        { label: 'Disp.', width: 50 }
      ];

      let y = doc.y + 10;
      dibujarFilaTabla(doc, columnas, ['ID', 'Título', 'Autor', 'Género', 'Disp.'], true, y);
      y = doc.y + 4;

      libros.forEach((l, i) => {
        if (y > doc.page.height - 60) {
          doc.addPage();
          y = doc.y + 8;
          dibujarFilaTabla(doc, columnas, ['ID', 'Título', 'Autor', 'Género', 'Disp.'], true, y);
          y = doc.y + 4;
        }
        dibujarFilaTabla(doc, columnas, [
          String(l.id),
          l.titulo || '-',
          l.autor || '-',
          l.genero || '-',
          String(l.cantidad_disponible)
        ], false, y, i % 2 === 0);
        y = doc.y + 4;
      });

      dibujarPie(doc, `Total de libros: ${libros.length}`);
      doc.end();
    } catch (error) {
      res.status(500).json({ message: 'No se pudo generar el reporte de libros' });
    }
  }
};

// ===== Utilidades PDF =====
function dibujarCabecera(doc, titulo, subtitulo) {
  doc.rect(0, 0, doc.page.width, 70).fill('#0a1628');
  doc.fillColor('#c9a84c').fontSize(20).font('Helvetica-Bold')
    .text(titulo, 40, 24);
  doc.fillColor('rgba(255,255,255,0.7)').fontSize(11).font('Helvetica')
    .text(subtitulo, 40, doc.y + 4);
  doc.y = Math.max(doc.y, 80);
}

function dibujarFilaTabla(doc, columnas, celdas, esCabecera, y, zebra = false) {
  let x = doc.page.margins.left;

  if (zebra) {
    doc.rect(x, y, doc.page.width - 80, 22).fill('#f1f5f9');
  }

  for (let i = 0; i < celdas.length; i++) {
    const w = columnas[i].width;
    if (esCabecera) {
      doc.rect(x, y, w, 22).fill('#162d50');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9)
        .text(celdas[i], x + 6, y + 6, { width: w - 10 });
    } else {
      doc.fillColor('#1e293b').font('Helvetica').fontSize(9)
        .text(String(celdas[i]), x + 6, y + 6, { width: w - 10 });
    }
    x += w;
  }
  doc.moveDown(0);
  doc.y = y + 22;
}

function dibujarPie(doc, texto) {
  doc.y = doc.page.height - 50;
  doc.moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.left, doc.y)
    .stroke('#c9a84c');
  doc.fillColor('#64748b').fontSize(9).font('Helvetica')
    .text(texto, doc.page.margins.left, doc.y + 8);
}

module.exports = reporteController;
