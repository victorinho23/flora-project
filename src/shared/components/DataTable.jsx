// Hooks y utilidades principales de TanStack Table
import {
  useReactTable,          // Hook que crea la instancia de la tabla
  getCoreRowModel,        // Modelo base de filas (sin filtros ni paginación)
  flexRender,             // Permite renderizar contenido dinámico de columnas
  getPaginationRowModel,  // Modelo de filas con paginación
  getFilteredRowModel,    // Modelo de filas filtradas
  getSortedRowModel
} from "@tanstack/react-table"


// Hook de React para manejar estado
import { useState } from "react"


// Componentes reutilizables del sistema (boton, buscador, select e input)
import { Button, SearchField, Select, Input } from "@/shared"

const tableVariants = {
    cafe: {
        panel: "bg-bg-s950 border-t-[5px] border-t-bd-t800 rounded-2xl shadow-[0_26px_50px_-24px_color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)] border-t-[5px]! border-t-bd-t800! rounded-2xl!", header: "text-bg-w bg-bg-t900 bg-linear-135 from-bg-t950 to-bg-t800 [&_th_svg]:text-bg-w",
        row: "hover:bg-bg-s800", rowText: "text-bg-w", zebra: "bg-bg-s900",
        border: "border-bg-w/10", inputBorder: "border-bd-p400", inputBg: "bg-bg-s900", inputText: "text-bg-w",
        inputPlaceholder: "placeholder:text-br-p300", selectBg: "bg-bg-s900 [&_option]:bg-bg-s900 [&_option]:text-bg-w", selectText: "text-bg-w",
        footerText: "text-br-p100",
        btnPrimary: "caramelo", btnSecondary: "crema",
        field: "cafe",
    },
    default: {
        panel: "bg-bg-w shadow-sm", header: "bg-bg-g50 text-bg-g950",
        row: "hover:bg-bg-g50", rowText: "text-bg-g900", zebra: "bg-bg-g50/70",
        border: "border-bd-g200", inputBorder: "border-bd-g600", inputBg: "bg-bg-w", inputText: "text-bg-g900",
        inputPlaceholder: "placeholder:text-br-g700", selectBg: "bg-bg-w", selectText: "text-bg-g900",
        footerText: "text-bg-g800",
        btnPrimary: "espresso", btnSecondary: "crema",
        field: "latte",
    },
};



// Componente reutilizable de tabla
// Recibe:
// - data: datos que se mostrarán
// - columns: configuración de columnas
// Filtro de cada columna: soporta rango de fechas, listas (como productos) y valores exactos
const matchesFilter = (row, columnId, value) => {
  const cell = row.getValue(columnId);
  if (value && typeof value === "object") {
    const time = new Date(cell).getTime();
    if (value.from && time < new Date(`${value.from}T00:00:00`).getTime()) return false;
    if (value.to && time > new Date(`${value.to}T23:59:59`).getTime()) return false;
    return true;
  }
  if (Array.isArray(cell)) return cell.map(String).includes(String(value));
  return String(cell) === String(value);
};

