import { useState, useEffect } from "react";
import {
  showSuccesAlert,
  showErrorAlert,
  showConfirmAlert,
} from "@/shared/services/alertService";
import { ClipboardCheck, Tag, Boxes, ImagePlus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { inventoryProductSchema } from "../schemas/inventorySchema";
import { createInventoryItem, updateInventoryItem, getBrands } from "../services/inventoryService";
import { getUserOptions } from "@/features/users/services/userServices";
import { Button, Input, Select, Textarea, Imageinput, Navbar } from "@/shared";
import fotoFondo from "@/assets/images/fondo-inventory.jpeg";

// Opciones de estado del producto, ligadas al lote
const statusOptions = [
  { id: "Disponible", label: "Disponible" },
  { id: "Vencido", label: "Vencido" },
  { id: "Avería", label: "Avería" },
  { id: "Agotado", label: "Agotado" },
];

// Convierte la fecha DD/MM/AAAA de los datos al formato del input de fecha
const toInputDate = (value = "") => {
  const [day, month, year] = value.split("/");
  return year ? `${year}-${month}-${day}` : value;
};

// Producto vacio para limpiar el formulario
const emptyProduct = {
  id: "",
  brand: "",
  name: "",
  barcode: "",
  custodian: "",
  quantity: "",
  minQuantity: "",
  unitValue: "",
  status: "Disponible",
  expirationDate: "",
  description: "",
  location: "",
  image: [],
};

export default function InventoryRegisterForm() {
  // Navegacion hacia el listado
  const navigate = useNavigate();
  // Si llega un producto por navegacion el formulario funciona en modo edicion
  const editing = useLocation().state?.item;

  // Marcas ya registradas en la base, mas las que el usuario agregue en esta sesion
  const [brands, setBrands] = useState(editing?.brand ? [editing.brand] : []);

  // Cuentadante: se selecciona entre los usuarios activos ya registrados
  const [custodianOptions, setCustodianOptions] = useState([]);

  useEffect(() => {
    getBrands()
      .then((data) => setBrands((prev) => [...new Set([...data.map((brand) => brand.name), ...prev])]))
      .catch(console.error);
    getUserOptions()
      .then((users) => setCustodianOptions(users.filter((u) => u.is_active || String(u.id) === String(editing?.custodian)).map((u) => ({ id: String(u.id), label: u.username }))))
      .catch(console.error);
  }, [editing?.custodian]);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrand, setNewBrand] = useState("");

  // Estado del producto a registrar
  const [productForm, setProductForm] = useState(() =>
    editing
      ? {
          ...emptyProduct,
          ...editing,
          custodian: String(editing.custodian ?? ""),
          quantity: String(editing.quantity ?? ""),
          minQuantity: String(editing.minQuantity ?? ""),
          unitValue: String(editing.unitValue ?? ""),
          expirationDate: toInputDate(editing.expirationDate),
          location: editing.location ?? "",
          image: [],
        }
      : emptyProduct,
  );

  // Lote: siempre 1 para un producto nuevo (se incrementa al reabastecer)
  const batch = editing?.batch ?? 1;

  // Lista de products agregados en esta sesion
  const [products, setProducts] = useState([]);

  // Estado de errores de validacion por nombre de campo
  const [errors, setErrors] = useState({});

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // al corregir un campo se quita su error
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddBrand = () => {
    const brand = newBrand.trim();
    if (!brand) return;

    if (!brands.includes(brand)) {
      setBrands((prev) => [...prev, brand]);
    }
    setProductForm((prev) => ({ ...prev, brand }));
    setNewBrand("");
    setShowNewBrand(false);
    showSuccesAlert({
      title: "Marca agregada",
      text: `La marca ${brand} quedó seleccionada`,
      timer: 2000,
    });
  };

  // Pasos del formulario y los campos que se revisan en cada uno
  const steps = [
    { title: "Identificación", icon: Tag, fields: ["id", "name", "barcode", "brand", "custodian"] },
    { title: "Existencias", icon: Boxes, fields: ["quantity", "minQuantity", "unitValue", "status", "expirationDate"] },
    { title: "Imagen y detalles", icon: ImagePlus, fields: ["description", "location", "image"] },
  ];

  // Paso en el que va el usuario (0, 1 o 2)
  const [step, setStep] = useState(0);
  const isLastStep = step === steps.length - 1;

  // Pasa los errores de Zod a un objeto { campo: mensaje }
  const toFieldErrors = (issues) => {
    const fieldErrors = {};
    issues.forEach((issue) => {
      fieldErrors[issue.path[0]] = issue.message;
    });
    return fieldErrors;
  };

  // Revisa solo los campos del paso actual antes de dejar avanzar
  const validateStep = (index) => {
    const fields = Object.fromEntries(steps[index].fields.map((field) => [field, true]));
    const result = inventoryProductSchema.pick(fields).safeParse(productForm);
    if (result.success) return true;
    setErrors(toFieldErrors(result.error.issues));
    return false;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  // Desde la barra se puede volver a un paso anterior, y avanzar solo si el actual esta bien
  const goToStep = (index) => {
    if (index < step) {
      setErrors({});
      setStep(index);
    } else if (index === step + 1) {
      goNext();
    }
  };

  // Lleva al paso donde esta el primer campo con error
  const goToError = (fieldErrors) => {
    const stepWithError = steps.findIndex((s) => s.fields.some((field) => fieldErrors[field]));
    if (stepWithError !== -1) setStep(stepWithError);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Con Enter en los primeros pasos solo se avanza al siguiente
    if (!isLastStep) {
      goNext();
      return;
    }

    // Validamos todo el producto contra el esquema Zod
    // safeParse no lanza excepcion, retorna un objeto controlado
    const result = inventoryProductSchema.safeParse(productForm);

    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error.issues);
      setErrors(fieldErrors);
      goToError(fieldErrors);
      await showErrorAlert({
        title: "Revisa el formulario",
        text: "Hay campos obligatorios sin completar o con errores",
        confirmButtonText: "Aceptar",
        timer: 3000,
      });
      return;
    }

    // La imagen es obligatoria (el ID y el codigo de barras repetidos los revisa el backend)
    if (!productForm.image.length && !editing?.image) {
      setErrors({ image: "La imagen del producto es obligatoria" });
      await showErrorAlert({
        title: "Revisa el formulario",
        text: "La imagen del producto es obligatoria",
        confirmButtonText: "Aceptar",
        timer: 3500,
      });
      return;
    }

    // Si la validacion paso, limpiamos errores previos
    setErrors({});

    // En edicion pide confirmacion, avisa y vuelve a actualizar inventario
    if (editing) {
      const confirmation = await showConfirmAlert({
        title: `¿Guardar los cambios de ${result.data.name}?`,
        text: "Se actualizará la información del producto en el inventario.",
        confirmButtonText: "Guardar cambios",
      });
      if (!confirmation.isConfirmed) return;
    }

    try {
      if (editing) {
        await updateInventoryItem(editing.id, productForm);
        await showSuccesAlert({
          title: "Inventario actualizado",
          text: "Inventario actualizado exitosamente",
          timer: 2500,
        });
        navigate("/updateInventory");
        return;
      }

      // Cantidad total y valor total los calcula el backend a partir del lote
      await createInventoryItem(productForm);

      setProducts((prev) => [...prev, { ...result.data, batch }]);

      await showSuccesAlert({
        title: "Producto registrado",
        text: "El producto fue añadido al inventario correctamente",
        timer: 2500,
      });

      // Formulario limpio y de vuelta al primer paso para registrar otro
      setProductForm(emptyProduct);
      setStep(0);
    } catch (error) {
      // si el backend dice que campo fallo (ID o codigo repetido) se marca y se lleva a su paso
      if (error.field) {
        setErrors({ [error.field]: error.message });
        goToError({ [error.field]: error.message });
      }
      await showErrorAlert({
        title: "No se pudo guardar",
        text: error.message,
        confirmButtonText: "Aceptar",
        timer: 3500,
      });
    }
  };

  // Valor del lote que se va mostrando mientras se llena
  const batchTotal = (Number(productForm.quantity) || 0) * (Number(productForm.unitValue) || 0);
  const money = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;

  // Textos de cada paso
  const stepTexts = [
    { title: "Identificación", text: "Cómo se reconoce el producto. El ID y el código de barras no se pueden repetir." },
    { title: "Existencias del lote " + batch, text: "Cuántas unidades llegan, cuánto vale cada una y en qué estado." },
    { title: "Imagen y detalles", text: "Una foto clara y una descripción ayudan a reconocerlo en la bodega." },
  ];

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col gap-5 p-4 sm:p-6 bajo:py-4 bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]">
      <Navbar
        variant="foto"
        image={fotoFondo}
        icon={ClipboardCheck}
        title={editing ? "Actualizar inventario" : "Registrar inventario"}
        subtitle={
          editing
            ? `Producto #${editing.id} · el ID y el lote no se pueden modificar`
            : "Completa los 3 pasos para agregar el producto"
        }
        onBack={() => navigate(editing ? "/updateInventory" : "/home")}
        className="rounded-[1.25rem] shadow-[0_22px_48px_-26px_color-mix(in_srgb,var(--color-bg-s950)_70%,transparent)] shrink-0"
        actions={
          <Button variant="crema" size="sm" type="button" onClick={() => navigate("/listInventory")}>
            Ver listado
          </Button>
        }
      />

      <form
        onSubmit={handleAddProduct}
        className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-bd-s100 bg-bg-w shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)]"
      >
        {/* Barra oscura con los pasos y el resumen del producto */}
        <aside className="bg-bg-s950 bg-linear-180 from-bg-s950 to-bg-s800 p-5 xl:p-6 flex flex-col gap-2 text-bg-w">
          <p className="text-xs font-bold uppercase tracking-widest text-br-t200 mb-3">
            {editing ? "Editando producto" : "Nuevo producto"}
          </p>

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => goToStep(index)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  index === step ? "bg-bg-w/10 ring-1 ring-bd-w/20" : "hover:bg-bg-w/5"
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center ${
                    index < step
                      ? "bg-bg-t900"
                      : index === step
                        ? "bg-bg-w text-br-s950"
                        : "ring-1 ring-bd-w/30 text-bg-w/70"
                  }`}
                >
                  {index < step ? <Check size={17} /> : <Icon size={17} />}
                </span>
                <span>
                  <span className={`block font-semibold ${index > step ? "text-bg-w/70" : ""}`}>{item.title}</span>
                  <span className="block text-xs text-br-p100">
                    {index < step ? "Completo" : index === step ? "En curso" : "Pendiente"}
                  </span>
                </span>
              </button>
            );
          })}

          {/* Resumen de lo que se va llenando */}
          <div className="mt-auto rounded-xl bg-bg-w/5 p-4 text-sm flex flex-col gap-1.5">
            <p className="font-semibold break-words">{productForm.name || "Producto sin nombre"}</p>
            <p className="text-br-p100">
              {productForm.id || "Sin ID"} · {productForm.brand || "Sin marca"}
            </p>
            <p className="text-br-p100">
              {productForm.quantity || 0} uds · {money(productForm.unitValue)} c/u
            </p>
            <p className="text-br-p100">
              {productForm.status} · lote {batch}
              {productForm.expirationDate ? ` · vence ${productForm.expirationDate.split("-").reverse().join("/")}` : ""}
            </p>
            <p className="border-t border-bd-w/15 mt-1 pt-2 font-bold text-lg">{money(batchTotal)}</p>
            {products.length > 0 && (
              <p className="text-xs text-br-t200">{products.length} agregados en esta sesión</p>
            )}
          </div>
        </aside>

        {/* Contenido del paso actual */}
        <div className="flex flex-col p-5 sm:p-8 bajo:sm:py-5 min-h-0 overflow-y-auto">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-br-t900">
              Paso {step + 1} de {steps.length}
            </p>
            <h2 className="text-2xl font-bold text-br-s950 mt-1">{stepTexts[step].title}</h2>
            <p className="text-sm text-br-s800 mt-1">{stepTexts[step].text}</p>
          </div>

          <div className="flex-1 min-h-0 mt-6 bajo:mt-4">
            {/* Paso 1: identificacion */}
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 [&_.w-80]:w-full [&_input]:min-w-0 [&_select]:min-w-0">
                <Input
                  label="ID / código único"
                  type="text"
                  name="id"
                  variant="latte"
                  fullWidth
                  value={productForm.id}
                  placeholder="Ej: 113"
                  htmlFor="inventory-id"
                  readOnly={Boolean(editing)}
                  onChange={handleProductChange}
                  error={errors.id}
                />

                <Input
                  label="Código de barras"
                  type="text"
                  name="barcode"
                  variant="latte"
                  fullWidth
                  value={productForm.barcode}
                  placeholder="Ej: 172345678"
                  htmlFor="inventory-codigo-barras"
                  onChange={handleProductChange}
                  error={errors.barcode}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Nombre del producto"
                    type="text"
                    name="name"
                    variant="latte"
                    fullWidth
                    value={productForm.name}
                    placeholder="Ej: Café Arábica 500g"
                    htmlFor="inventory-name"
                    onChange={handleProductChange}
                    error={errors.name}
                  />
                </div>

                {/* Marca: se elige de la lista o se agrega una nueva */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 min-w-0">
                      <Select
                        label="Marca"
                        name="brand"
                        variant="latte"
                        fullWidth
                        value={productForm.brand}
                        htmlFor="inventory-brand"
                        options={brands.map((m) => ({ id: m, label: m }))}
                        onChange={handleProductChange}
                        error={errors.brand}
                      />
                    </div>
                    {!showNewBrand && (
                      <Button variant="crema" size="md" type="button" onClick={() => setShowNewBrand(true)}>
                        + Nueva
                      </Button>
                    )}
                  </div>

                  {showNewBrand && (
                    <div className="flex items-end gap-2">
                      <div className="flex-1 min-w-0">
                        <Input
                          label="Nueva marca"
                          type="text"
                          variant="latte"
                          fullWidth
                          value={newBrand}
                          placeholder="Nombre de la marca"
                          htmlFor="inventory-new-brand"
                          onChange={(e) => setNewBrand(e.target.value)}
                        />
                      </div>
                      <Button variant="caramelo" size="md" type="button" onClick={handleAddBrand}>
                        Agregar
                      </Button>
                    </div>
                  )}
                </div>

                <Select
                  label="Cuentadante"
                  name="custodian"
                  variant="latte"
                  fullWidth
                  value={productForm.custodian}
                  htmlFor="inventory-custodian"
                  options={custodianOptions}
                  onChange={handleProductChange}
                  error={errors.custodian}
                />
              </div>
            )}

            {/* Paso 2: existencias del lote */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4 [&_.w-80]:w-full [&_input]:min-w-0 [&_select]:min-w-0">
                  <Input
                    label={`Cantidad (lote ${batch})`}
                    type="number"
                    name="quantity"
                    variant="latte"
                    fullWidth
                    value={productForm.quantity}
                    placeholder="10"
                    htmlFor="inventory-quantity"
                    onChange={handleProductChange}
                    error={errors.quantity}
                  />

                  <Input
                    label="Cantidad mínima"
                    type="number"
                    name="minQuantity"
                    variant="latte"
                    fullWidth
                    value={productForm.minQuantity}
                    placeholder="Aviso de existencias bajas"
                    htmlFor="inventory-min-quantity"
                    onChange={handleProductChange}
                    error={errors.minQuantity}
                  />

                  <Input
                    label="Valor unitario"
                    type="number"
                    name="unitValue"
                    variant="latte"
                    fullWidth
                    value={productForm.unitValue}
                    placeholder="Ej: 5000"
                    htmlFor="inventory-valor-unitario"
                    onChange={handleProductChange}
                    error={errors.unitValue}
                  />

                  <Select
                    label="Estado"
                    name="status"
                    variant="latte"
                    fullWidth
                    value={productForm.status}
                    htmlFor="inventory-status"
                    options={statusOptions}
                    onChange={handleProductChange}
                    error={errors.status}
                  />

                  <Input
                    label="Fecha de vencimiento"
                    type="date"
                    name="expirationDate"
                    variant="latte"
                    fullWidth
                    value={productForm.expirationDate}
                    htmlFor="inventory-fecha-vencimiento"
                    onChange={handleProductChange}
                    error={errors.expirationDate}
                  />

                  <div className="flex items-center rounded-lg border border-bd-s300 bg-bg-s50 px-4 h-12 self-end text-br-s900 text-sm font-medium">
                    Lote {batch} {editing ? "(no se puede modificar)" : "(nuevo producto)"}
                  </div>
                </div>

                {/* Total del lote que se calcula mientras se escribe */}
                <div className="flex items-center justify-between rounded-xl bg-bg-s950 text-bg-w px-5 py-4">
                  <span className="text-sm font-semibold text-br-p100">
                    Valor del lote {batch} · {productForm.quantity || 0} × {money(productForm.unitValue)}
                  </span>
                  <span className="text-2xl font-bold">{money(batchTotal)}</span>
                </div>

                {/* Barra con las unidades del lote y donde salta el aviso de existencias bajas */}
                <div className="rounded-xl border border-bd-s100 bg-bg-s50 p-5 flex flex-col gap-3">
                  <p className="text-sm font-semibold text-br-s950">Así queda la existencia</p>
                  <div className="relative h-3 rounded-full bg-bg-s100">
                    <div className="h-full rounded-full bg-bg-t900" style={{ width: Number(productForm.quantity) > 0 ? "100%" : "0%" }} />
                    {Number(productForm.quantity) > 0 && Number(productForm.minQuantity) > 0 && (
                      <span
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded bg-red-800"
                        style={{ left: `${Math.min(100, (Number(productForm.minQuantity) / Number(productForm.quantity)) * 100)}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-br-s800">
                    <span>0</span>
                    <span className="text-red-800 font-semibold">
                      {Number(productForm.minQuantity) > 0 ? `Aviso cuando queden ${productForm.minQuantity}` : "Sin aviso de mínimo"}
                    </span>
                    <span>{productForm.quantity || 0} uds</span>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: imagen, descripcion y ubicacion */}
            {step === 2 && (
              <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 min-h-0">
                  <p className="text-sm font-semibold text-br-s900">Imagen del producto</p>
                  <div className="flex-1 min-h-0 flex flex-col [&>div]:w-full! [&>div]:flex-1 [&>div]:flex-col! [&>div]:items-start! [&_.border-dashed]:w-full! [&_.border-dashed]:h-auto! [&_.border-dashed]:flex-1 [&_.border-dashed]:min-h-56">
                    <Imageinput
                      value={productForm.image}
                      onChange={(files) => {
                        setProductForm((prev) => ({ ...prev, image: files }));
                        setErrors((prev) => ({ ...prev, image: undefined }));
                      }}
                      multiple={false}
                      variant="latte"
                      formats={["png", "jpg", "jpeg", "svg"]}
                      maxSizeMB={5}
                    />
                  </div>
                  {editing?.image && !productForm.image.length && (
                    <p className="text-sm text-br-s900">Se conserva la imagen actual si no cargas una nueva.</p>
                  )}
                  {errors.image && (
                    <p className="text-sm inline-block self-start px-2 py-0.5 rounded bg-red-50 text-red-900 font-medium">{errors.image}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4 min-h-0 [&>div:first-child]:flex-1 [&>div:first-child]:flex [&>div:first-child]:flex-col [&_textarea]:flex-1 [&_textarea]:min-h-32">
                  <Textarea
                    label="Descripción"
                    name="description"
                    variant="latte"
                    value={productForm.description}
                    placeholder="Describe el producto"
                    htmlFor="inventory-description"
                    onChange={handleProductChange}
                    error={errors.description}
                  />

                  <Input
                    label="Ubicación (opcional)"
                    type="text"
                    name="location"
                    variant="latte"
                    fullWidth
                    value={productForm.location}
                    placeholder="Ej: Bodega principal"
                    htmlFor="inventory-location"
                    onChange={handleProductChange}
                    error={errors.location}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones para moverse entre pasos, siempre abajo */}
          <div className="flex items-center justify-between gap-4 border-t border-bd-s100 pt-5 mt-6 bajo:mt-4">
            {step > 0 ? (
              <Button variant="crema" size="md" type="button" onClick={goBack}>
                <ChevronLeft size={18} />
                Anterior
              </Button>
            ) : (
              <span />
            )}

            {isLastStep ? (
              <Button variant="caramelo" size="md" type="submit">
                {editing ? "Guardar cambios" : "Añadir producto"}
                <Check size={18} />
              </Button>
            ) : (
              <Button variant="caramelo" size="md" type="submit">
                Siguiente
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}