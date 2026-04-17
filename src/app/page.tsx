import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getListings } from "@/lib/db";

export const metadata: Metadata = {
  title: "Búsqueda de Maquinaria Pesada",
  description:
    "Busca y filtra maquinaria pesada y operadores certificados disponibles en todo Chile. Excavadoras, bulldozers, camiones tolva, cargadores frontales y más.",
  openGraph: {
    title: "Buscar Maquinaria Pesada en Chile | MaqConnect",
    description:
      "Explora cientos de anuncios de maquinaria pesada y operadores certificados. Filtra por región, tipo, precio y disponibilidad.",
  },
};

export default async function Home() {
  const listings = await getListings();
  return <HomeClient listings={listings} />;
}
