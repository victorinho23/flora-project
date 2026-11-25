#!/usr/bin/env bash
# organizar-proyecto.sh
# Limpia lo que quedó repetido o viejo despues de ordenar el proyecto:
#   - los archivos del frontend que se movieron a su módulo (las copias viejas en features/users)
#   - los archivos sueltos en la raíz que son copia del frontend (index.html, package.json, vite...)
# Antes de borrar algo lo copia a ~/Documents/Backups, así que no se pierde nada.
# Uso (en la carpeta flora-project):  bash organizar-proyecto.sh

set -e
cd "$(dirname "$0")"

RESPALDO="$HOME/Documents/Backups/flora-sobrantes-$(date +%Y-%m-%d_%H%M)"

# copias viejas: cada una ya vive en la carpeta de su módulo
VIEJOS=(
  frontend/src/features/users/components/SupplierDetailModal.jsx
  frontend/src/features/users/pages/MenuListPage.jsx
  frontend/src/features/users/pages/OrderListPage.jsx
  frontend/src/features/users/pages/SuppliersListPage.jsx
  frontend/src/features/users/pages/ViewMenuListPage.jsx
  frontend/src/features/users/pages/ViewOrderListPage.jsx
  frontend/src/features/users/reports/components/ReportConfigModal.jsx
  frontend/src/features/users/reports/config/menuReportFields.js
  frontend/src/features/users/reports/config/orderReportFields.js
  frontend/src/features/users/reports/config/supplierReportFields.js
  frontend/src/features/users/reports/services/generateExcelReport.js
  frontend/src/features/users/reports/services/generatePdfReport.js
  frontend/src/features/users/reports/services/generateReport.js
  frontend/src/features/users/reports/utils/buildReportDataset.js
  frontend/src/features/users/table/ColumnsMenu.jsx
  frontend/src/features/users/table/OrderColumns.jsx
  frontend/src/features/users/table/SuppliersColumns.jsx
)

# sobrantes de la raíz: el frontend ya tiene los suyos
RAIZ=(index.html package.json package-lock.json vite.config.js eslint.config.js public node_modules)

echo "Esto va a quitar:"
for f in "${VIEJOS[@]}" "${RAIZ[@]}"; do [ -e "$f" ] && echo "  - $f"; done
echo
echo "Antes se copia todo a: $RESPALDO"
read -r -p "¿Seguimos? (s/n) " RESP
[ "$RESP" = "s" ] || { echo "No se hizo nada."; exit 0; }

mkdir -p "$RESPALDO"
for f in "${VIEJOS[@]}" "${RAIZ[@]}"; do
  [ -e "$f" ] || continue
  # node_modules no se respalda, se vuelve a instalar con npm install
  if [ "$f" != "node_modules" ]; then
    mkdir -p "$RESPALDO/$(dirname "$f")"
    cp -r "$f" "$RESPALDO/$f"
  fi
  # si git lo conoce lo quita con git, si no, lo borra normal
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    git rm -r -q "$f"
  else
    rm -rf "$f"
  fi
done

# carpetas que quedaron vacías en features/users
find frontend/src/features/users -type d -empty -delete 2>/dev/null || true

echo
echo "Listo. El respaldo quedó en $RESPALDO"
echo "Revisa con 'git status' y cuando estés de acuerdo haces tu commit."