export default function DataTable({ data, columns, variant, filters = [], dateFilter, initialSort = [], emptyText = "No hay elementos registrados" }) {

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

  // Filtros por columna que se eligen en los select de arriba
  const [columnFilters, setColumnFilters] = useState([])

  // Orden por defecto que manda cada pagina (alfabetico o por fecha)
  const [sorting, setSorting] = useState(initialSort)

  const filterValue = (id) => columnFilters.find((filter) => filter.id === id)?.value

  // Guarda o quita un filtro y vuelve a la primera pagina
  const setFilter = (id, value) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((filter) => filter.id !== id)
      const empty = value === "" || value === undefined || (typeof value === "object" && !value.from && !value.to)
      return empty ? rest : [...rest, { id, value }]
    })
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Boton de limpiar: quita filtros y busqueda
  const clearFilters = () => {
    setColumnFilters([])
    setGlobalFilter("")
  }

  const hasFilters = columnFilters.length > 0 || globalFilter !== ""

  const dateRange = dateFilter ? filterValue(dateFilter.column) ?? {} : {}


  // ================== CONFIGURACIÓN DE LA TABLA ==================
  const table = useReactTable({


    // Datos que se mostrarán
    data,


    // Definición de columnas
    columns,


    // Estado controlado de la tabla
    state: {
      globalFilter,
      pagination,
      columnFilters,
      sorting
    },

    defaultColumn: {
      filterFn: matchesFilter
    },

    onColumnFiltersChange: setColumnFilters,

    onSortingChange: setSorting,

    // Evita que la tabla vuelva a la pagina 1 cada vez que se edita un dato
    autoResetPageIndex: false,

    getSortedRowModel: getSortedRowModel(),


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
    <div className={`rounded-xl border shadow-xl overflow-hidden ${v.panel} ${v.border}`}>


      {/* ================== TOOLBAR ================== */}
      {/* Barra superior con buscador y selector de filas */}


      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 p-4">


        {/* ================== BUSCADOR ================== */}
        {/* Filtra todas las columnas de la tabla */}
        <SearchField
          value={globalFilter ?? ""}
          onChange={setGlobalFilter}
          placeholder="Buscar..."
          variant={v.field}
          size="field"
          className="w-full sm:w-64"
        />


        {/* ================== SELECTOR DE FILAS ================== */}
        {/* Permite cambiar cuántas filas se muestran por página */}
        <Select
          variant={v.field}
          size="md"
          placeholder={false}
          htmlFor="table-page-size"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          options={[5, 7, 10, 20, 50].map((size) => ({ value: size, label: `${size} filas` }))}
        />


      </div>

      {/* FILTROS POR COLUMNA Y RANGO DE FECHAS */}
      {(filters.length > 0 || dateFilter) && (
        <div className="flex flex-wrap items-end justify-center gap-3 px-4 pb-4">
          {filters.map((filter) => (
            <Select
              key={filter.column}
              variant={v.field}
              size="md"
              placeholder={filter.label}
              htmlFor={`table-filter-${filter.column}`}
              value={filterValue(filter.column) ?? ""}
              onChange={(e) => setFilter(filter.column, e.target.value)}
              options={filter.options}
            />
          ))}

          {/* Rango de fechas: desde y hasta */}
          {dateFilter && (
            <>
              <Input
                type="date"
                label={`${dateFilter.label} desde`}
                htmlFor="table-date-from"
                variant={v.field}
                size="md"
                width="w-full sm:w-44"
                value={dateRange.from ?? ""}
                onChange={(e) => setFilter(dateFilter.column, { ...dateRange, from: e.target.value })}
              />
              <Input
                type="date"
                label="Hasta"
                htmlFor="table-date-to"
                variant={v.field}
                size="md"
                width="w-full sm:w-44"
                value={dateRange.to ?? ""}
                onChange={(e) => setFilter(dateFilter.column, { ...dateRange, to: e.target.value })}
              />
            </>
          )}

          <Button
            size="md"
            variant={v.btnSecondary}
            onClick={clearFilters}
            disabled={!hasFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      )}


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
               key={row.id}
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


            {/* Mensaje cuando no hay registros o los filtros no encuentran nada */}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className={`p-6 text-center font-medium ${v.rowText}`}>
                  {data.length === 0 ? emptyText : "Sin resultados para los filtros aplicados"}
                </td>
              </tr>
            )}

          </tbody>


        </table>
      </div>


      <div className={`border-t p-4 space-y-3 ${v.border}`}>


        {/* ================== FOOTER ================== */}
        <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">


          {/* ================== INFORMACIÓN ================== */}
          {/* Cantidad de registros visibles */}
          <span className={`text-sm ${v.footerText}`}>
            Mostrando {table.getRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} registros
          </span>


          {/* ================== CONTROLES DE PAGINACIÓN ================== */}
          <div className={`flex flex-wrap items-center justify-center gap-2 ${v.footerText}`}>


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
        <div className={`flex items-center justify-center sm:justify-start gap-2 text-sm ${v.footerText}`}>


          <span>Ir a página:</span>


          <Input
            type="number"
            variant={v.field}
            size="sm"
            width="w-20"
            htmlFor="table-go-to-page"
            min={1}
            max={table.getPageCount()}

            // Página actual (se muestra +1 porque el índice empieza en 0)
            defaultValue={table.getState().pagination.pageIndex + 1}

            onChange={(e) => {

              // Convierte el número ingresado en índice de página
              const page = e.target.value ? Number(e.target.value) - 1 : 0

              // Cambia la página
              table.setPageIndex(page)
            }}
          />


        </div>


      </div>


    </div>
  )
}