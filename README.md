# EquipoIdeal — Demo web experimental

Prototipo estático para portfolio inspirado en el proyecto académico original en Java: https://github.com/Juano-C/EquipoIdeal

## Ejecutar localmente

Abrí `index.html` en un navegador moderno. La demo no necesita instalar dependencias ni compilar Java.

## Publicar en GitHub Pages

1. Creá un repositorio separado para la demo (por ejemplo, `equipoideal-demo`).
2. Subí `index.html`, `styles.css`, `app.js` y la carpeta `assets/`.
3. En **Settings → Pages**, elegí desplegar desde la rama `main` y la carpeta `/ (root)`.

## Alcance y fidelidad

- Usa los 20 empleados y las 6 incompatibilidades de los JSON del proyecto original.
- La configuración inicial respeta los requerimientos del README: 1 líder, 2 arquitectos, 4 programadores y 5 testers.
- Backtracking busca la combinación válida de mayor desempeño.
- La heurística golosa está adaptada para respetar incompatibilidades; no es una traducción literal de la implementación Java original, que no verifica incompatibilidades durante la selección.
- El conteo de iteraciones y las mediciones de tiempo pertenecen a esta demo web y no son directamente comparables con las métricas de Java.
- La demo es una implementación independiente para navegador; no modifica ni reemplaza el proyecto Java original.

## Próximas mejoras posibles

- Añadir controles para editar incompatibilidades.
- Mostrar el proceso de backtracking paso a paso.
- Incorporar pruebas automáticas de equivalencia con casos del proyecto Java.
- Añadir una vista con los datos y restricciones del problema.

## Validación independiente de algoritmos

La demo incluye un script de comprobación sin dependencias externas. Ejecutalo con Node.js desde esta carpeta:

```bash
node tests/validate-algorithms.cjs
```

El script ejecuta el backtracking real de `app.js` y compara su puntaje con un solucionador de referencia independiente que enumera combinaciones por rol y comprueba las incompatibilidades directamente. También verifica que las soluciones que devuelve la heurística golosa respeten las cantidades requeridas y las incompatibilidades.

Última validación realizada:

- 1.296 configuraciones de cantidades por rol probadas.
- 207.360 combinaciones compatibles examinadas por el solucionador de referencia.
- 0 diferencias entre el puntaje óptimo de referencia y el obtenido por backtracking.
- 648 configuraciones tenían al menos una solución válida; las restantes eran inviables con las incompatibilidades definidas.
- La heurística golosa devolvió equipos válidos siempre que encontró una solución, pero no logró completar 24 configuraciones que sí tenían solución. Esto es una limitación esperable de una heurística y no una garantía de optimalidad.
- En la configuración inicial (1 líder, 2 arquitectos, 4 programadores y 5 testers), backtracking obtuvo 52 puntos y la heurística golosa 48.

Estos resultados validan las cantidades y puntajes para el conjunto de 20 empleados e incompatibilidades incluido en la demo. No son una medición comparativa de rendimiento entre Java y JavaScript.
