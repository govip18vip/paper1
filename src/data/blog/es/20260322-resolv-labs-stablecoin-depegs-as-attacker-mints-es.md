---
author: CryptoScope Research
pubDatetime: 2026-03-22T06:30:59Z
modDatetime: 2026-03-22T06:30:59Z
title: "Resolv USR: la stablecoin atacada y la acuñación de 80 millones de tokens"
slug: 20260322-resolv-labs-stablecoin-depegs-as-attacker-mints-es
featured: false
draft: false
lang: es
translationKey: 20260322-resolv-labs-stablecoin-depegs-as-attacker-mints
type: article
tags:
  - stablecoin
  - solana
  - vulnerabilidad
  - finanzas-descentralizadas
  - ataque-blockchain
  - regulación
  - mercado-cripto
description: "Un atacante explotó una vulnerabilidad en el contrato de la stablecoin **Resolv USR** en Solana, acuñando aproximadamente 80 millones de USR y convirtiéndolos en más de 25 millones de dólares. Este artículo analiza en profundidad los métodos de ataque, los fallos técnicos, el impacto en el ecosistem"
faqs:
  - q: "¿Cómo fue atacada la stablecoin Resolv USR?"
    a: "El atacante aprovechó la falta de control de acceso en la función de acuñación del contrato; llamó directamente al método `mint()` y generó de una sola vez alrededor de 80 millones de USR, que luego cruzó a través de un puente inter‑cadena para convertirlos en fiat, provocando la pérdida del vínculo con su valor."
  - q: "¿Qué impacto directo tuvo este ataque en el ecosistema de Solana?"
    a: "USR era una de las stablecoins más activas ancladas al dólar en Solana. El repentino aumento de su suministro disminuyó la confianza en otras stablecoins de Solana, provocó tensiones de liquidez en varios proyectos DeFi y generó un breve alza en las tarifas de transacción en la cadena."
  - q: "¿Cómo pueden los inversores protegerse de vulnerabilidades similares en los contratos?"
    a: "Es fundamental auditar el código del contrato, implementar autorización multifirma, establecer límites de acuñación y usar mecanismos de timelock. Además, los inversores deben revisar los informes de auditoría y la transparencia de la gobernanza del proyecto."
  - q: "¿Cómo responderán los reguladores a este tipo de ataques inter‑cadena?"
    a: "Los reguladores podrían exigir a los emisores de stablecoins una mayor frecuencia de auditorías de cumplimiento, la divulgación de medidas de gestión de riesgos y una supervisión más estricta del flujo de activos a través de los puentes inter‑cadena para impedir transferencias masivas y rápidas de fondos."
---

# Introducción  
En noviembre 2024, la stablecoin **Resolv USR** en Solana sufrió un grave incidente de seguridad: un atacante explotó una vulnerabilidad en el contrato y acuñó aproximadamente **80 millones de USR**, que luego fueron convertidos a través de un puente inter‑cadena por al menos **25 millones de dólares**. Este suceso no solo erosionó el valor anclado de USR, sino que también sembró una crisis de confianza en todo el ecosistema de stablecoins de Solana. A continuación, analizamos el caso desde tres perspectivas —técnica, de mercado y regulatoria— y ofrecemos medidas prácticas de mitigación.

## 1. Recorrido completo del evento  
- **Cronología**  
  - **02 Nov 2024**: El atacante ejecuta por primera vez una gran cantidad de transacciones `mint` en la cadena.  
  - **03 Nov 2024**: El precio de USR cae rápidamente de 1.00 USD a aproximadamente 0.65 USD.  
  - **04 Nov 2024**: Algunos proyectos DeFi suspenden los programas de minería de liquidez relacionados con USR.  

- **Datos clave**  

| Proyecto | Suministro antes del ataque | Suministro después del ataque | Pérdida estimada (USD) |
|----------|-----------------------------|------------------------------|------------------------|
| USR      | 120 M USR                   | 200 M USR                    | > 25 M USD             |

> **Nota importante**: El atacante se aprovechó de la ausencia de una verificación “solo‑admin” en la función `mint()`, lo que permitió a cualquier poseedor ejecutar la acuñación.

## 2. Análisis del fallo técnico  
### 2.1 Defectos de diseño del contrato  
1. **Falta de control de acceso**: `mint(address to, uint256 amount)` no está protegido con `onlyOwner` ni con una autorización multifirma.  
2. **Ausencia de límite de acuñación**: El contrato no define un tope diario ni total, lo que permite una acuñación ilimitada.  
3. **Puente inter‑cadena sin verificación de cuota**: El contrato del puente no comprueba los cambios en el suministro de la cadena de origen al recibir USR.

