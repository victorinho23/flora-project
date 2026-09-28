// Hooks y utilidades principales de TanStack Table
import {
  useReactTable,          // Hook que crea la instancia de la tabla
  getCoreRowModel,        // Modelo base de filas (sin filtros ni paginación)
  flexRender,             // Permite renderizar contenido dinámico de columnas
  getPaginationRowModel,  // Modelo de filas con paginación
  getFilteredRowModel     // Modelo de filas filtradas
} from "@tanstack/react-table"


// Hook de React para manejar estado
import { useState } from "react"


// Botón reutilizable del sistema de componentes
import { Button } from "@/shared"

const tableVariants = {
    // ---- Variantes CLARAS (panel color crema/blanco, texto oscuro) ----
    fifth: {
        panel: "bg-bg-w/95 backdrop-blur-xl", header: "bg-bg-p200 text-text-inverse",
        row: "hover:bg-bg-p100/80", rowText: "text-text-inverse", zebra: "bg-bg-p50/60",
        border: "border-bd-p300", inputBg: "bg-bg-w", inputText: "text-text-inverse",
        inputPlaceholder: "placeholder:text-br-s400", selectBg: "bg-bg-w", selectText: "text-text-inverse",
        footerText: "text-br-s700",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    seventh: {
        panel: "bg-bg-p50/96 backdrop-blur-xl", header: "bg-bg-p950 text-br-w",
        row: "hover:bg-bg-p500", rowText: "text-text-primary", rowBg: "bg-bg-p700",
        border: "border-bd-p400", inputBg: "bg-bg-w", inputText: "text-br-s900",
        inputPlaceholder: "placeholder:text-br-s700", selectBg: "bg-bg-w", selectText: "text-br-s900",
        footerText: "text-br-s700",
    btnPrimary: "kaki", btnSecondary: "kakiContorno",
    },
    eighth: {
        panel: "bg-transparent shadow-xl", header: "bg-bg-t600 text-br-p50",
        row: "hover:bg-bg-t100/70", rowText: " text-center text-br-t600", zebra: "",
        border: "border-bd-t400 border", inputBg: "bg-bg-w", inputText: "text-br-s900",
        inputPlaceholder: "placeholder:text-br-t500", selectBg: "bg-bg-w", selectText: "text-br-s900",
        footerText: "text-br-t600",
    btnPrimary: "fifth", btnSecondary: "fifth",
    },
    ninth: {
        panel: "bg-bg-w/94 backdrop-blur-xl", header: "bg-bg-g100 text-text-inverse",
        row: "hover:bg-bg-g50/80", rowText: "text-text-secondary", zebra: "bg-bg-g50/70",
        border: "border-bd-g300", inputBg: "bg-bg-w", inputText: "text-text-secondary",
        inputPlaceholder: "placeholder:text-text-muted", selectBg: "bg-bg-w", selectText: "text-text-secondary",
        footerText: "text-text-secondary",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    tenth: {
        panel: "bg-bg-w shadow-sm", header: "bg-bg-w text-text-inverse shadow-sm",
        row: "hover:bg-bd-g50", rowText: "text-text-secondary", zebra: "bg-bg-g50/80",
        border: "border-bd-g200", inputBg: "bg-bg-w", inputText: "text-text-secondary",
        inputPlaceholder: "placeholder:text-text-muted", selectBg: "bg-bg-w", selectText: "text-text-secondary",
        footerText: "text-text-secondary",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    eleventh: {
        panel: "bg-bg-p100/95 backdrop-blur-xl", header: "bg-bg-p700 text-br-p50",
        row: "hover:bg-bg-p200/70", rowText: "text-text-inverse", zebra: "bg-bg-p50/70",
        border: "border-bd-p500", inputBg: "bg-bg-w", inputText: "text-text-inverse",
        inputPlaceholder: "placeholder:text-br-s400", selectBg: "bg-bg-w", selectText: "text-text-inverse",
        footerText: "text-br-s800",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    twelfth: {
        panel: "bg-bg-w/94 backdrop-blur-lg", header: "bg-bg-g50 text-text-inverse",
        row: "hover:bg-bd-g50/80", rowText: "text-text-secondary", zebra: "bg-bg-g50/60",
        border: "border-bd-g300", inputBg: "bg-bg-w", inputText: "text-text-secondary",
        inputPlaceholder: "placeholder:text-text-muted", selectBg: "bg-bg-w", selectText: "text-text-secondary",
        footerText: "text-text-secondary",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    thirteenth: {
        panel: "bg-bg-t50/96 backdrop-blur-xl", header: "bg-bg-w text-br-t700 shadow-sm",
        row: "hover:bg-br-t50/70", rowText: "text-text-inverse", zebra: "bg-bg-t100/50",
        border: "border-bd-t600", inputBg: "bg-bg-w", inputText: "text-br-t900",
        inputPlaceholder: "placeholder:text-br-t500", selectBg: "bg-bg-w", selectText: "text-br-t900",
        footerText: "text-br-t800",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    nineteenth: {
        panel: "bg-bg-p100/96 backdrop-blur-xl shadow-lg", header: "bg-bg-p800 text-br-p50",
        row: "hover:bg-bg-p200/70", rowText: "text-text-inverse", zebra: "bg-bg-p50/60",
        border: "border-bd-p400", inputBg: "bg-bg-w", inputText: "text-text-inverse",
        inputPlaceholder: "placeholder:text-br-s400", selectBg: "bg-bg-w", selectText: "text-text-inverse",
        footerText: "text-br-s800",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    seventeenth: {
        panel: "bg-bg-w/90 backdrop-blur-2xl", header: "bg-bg-w text-text-inverse",
        row: "hover:bg-bg-w/60", rowText: "text-text-inverse", zebra: "bg-bg-w/40",
        border: "border-bd-g200", inputBg: "bg-bg-w", inputText: "text-text-inverse",
        inputPlaceholder: "placeholder:text-text-muted", selectBg: "bg-bg-w", selectText: "text-text-inverse",
        footerText: "text-text-secondary",
    btnPrimary: "primary", btnSecondary: "fifth",
    },

    // ---- Variantes OSCURAS (panel oscuro, texto claro) ----
    fourth: {
        panel: "bg-bg-s900/95 backdrop-blur-xl", header: "bg-bg-s950 text-br-p100",
        row: "hover:bg-bg-s800/80", rowText: "text-br-p100", zebra: "bg-bg-s800/40",
        border: "border-bd-s600", inputBg: "bg-bg-s950/90", inputText: "text-br-p50",
        inputPlaceholder: "placeholder:text-br-p400", selectBg: "bg-bg-s950/90", selectText: "text-br-p50",
        footerText: "text-br-p200",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    sixth: {
        panel: "bg-bg-s950/94 backdrop-blur-xl", header: "bg-bg-t800 text-br-t100",
        row: "hover:bg-br-t700/25", rowText: "text-br-t100", zebra: "bg-bg-t900/20",
        border: "border-br-t600", inputBg: "bg-bg-s950/90", inputText: "text-br-t100",
        inputPlaceholder: "placeholder:text-br-t300", selectBg: "bg-bg-s950/90", selectText: "text-br-t100",
        footerText: "text-br-t200",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    fourteenth: {
        panel: "bg-bg-s900/94 backdrop-blur-xl", header: "bg-bg-s900 text-text-primary",
        row: "hover:bg-bg-s700/80", rowText: "text-br-p100", zebra: "bg-bg-s800/40",
        border: "border-bd-g700", inputBg: "bg-bg-s950/90", inputText: "text-text-primary",
        inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-s950/90", selectText: "text-text-primary",
        footerText: "text-br-g200",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },

   fifteenth: {
    panel: "bg-bg-g950/95 border-2! border-br-t300! shadow-[0_0_0_1px_var(--color-br-t500),0_0_8px_var(--color-br-t400),0_0_20px_var(--color-br-t500),0_0_45px_color-mix(in_srgb,var(--color-br-t500)_60%,transparent),inset_0_0_12px_color-mix(in_srgb,var(--color-br-t400)_50%,transparent)]!",
    header: "bg-bg-g950 [&_th]:bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] [&_th]:bg-clip-text [&_th]:text-transparent [&_th_svg]:text-br-t300",
    row: "hover:bg-bg-w/10", rowText: "text-br-t100", zebra: "bg-bg-w/5",
    border: "border-bd-w/20", inputBg: "bg-bg-g900/90", inputText: "text-text-primary",
    inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-g900/90", selectText: "text-text-primary",
    footerText: "text-br-g300",
    btnPrimary: "remolino", btnSecondary: "remolino",
},
    sixteenth: {
        panel: "bg-bg-g950/95 backdrop-blur-xl", header: "bg-bg-g950 text-br-t400",
        row: "hover:bg-br-t500/15", rowText: "text-br-g100", zebra: "bg-br-t500/5",
        border: "border-br-t500", inputBg: "bg-bg-g900/90", inputText: "text-br-g100",
        inputPlaceholder: "placeholder:text-br-g500", selectBg: "bg-bg-g900/90", selectText: "text-br-g100",
        footerText: "text-br-t300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    eighteenth: {
        panel: "bg-bg-g950/96 backdrop-blur-xl", header: "bg-bg-g950 text-br-t400",
        row: "hover:bg-br-t600/15", rowText: "text-br-g100", zebra: "bg-br-t600/5",
        border: "border-br-t600", inputBg: "bg-bg-g900/90", inputText: "text-br-g100",
        inputPlaceholder: "placeholder:text-br-g500", selectBg: "bg-bg-g900/90", selectText: "text-br-g100",
        footerText: "text-br-t300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    twentieth: {
        panel: "bg-bg-g900/95 backdrop-blur-xl", header: "bg-bg-g900 text-text-primary",
        row: "hover:bg-bg-g800/80", rowText: "text-br-g100", zebra: "bg-bg-g800/40",
        border: "border-bd-g700", inputBg: "bg-bg-g950/90", inputText: "text-text-primary",
        inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-g950/90", selectText: "text-text-primary",
        footerText: "text-br-g300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    twentyFirst: {
        panel: "bg-gradient-to-br from-bg-g950/95 to-bg-s800/95 backdrop-blur-xl",
        header: "bg-gradient-to-r from-bg-g950 to-bg-s800 text-text-primary",
        row: "hover:bg-bg-s700/60", rowText: "text-br-p100", zebra: "bg-bg-s800/25",
        border: "border-bd-s600", inputBg: "bg-bg-g950/90", inputText: "text-text-primary",
        inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-g950/90", selectText: "text-text-primary",
        footerText: "text-br-g300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    twentySecond: {
        panel: "bg-bg-g900/95 backdrop-blur-xl", header: "bg-bg-g900 text-text-primary",
        row: "hover:bg-bg-g800/80", rowText: "text-br-g100", zebra: "bg-bg-g800/30",
        border: "border-bd-g700", inputBg: "bg-bg-g950/90", inputText: "text-text-primary",
        inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-g950/90", selectText: "text-text-primary",
        footerText: "text-br-g300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },
    twentyThird: {
        panel: "bg-bg-g950/95 backdrop-blur-xl", header: "bg-bg-g950 text-text-primary",
        row: "hover:bg-br-t500/15", rowText: "text-br-g100", zebra: "bg-br-t500/5",
        border: "border-br-t500/60", inputBg: "bg-bg-g900/90", inputText: "text-text-primary",
        inputPlaceholder: "placeholder:text-br-g400", selectBg: "bg-bg-g900/90", selectText: "text-text-primary",
        footerText: "text-br-t300",
    btnPrimary: "fifth", btnSecondary: "cuar",
    },

    // ---- Variante por defecto: se usa cuando no se pasa "variant" ----
    // Pensada para funcionar tanto sola sobre la foto de fondo como dentro
    // de una tarjeta clara (bg-white/95) como en Inventario/Proveedores.
    default: {
        panel: "bg-bg-w shadow-sm", header: "bg-bg-g50 text-text-secondary",
        row: "hover:bg-bg-g50", rowText: "text-text-secondary", zebra: "bg-bg-g50/70",
        border: "border-bd-g200", inputBg: "bg-bg-w", inputText: "text-text-secondary",
        inputPlaceholder: "placeholder:text-text-muted", selectBg: "bg-bg-w", selectText: "text-text-secondary",
        footerText: "text-text-muted",
    btnPrimary: "primary", btnSecondary: "fifth",
    },

    twentyFourth: {
        // "Marfil clásico" v2: panel BLANCO real (no crema), header casi
        // negro, texto gris oscuro nítido -- antes todo vivía en el mismo
        // rango café/kaki apagado y se sentía "lavado" sobre la foto.
        panel: "bg-bg-w/97", header: "bg-bg-s950 text-bg-w",
        row: "hover:bg-bg-g50", rowText: "text-bg-g900", zebra: "bg-bg-g50/70",
        border: "border-bd-g200", inputBg: "bg-bg-w", inputText: "text-bg-g900",
        inputPlaceholder: "placeholder:text-bg-g400", selectBg: "bg-bg-w", selectText: "text-bg-g900",
        footerText: "text-bg-g700",
    btnPrimary: "primary", btnSecondary: "fifth",
    },
    twentyFifth: {
        // "Gris claro" v2: mismo ajuste -- blanco real + casi negro + texto
        // gris oscuro, para que nada quede en el mismo tono apagado.
        panel: "bg-bg-w/97", header: "bg-bg-g950 text-bg-w",
        row: "hover:bg-bg-g50", rowText: "text-bg-g900", zebra: "bg-bg-g50/70",
        border: "border-bd-g300", inputBg: "bg-bg-w", inputText: "text-bg-g900",
        inputPlaceholder: "placeholder:text-bg-g400", selectBg: "bg-bg-w", selectText: "text-bg-g900",
        footerText: "text-bg-g700",
    btnPrimary: "primary", btnSecondary: "fifth",
    },

    // ---- OSCURAS con botones CLAROS (2) ----
    twentySixth: {
        // "Café profundo": panel café casi negro, botones crema sólidos
        panel: "bg-bg-s950/95 backdrop-blur-xl", header: "bg-bg-s900 text-br-p100",
        row: "hover:bg-bg-s800/70", rowText: "text-br-p100", zebra: "bg-bg-s800/35",
        border: "border-bd-s700", inputBg: "bg-bg-s900/80", inputText: "text-br-p50",
        inputPlaceholder: "placeholder:text-br-p400", selectBg: "bg-bg-s900/80", selectText: "text-br-p50",
        footerText: "text-br-p200",
    btnPrimary: "cuar", btnSecondary: "sex",
    },

};



// Componente reutilizable de tabla
// Recibe:
// - data: datos que se mostrarán
// - columns: configuración de columnas
export default function DataTable({ data, columns, variant }) {

  // Si la variante pedida no existe (o no se pasó ninguna), se usa "default"
  // para garantizar que SIEMPRE haya un set de colores coherente y legible.
  const v = tableVariants[variant] || tableVariants.default;


  // ================== ESTADO DE PAGINACIÓN ==================
  // pageIndex → página actual
  // pageSize → cantidad de filas por página
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 7
  })


  // ================== ESTADO DEL FILTRO GLOBAL ==================
  // Se usa para el buscador de la tabla
  const [globalFilter, setGlobalFilter] = useState("")


  // ================== CONFIGURACIÓN DE LA TABLA ==================
  const table = useReactTable({


    // Datos que se mostrarán
    data,


    // Definición de columnas
    columns,


    // Estado controlado de la tabla
    state: {
      globalFilter,
      pagination
    },


    // Función que se ejecuta cuando cambia la paginación
    onPaginationChange: setPagination,


    // Función que se ejecuta cuando cambia el filtro global
    onGlobalFilterChange: setGlobalFilter,


    // Modelo base de filas
    getCoreRowModel: getCoreRowModel(),


    // Modelo con filtrado aplicado
    getFilteredRowModel: getFilteredRowModel(),


    // Modelo con paginación aplicada
    getPaginationRowModel: getPaginationRowModel(),
  })


  return (
    /* ================== TARJETA UNIFICADA ==================
       Todo (buscador, tabla y paginación) vive dentro de UN solo panel
       sólido/opaco. Así el texto nunca "flota" directo sobre la foto de
       fondo de la página -> el contraste queda garantizado siempre,
       tal como en una hoja de cálculo impresa. */
    <div className={`rounded-xl border shadow-xl overflow-hidden ${v.panel} ${v.border}`}>


      {/* ================== TOOLBAR ================== */}
      {/* Barra superior con buscador y selector de filas */}


      <div className="flex items-center justify-between gap-4 p-4">


        {/* ================== BUSCADOR ================== */}
        {/* Filtra todas las columnas de la tabla */}
        <input
          type="text"
          placeholder="Buscar..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className={`border rounded px-3 py-2 w-64 ${v.border} ${v.inputBg} ${v.inputText} ${v.inputPlaceholder}`}
        />


        {/* ================== SELECTOR DE FILAS ================== */}
        {/* Permite cambiar cuántas filas se muestran por página */}
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className={`border rounded px-2 py-2 ${v.border} ${v.selectBg} ${v.selectText}`}
        >
          {[5, 7, 10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size} filas
            </option>
          ))}
        </select>


      </div>


      {/* ================== TABLA ================== */}
      <div className="overflow-x-auto">
        <table className="w-full">


          {/* ================== CABECERA ================== */}
          <thead className={v.header}>


            {/* TanStack agrupa cabeceras automáticamente */}
            {table.getHeaderGroups().map(headerGroup => (


              <tr key={headerGroup.id}>


                {headerGroup.headers.map(header => (


                  <th
                    key={header.id}
                    className={`p-3 text-left border-b font-semibold ${v.border}`}
                  >


                    {/* 
                      flexRender permite renderizar:
                      - texto
                      - JSX
                      - funciones
                      definidos en columnDef.header
                    */}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}


                  </th>


                ))}
              </tr>


            ))}
          </thead>


          {/* ================== CUERPO DE LA TABLA ================== */}
          <tbody>


            {/* Filas generadas por TanStack */}
            {table.getRowModel().rows.map((row, rowIndex) => (


              <tr
               className={`transition-colors duration-150 ${v.row} ${v.rowText} ${v.rowBg ?? (rowIndex % 2 === 1 ? v.zebra : "")}`}
              >


                {/* Celdas visibles de cada fila */}
                {row.getVisibleCells().map(cell => (


                  <td key={cell.id} className={`p-3 border-b ${v.border}`}>


                    {/* Render dinámico del contenido de la celda */}
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}


                  </td>


                ))}


              </tr>


            ))}


          </tbody>


        </table>
      </div>


      {/* ================== PIE DE TARJETA ==================
          Footer + "Ir a página" comparten el mismo fondo/borde superior
          para que se sientan parte de la misma tarjeta, no piezas sueltas. */}
      <div className={`border-t p-4 space-y-3 ${v.border}`}>


        {/* ================== FOOTER ================== */}
        <div className="flex items-center justify-between flex-wrap gap-2">


          {/* ================== INFORMACIÓN ================== */}
          {/* Cantidad de registros visibles */}
          <span className={`text-sm ${v.footerText}`}>
            Mostrando {table.getRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} registros
          </span>


          {/* ================== CONTROLES DE PAGINACIÓN ================== */}
          <div className={`flex items-center gap-2 ${v.footerText}`}>


            {/* Ir a la primera página */}
            <Button
              size="sm"
              variant={v.btnSecondary}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              Inicio
            </Button>


            {/* Página anterior */}
            <Button
              size="sm"
              variant={v.btnSecondary}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>


            {/* Información de página actual */}
            <span className="text-sm px-2">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>


            {/* Página siguiente */}
            <Button
              size="sm"
              variant={v.btnPrimary}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>


            {/* Ir a la última página */}
            <Button
              size="sm"
              variant={v.btnPrimary}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Final
            </Button>


          </div>


        </div>


        {/* ================== IR A PÁGINA ================== */}
        {/* Permite navegar directamente a una página específica */}
        <div className={`flex items-center gap-2 text-sm ${v.footerText}`}>


          <span>Ir a página:</span>


          <input
            type="number"


            // Página actual (se muestra +1 porque el índice empieza en 0)
            defaultValue={table.getState().pagination.pageIndex + 1}


            onChange={(e) => {


              // Convierte el número ingresado en índice de página
              const page = e.target.value ? Number(e.target.value) - 1 : 0


              // Cambia la página
              table.setPageIndex(page)
            }}


            className={`border rounded px-2 py-1 w-16 ${v.border} ${v.inputBg} ${v.inputText}`}
          />


        </div>


      </div>


    </div>
  )
}