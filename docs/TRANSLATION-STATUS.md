# Estado de traducciones

## Idiomas activados

Español, catalán, inglés, italiano, francés, alemán, portugués, chino simplificado, urdu, árabe y finés.

La selección combina idiomas de uso local, mercados turísticos relevantes y comunidades migrantes numerosas; el finés se conserva por petición explícita del proyecto. Urdu y árabe priorizan acceso comunitario; catalán y español son esenciales para la vida administrativa local.

## Cobertura actual

- Auditoría automática: `npm run i18n:audit` comprueba paridad exacta de claves en los 11
  idiomas, que cada `data-i18n*` usado en HTML/JS exista y que ninguna cadena larga se
  quede en español sin justificar (lista blanca solo para cognados y nombres propios).
- Estado 2026-10-11: 333 claves por idioma, 190 usos en la interfaz, 27 coincidencias
  legítimas con el español y 0 errores.

- Navegación principal crítica, acciones, privacidad, urgencia, búsqueda, planes, cultura, radio, agentes y noticias: traducidas en los 11 idiomas.
- Dirección de lectura RTL: activa para árabe y urdu.
- Nombres propios, teléfonos, direcciones y URLs: se conservan sin traducir.
- Interfaz completa: navegación, portada, urgencias, ruta, áreas de vida, directorio,
  planes, dos orillas, cultura, radio, agentes, archivo, comprobaciones previas, salud,
  música, trámites, movilidad, glosario y contrato de IA.
- Descripciones editoriales extensas, fichas del directorio, aviso legal y respuestas
  locales especializadas: versión canónica en español, marcada con la etiqueta `ES`
  cuando el idioma activo no es español.

## Regla de calidad

Una traducción crítica solo debe marcarse como completa tras revisión humana de una persona competente, especialmente en salud, asilo, violencia y derechos. La traducción automática puede servir como borrador, nunca como prueba de exactitud jurídica o sanitaria.

Siguiente ampliación prioritaria: catalán e inglés completos; después urdu, árabe y chino para información de llegada; posteriormente italiano, francés, alemán, portugués y finés.
