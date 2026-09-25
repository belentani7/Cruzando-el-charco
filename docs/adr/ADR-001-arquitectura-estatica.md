# ADR-001 — Arquitectura estática sin servidor
Fecha: 2026-09-25 · Estado: aceptado

## Contexto
El público objetivo incluye personas en situación de vulnerabilidad con móviles de gama baja y necesidad de disponibilidad total. Se consideraron: (A) sitio estático en GitHub Pages, (B) SPA con backend/API, (C) CMS headless.

## Decisión
Sitio 100% estático en GitHub Pages (opción A), con contenido en `assets/content.js` y noticias como archivo JSON regenerado por job programado.

## Consecuencias
- Positivas: coste cero, sin servidores que mantener, urgencias disponibles sin JS ni red (tras primera visita), privacidad por diseño, CSP sencilla.
- Negativas (asumidas): sin personalización por usuario; actualizaciones de contenido requieren PR/CI; búsqueda y filtros limitados a lo que permite el cliente.
- Reversible si: aparece un requisito de datos en tiempo real que no pueda resolverse con el job RSS o el worker opcional.