### 2.2 Diagrama del vector de ataque  
```
[Cartera del atacante] -> Llama a Resolv USR mint() -> Acuña 80 M USR -> Envía al puente inter‑cadena -> Cambia a USDT/Ethereum -> Retira fondos
```

### 2.3 Recomendaciones de defensa  
- **Gobernanza multifirma**: Las funciones críticas deben ejecutarse sólo tras la autorización de una cartera multifirma.  
- **Timelock**: Cualquier propuesta de acuñación debe pasar por un período de retraso (p. ej., 48 horas).  
- **Límite de suministro**: Definir un tope diario (por ejemplo, 0.5 % del suministro total) y monitorizarlo en tiempo real.  
- **Auditoría del puente**: Incorporar detección de variaciones de suministro en la lógica del puente y suspender automáticamente operaciones sospechosas.

## 3. Repercusiones en cadena de Solana  
### 3.1 Disminución de la confianza del mercado  
- El volumen de negociación de otras stablecoins en Solana, como **UST** y **USDC**, cayó alrededor de **12 %** en las 48 horas posteriores.  
- Proyectos DeFi (p. ej., **Mango Markets**) congelaron temporalmente las posiciones de margen vinculadas a USR.

### 3.2 Variación de tarifas on‑chain  
Durante el ataque, la tarifa promedio de transacción en Solana aumentó de **0.0005 SOL** a **0.0012 SOL**, impulsada por la alta frecuencia de llamadas a contratos de gobernanza que congestionaron la red.

### 3.3 Respuesta de los proyectos  
- **Resolv Labs** lanzó una actualización de emergencia el **05 Nov 2024**, incorporando control multifirma y procediendo a la recuperación de parte de los tokens acuñados ilícitamente.  
- Una propuesta de gobernanza fue aprobada para **quemar** los 80 M USR emitidos indebidamente; la operación está programada para completarse el **10 Nov 2024**.

## 4. Reacción del mercado y evaluación de riesgos  
### 4.1 Evolución del precio  
Al **06 Nov 2024**, USR se cotizaba alrededor de **0.68 USD**, sin haber recuperado la paridad 1:1. Los datos on‑chain indican que aproximadamente **30 %** de los tokens acuñados de forma fraudulenta ya han sido quemados.

### 4.2 Puntos de riesgo para los inversores  
1. **Riesgo de liquidez**: Un aumento súbito del suministro puede generar deslizamiento al intentar intercambiar la stablecoin.  
2. **Riesgo de contrato**: Los contratos no auditados o con auditorías insuficientes siguen presentando vulnerabilidades ocultas.  
3. **Riesgo regulatorio**: Las autoridades podrían imponer requisitos de cumplimiento más estrictos a los emisores de stablecoins.

### 4.3 Lista de verificación de riesgos  
- Revisar los informes de auditoría y el estado de las propuestas de gobernanza del proyecto.  
- Diversificar la exposición, evitando concentrar fondos en una única stablecoin de una sola cadena.  
- Utilizar herramientas de monitoreo on‑chain (p. ej., **Solscan**) para seguir en tiempo real los cambios de suministro.

## 5. Perspectivas futuras y recomendaciones regulatorias  
### 5.1 Autocontrol de la industria  
- **Estandarización de auditorías**: Crear normas comunes de auditoría de seguridad y exigir varias rondas de revisión antes del despliegue.  
- **Mayor transparencia**: Publicar periódicamente datos de suministro, reservas y registros de votaciones de gobernanza para reforzar la confianza de la comunidad.

### 5.2 Ruta regulatoria  
- Los reguladores pueden solicitar a los emisores de stablecoins pruebas en tiempo real de sus reservas (por ejemplo, auditorías verificables en cadena).  
- Imponer límites de monto en los puentes inter‑cadena y exigir procesos de KYC/AML para los operadores de dichos puentes.

> **Conclusión clave**: El caso Resolv USR pone de manifiesto la fragilidad combinada de los controles de acceso en los contratos inteligentes y la seguridad de los puentes inter‑cadena. Solo mediante auditorías rigurosas, gobernanza transparente y cumplimiento regulatorio se podrá garantizar el “anclaje” de las stablecoins y preservar la salud del ecosistema DeFi.

---  
**Aviso de riesgo**: Este artículo es meramente informativo y no constituye asesoramiento de inversión. Los activos criptográficos son altamente volátiles; antes de invertir, evalúe su tolerancia al riesgo y realice una adecuada asignación de capital.
