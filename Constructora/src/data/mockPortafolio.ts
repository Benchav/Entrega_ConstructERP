// src/data/mockPortafolio.ts

export interface PortafolioItem {
  id: string;
  nombre: string;
  ubicacion: string;
  fechaCompletado: string;
  descripcion: string;
  imageUrl: string;
  modelo3dUrl?: string;
}

export const mockPortafolioData: PortafolioItem[] = [
  {
    id: "p-01",
    nombre: "Torre Central",
    ubicacion: "Managua, Nicaragua",
    fechaCompletado: "2023-10-15",
    descripcion:
      "Un moderno complejo de oficinas de 15 plantas con certificación LEED Gold, integrando sostenibilidad y tecnología de vanguardia.",
    imageUrl:
      "https://assets.easybroker.com/property_images/1872094/28543704/EB-GE2094.png?version=1605828409",
    modelo3dUrl:
      "https://sketchfab.com/models/bd7eed4af1da40548cfc1b56cbc2d217/embed",
  },
  {
    id: "p-02",
    nombre: "Residencial los Alpes",
    ubicacion: "Granada, Nicaragua",
    fechaCompletado: "2024-03-20",
    descripcion:
      "Desarrollo habitacional de 50 viviendas unifamiliares con diseño colonial-moderno, enfocado en la comunidad y áreas verdes.",
    imageUrl:
      "https://wheelockindustries.com/wp-content/uploads/2018/05/Residencial-Monteclara-17.jpg",
    modelo3dUrl: "https://sketchfab.com/models/9e2e120c5ce84f95bfbdef6124c854d0/embed",
  },
  {
    id: "p-03",
    nombre: "Puente Libertad",
    ubicacion: "Rivas, Nicaragua",
    fechaCompletado: "2022-05-01",
    descripcion:
      "Puente atirantado de 300 metros de longitud, vital para la conexión regional y diseñado para resistir alta actividad sísmica.",
    imageUrl:
      "https://acerostorices.com/wp-content/uploads/2023/11/puente-de-vigas-de-acero-en-arco.jpg",
       modelo3dUrl: "https://sketchfab.com/models/9e44eaf7a8cb4e7db1fd52aa1c34c754/embed",
  },
];