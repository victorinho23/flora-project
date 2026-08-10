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
    fourth: { header: "bg-bg-p50 text-text-inverse", row: "hover:bg-bg-p100", border: "border-bd-g300" },
    fifth: { header: "bg-bg-w text-text-inverse", row: "hover:bg-bg-p50", border: "border-bd-g400" },
    sixth: { header: "bg-transparent text-text-inverse", row: "hover:bg-br-p50", border: "border-br-p700" },
    seventh: { header: "bg-br-p200 text-text-inverse", row: "hover:bg-br-p300", border: "border-br-p400" },
    eighth: { header: "bg-bg-w text-text-inverse", row: "hover:bg-br-t50", border: "border-br-t500" },
    ninth: { header: "bg-bg-w/40 backdrop-blur-md text-text-inverse", row: "hover:bg-bg-w/20", border: "border-bd-g200" },
    tenth: { header: "bg-bg-w text-text-inverse shadow-sm", row: "hover:bg-bd-g50", border: "border-bd-g100" },
    eleventh: { header: "bg-br-p300 text-text-inverse", row: "hover:bg-br-p400", border: "border-br-p500" },
    twelfth: { header: "bg-transparent text-text-inverse", row: "hover:bg-bd-g50", border: "border-bd-g300" },
    thirteenth: { header: "bg-bg-w text-text-inverse", row: "hover:bg-br-t50", border: "border-br-t600" },
    fourteenth: { header: "bg-bg-s900 text-text-primary", row: "hover:bg-bg-s700", border: "border-bd-g700" },
    fifteenth: { header: "bg-bg-g950/90 text-text-primary", row: "hover:bg-bg-w/5", border: "border-bd-w/20" },
    sixteenth: { header: "bg-bg-g950 text-text-primary", row: "hover:bg-br-t500/10", border: "border-br-t500" },
    seventeenth: { header: "bg-bg-w/10 backdrop-blur-md text-text-primary", row: "hover:bg-bg-w/10", border: "border-bd-w/20" },
    eighteenth: { header: "bg-bg-g950 text-br-t400", row: "hover:bg-br-t600/10", border: "border-br-t600" },
    nineteenth: { header: "bg-bg-p100 text-text-inverse", row: "hover:bg-bg-p200", border: "border-bd-p300" },
    twentieth: { header: "bg-bg-g900 text-text-primary", row: "hover:bg-bg-g800", border: "border-bd-g700" },
    twentyFirst: { header: "bg-gradient-to-r from-bg-g950 to-bg-s800 text-text-primary", row: "hover:bg-bg-s700/50", border: "border-bd-s600" },
    twentySecond: { header: "bg-bg-g900 text-text-primary", row: "hover:bg-bg-g800", border: "border-transparent" },
    twentyThird: { header: "bg-bg-g950 text-text-primary", row: "hover:bg-br-t500/10", border: "border-br-t500/50" },
};

// Componente reutilizable de tabla
// Recibe:
// - data: datos que se mostrarán
// - columns: configuración de columnas
export default function DataTable({ data, columns, variant }) {

  const v = variant ? tableVariants[variant] : null;


  // ================== ESTADO DE PAGINACIÓN ==================
  // pageIndex → página actual
  // pageSize → cantidad de filas por página
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
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
    <div className="space-y-4 text-gray-100">


      {/* ================== TOOLBAR ================== */}
      {/* Barra superior con buscador y selector de filas */}


      <div className="flex items-center justify-between gap-4 ">


        {/* ================== BUSCADOR ================== */}
        {/* Filtra todas las columnas de la tabla */}
        <input
          type="text"
          placeholder="Buscar..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className={`border rounded px-3 py-2 w-64 text-white ${v ? v.border : ""}`}
        />


        {/* ================== SELECTOR DE FILAS ================== */}
        {/* Permite cambiar cuántas filas se muestran por página */}
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className={`border rounded px-2 py-2 text-black m-4 ${v ? v.border : ""} bg-white/30 backdrop-blur-sm `}
        >
          {[5, 7, 10, 20, 50].map(size => (
            <option key={size} value={size}>
              {size} filas
            </option>
          ))}
        </select>


      </div>


      {/* ================== TABLA ================== */}
      <div className={`overflow-x-auto border rounded bg-white/10 backdrop-blur-md text-gray-300 ${v ? v.border : ""}`}>
        <table className="w-full">


          {/* ================== CABECERA ================== */}
          <thead className={`bg-gray-100 ${v ? v.header : ""}`}>


            {/* TanStack agrupa cabeceras automáticamente */}
            {table.getHeaderGroups().map(headerGroup => (


              <tr key={headerGroup.id}>


                {headerGroup.headers.map(header => (


                  <th
                    key={header.id}
                    className={`p-3 text-left border-b  ${v ? v.border : ""}`}
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
            {table.getRowModel().rows.map(row => (


              <tr key={row.id} className={`hover:bg-gray-50 ${v ? v.row : ""}`}>


                {/* Celdas visibles de cada fila */}
                {row.getVisibleCells().map(cell => (


                  <td key={cell.id} className={`p-3 border-b ${v ? v.border : ""}`}>


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


      {/* ================== FOOTER ================== */}
      <div className="flex items-center justify-between ">


        {/* ================== INFORMACIÓN ================== */}
        {/* Cantidad de registros visibles */}
        <span className="text-sm text-gray-200 ">
          Mostrando {table.getRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} registros
        </span>


        {/* ================== CONTROLES DE PAGINACIÓN ================== */}
        <div className="flex items-center gap-2 text-gray-200">


          {/* Ir a la primera página */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            Inicio
          </Button>


          {/* Página anterior */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>


          {/* Información de página actual */}
          <span className="text-sm px-2 text-gray-200">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>


          {/* Página siguiente */}
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>


          {/* Ir a la última página */}
          <Button
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Final
          </Button>


        </div>


      </div>


      {/* ================== IR A PÁGINA ================== */}
      {/* Permite navegar directamente a una página específica */}
      <div className="flex items-center gap-2 text-sm">


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


          className="border rounded px-2 py-1 w-16"
        />


      </div>


    </div>
  )
}