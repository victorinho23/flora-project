import { PermissionsForm } from "../../features/products";

// Layout de la ruta de gestion de permisos
export default function PermissionsLayout() {
    return (
        <div
            className="min-h-screen w-full flex justify-center items-start bg-bg-p500 bg-fixed bg-[radial-gradient(50rem_32rem_at_100%_-5%,color-mix(in_srgb,var(--color-bg-t300)_40%,transparent),transparent_60%),radial-gradient(46rem_30rem_at_-5%_105%,color-mix(in_srgb,var(--color-bg-s300)_50%,transparent),transparent_62%),linear-gradient(160deg,var(--color-bg-p400)_0%,var(--color-bg-p600)_55%,var(--color-bg-s200)_100%)]"
        >
            <PermissionsForm />
        </div>
    );
}