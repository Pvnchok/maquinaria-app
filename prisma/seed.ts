import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar
  await prisma.availability.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.machinery.deleteMany()
  await prisma.user.deleteMany()

  // 1. Crear un operador sin maquinaria
  const op1 = await prisma.user.create({
    data: {
      nombre: 'Pedro Rojas',
      email: 'pedro.operador@gmail.com',
      telefono: '+56912345678',
      rol: 'SOLO_OPERADOR',
      claseLicencia: 'Clase D',
      poseeMaquinaria: false,
      regionOperacion: 'Región Metropolitana',
    }
  })

  // 2. Crear una empresa proveedora con maquinaria
  const emp1 = await prisma.user.create({
    data: {
      nombre: 'Maquinarias Sur Ltda',
      email: 'contacto@maqsur.cl',
      telefono: '+56987654321',
      rol: 'PROVEEDOR',
      claseLicencia: null, // Es empresa
      poseeMaquinaria: true,
      regionOperacion: 'Región del Biobío',
      
      maquinarias: {
        create: [
          {
            tipoMaquinaria: 'Retroexcavadora',
            marca: 'Caterpillar',
            modelo: '420F2',
            year: 2019,
            condicion: 'EXCELENTE',
            fotoUrl: 'https://images.unsplash.com/photo-1579848550186-b4dc8bba5e1d?w=800&q=80',
            tonelajeCapacidad: '8.5 ton',
            descripcion: 'Retroexcavadora con mantenciones al día, baliza y alarmas de retroceso funcionales.'
          },
          {
            tipoMaquinaria: 'Grúa Horquilla',
            marca: 'Toyota',
            modelo: '8FD25',
            year: 2021,
            condicion: 'NUEVA',
            fotoUrl: 'https://images.unsplash.com/photo-1606554685006-253c07802ad5?w=800&q=80',
            tonelajeCapacidad: '2.5 ton',
            descripcion: 'Ideal para logística y movimiento de pallets en bodegas.'
          }
        ]
      }
    },
    include: { maquinarias: true }
  })

  // Crear listados (publicaciones)
  
  // Publicación 1: Solo Operador (Pedro Rojas)
  await prisma.listing.create({
    data: {
      maquinariaId: null, // Sin máquina
      tipoServicio: 'SOLO_SERVICIO_OPERADOR',
      regionDisponible: 'Región Metropolitana',
      ciudadDisponible: 'Santiago',
      precioReferencial: 25000, // por día/hora de referencia
      estado: 'ACTIVO'
    }
  })

  // Publicación 2: Retroexcavadora con Operador
  await prisma.listing.create({
    data: {
      maquinariaId: emp1.maquinarias[0].id,
      tipoServicio: 'ARRIENDO_CON_OPERADOR',
      regionDisponible: 'Región del Biobío',
      ciudadDisponible: 'Concepción',
      precioReferencial: 250000, 
      estado: 'ACTIVO'
    }
  })

  // Publicación 3: Grúa solo arriendo
  await prisma.listing.create({
    data: {
      maquinariaId: emp1.maquinarias[1].id,
      tipoServicio: 'SOLO_ARRIENDO_MAQUINA',
      regionDisponible: 'Región del Biobío',
      ciudadDisponible: 'Talcahuano',
      precioReferencial: 40000,
      estado: 'ACTIVO'
    }
  })

  console.log('¡Base de datos seeded con éxito!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
