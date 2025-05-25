# AgreeX Frontend - Next.js

## Descripción

Frontend de AgreeX desarrollado con Next.js 15, TypeScript y Tailwind CSS. La aplicación permite a freelancers y contratantes crear, revisar y firmar contratos inteligentes de manera intuitiva.

## Flujo de la Aplicación

1. **Página de Inicio** (`/`) - Landing page donde los usuarios describen su proyecto
2. **Chatbot** (`/chatbot`) - Conversación con Contrax para recopilar detalles del contrato
3. **Contrato Freelance** (`/contrato-freelance`) - Revisión y edición del contrato generado
4. **Confirmación** (`/confirmacion-documento-firmado`) - Confirmación de firma digital

## Tecnologías Utilizadas

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **React Hooks** - Estado y efectos

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar build de producción
npm start
```

## Estructura del Proyecto

```
agreex-app/
├── app/
│   ├── page.tsx                          # Página de inicio
│   ├── chatbot/
│   │   └── page.tsx                      # Página del chatbot
│   ├── contrato-freelance/
│   │   └── page.tsx                      # Página del contrato
│   ├── confirmacion-documento-firmado/
│   │   └── page.tsx                      # Página de confirmación
│   ├── layout.tsx                        # Layout principal
│   └── globals.css                       # Estilos globales
├── public/                               # Archivos estáticos
├── tailwind.config.ts                    # Configuración de Tailwind
└── package.json                          # Dependencias

```

## Características Principales

- **Diseño Responsivo**: Adaptado para desktop y móvil
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Flujo Intuitivo**: Navegación paso a paso
- **Chat Interactivo**: Simulación de conversación con IA
- **Firma Digital**: Modal con múltiples opciones de firma
- **Estado Persistente**: Datos compartidos entre páginas

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en producción
- `npm run lint` - Ejecuta el linter

## Variables de Entorno

No se requieren variables de entorno para el frontend básico. Para integración con backend, crear un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Despliegue

La aplicación está lista para desplegarse en:
- Vercel (recomendado)
- Netlify
- AWS Amplify
- Cualquier servicio que soporte Next.js

## Contribuir

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para más detalles
