# Guía de estudio técnica

Este archivo es para entender las decisiones del proyecto. No sustituye al `README.md`, que está pensado para explicar cómo ejecutar la aplicación.

## Objetivo de la aplicación

La aplicación permite buscar términos en Wikipedia y guardar cada búsqueda en una base de datos local. Se ha hecho con tecnologías básicas: HTML, CSS, JavaScript, PHP y SQLite.

La idea es demostrar una aplicación completa, aunque pequeña:

- Frontend con HTML, CSS y JavaScript.
- Consumo de una API externa.
- Backend PHP propio.
- Persistencia en SQL.
- Validación y seguridad básica.

## Por qué PHP

PHP encaja bien porque el proyecto está pensado para ejecutarse en XAMPP o un entorno similar. También permite crear endpoints sencillos sin añadir frameworks.

En este proyecto PHP se usa para:

- Recibir el término buscado.
- Validar datos.
- Conectar con SQLite.
- Guardar el historial.
- Devolver respuestas JSON al navegador.

JavaScript no debería escribir directamente en la base de datos. El navegador habla con PHP y PHP controla la persistencia.

## Por qué SQLite

SQLite es una base de datos SQL guardada en un archivo. No necesita instalar MySQL, crear usuarios ni levantar un servidor adicional.

Para este caso es buena opción porque:

- El historial de búsquedas es pequeño.
- La instalación es muy simple.
- Es ideal para una prueba técnica o una aplicación local.
- Sigue siendo SQL real.
- Permite usar consultas preparadas.

Si el proyecto creciera, se podría migrar a MySQL o PostgreSQL manteniendo una lógica parecida gracias a PDO.

## Por qué PDO

PDO significa PHP Data Objects. Es una capa de PHP para trabajar con bases de datos usando una interfaz común.

Ventajas de PDO:

- Permite usar SQLite, MySQL o PostgreSQL con una forma de trabajo parecida.
- Soporta consultas preparadas.
- Permite configurar errores como excepciones.
- Puede devolver resultados como arrays asociativos.

En `api/db.php` se configura así:

```php
$pdo = new PDO('sqlite:' . $databasePath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
```

`PDO::ERRMODE_EXCEPTION` hace que los errores se puedan capturar con `try/catch`.

`PDO::FETCH_ASSOC` devuelve resultados como:

```php
[
    'term' => 'energía solar',
    'created_at' => '2026-05-29 12:00:00',
]
```

## Qué es una consulta preparada

Una consulta preparada separa dos cosas:

- La estructura SQL.
- Los valores introducidos por el usuario.

Ejemplo del proyecto:

```php
$statement = $pdo->prepare('INSERT INTO searches (term) VALUES (:term)');
$statement->execute(['term' => $term]);
```

`:term` es un placeholder. El usuario no se mezcla directamente dentro del SQL.

Esto evita SQL injection.

## Qué es SQL injection

SQL injection ocurre cuando un usuario consigue modificar una consulta SQL metiendo texto malicioso.

Ejemplo inseguro:

```php
$sql = "INSERT INTO searches (term) VALUES ('$term')";
```

Si `$term` contiene comillas o SQL malicioso, podría romper la consulta y alterar la base de datos.

Con consulta preparada, PDO trata el término como dato, no como código SQL.

## Por qué validar en PHP aunque ya valide HTML

El input HTML tiene `required` y `minlength`, pero eso solo ayuda en el navegador. Cualquier persona podría llamar al endpoint PHP directamente.

Por eso `save_search.php` valida:

- Que el método sea POST.
- Que el cuerpo sea JSON válido.
- Que el término tenga al menos dos caracteres.
- Que el término no sea demasiado largo.

La validación importante siempre debe estar en backend.

## Por qué devolver JSON

Los endpoints PHP devuelven JSON porque JavaScript lo puede consumir fácilmente con `fetch`.

Ejemplo:

```json
{
  "success": true,
  "items": []
}
```

También se envía la cabecera:

```php
header('Content-Type: application/json; charset=utf-8');
```

El `charset=utf-8` ayuda a mantener correctamente acentos y caracteres como `ñ`.

## Por qué escapar HTML en JavaScript

Los datos externos no deben insertarse en HTML sin controlar.

En este proyecto hay dos fuentes dinámicas:

- Lo que devuelve Wikipedia.
- Lo que viene del historial guardado.

Por eso existe `escapeHtml()`. Sirve para convertir caracteres peligrosos en entidades HTML:

- `<` pasa a `&lt;`
- `>` pasa a `&gt;`
- `"` pasa a `&quot;`

Esto reduce riesgo de XSS cuando usamos `innerHTML`.

## Por qué limpiar el snippet de Wikipedia

Wikipedia devuelve fragmentos con etiquetas HTML para resaltar coincidencias:

```html
<span class="searchmatch">energía</span> solar
```

Aunque venga de una API conocida, es mejor no pintar HTML externo directamente. Por eso `sanitizeSnippet()` elimina etiquetas y luego escapa el texto.

## Por qué usar URLSearchParams

Las búsquedas pueden tener espacios, acentos o símbolos.

`URLSearchParams` construye la URL codificando correctamente valores como:

- `energía solar`
- `niño`
- `diseño web`

Así evitamos concatenar strings manualmente.

## Por qué hay endpoints separados

Hay dos endpoints:

- `api/save_search.php`
- `api/history.php`

Separarlos deja más clara la responsabilidad:

- Uno guarda datos.
- Otro lee datos.

Esto ayuda a mantener y ampliar el proyecto.

## Por qué no se sube la base de datos a GitHub

El archivo SQLite se crea automáticamente en `data/search_history.sqlite`.

Ese archivo contiene datos generados por el uso de la aplicación. Por eso está en `.gitignore`.

En GitHub debe subirse el código, no los datos locales.

## Qué detalles muestran buen criterio

En esta aplicación hay varias decisiones pequeñas pero importantes:

- UTF-8 en HTML y JSON.
- Consultas preparadas.
- Validación en backend.
- Errores internos no expuestos al usuario.
- Separación entre frontend y backend.
- SQLite como solución proporcionada al tamaño del proyecto.
- CSS separado.
- JavaScript separado.
- Historial cargado desde backend, no inventado en frontend.

## Por qué usar SweetAlert al limpiar historial

Limpiar el historial es una acción destructiva. Un `confirm()` nativo funciona, pero SweetAlert ofrece una confirmación más clara y coherente con el diseño visual.

La lógica sigue siendo segura:

- El usuario confirma en frontend.
- JavaScript llama a `api/clear_history.php`.
- PHP borra el historial desde SQLite.
- La interfaz se actualiza después de recibir respuesta correcta.

## Por qué añadir un endpoint de salud

`api/health.php` sirve para comprobar rápidamente que la parte técnica está viva:

- PHP responde.
- PDO puede abrir la base de datos.
- SQLite permite consultar la tabla.

Este tipo de endpoint es común en aplicaciones reales porque ayuda a diagnosticar problemas sin tener que usar toda la interfaz.

## Por qué usar localStorage

`localStorage` permite recordar preferencias del usuario en el navegador.

En este proyecto se guarda:

- La última búsqueda.
- El número de resultados seleccionado.
- Si la búsqueda exacta está activada.

No se guarda información sensible. Solo se mejora la experiencia para que la aplicación recuerde el último contexto de uso.

## Por qué usar fechas amigables

En lugar de mostrar solo una fecha técnica, el historial muestra textos como:

- `Ahora mismo`
- `Hace 3 minutos`
- `Hoy a las 12:30`
- `Ayer a las 18:10`

Esto mejora la lectura rápida y hace que el historial parezca más natural.

## Por qué existe búsqueda exacta

La API de Wikipedia usa un buscador full-text. Si se buscan 50 resultados de `Messi`, puede devolver coincidencias relacionadas por texto, similitud o contexto, incluso resultados menos evidentes como apellidos parecidos.

Eso no significa que la aplicación falle. Es el comportamiento normal del buscador cuando se amplía mucho el límite de resultados.

Para dar más control al usuario se añade un switch de búsqueda exacta. Cuando está activo, JavaScript envía el término entre comillas:

```text
"Messi"
```

Así Wikipedia intenta buscar la frase literal y se reducen resultados colaterales.

Además, el frontend filtra los resultados recibidos y solo muestra aquellos cuyo título o resumen contienen literalmente el término buscado. Esto evita casos como apellidos parecidos cuando el usuario quiere una coincidencia más estricta.

## Dónde están los eventos JavaScript

Los eventos principales están en `assets/js/app.js`:

- `form.addEventListener('submit', ...)`: captura la búsqueda.
- `refreshHistoryButton.addEventListener('click', ...)`: actualiza el historial.
- `clearHistoryButton.addEventListener('click', ...)`: confirma y limpia el historial.
- `historyList.addEventListener('click', ...)`: relanza una búsqueda desde el historial.
- `resultLimit.addEventListener('change', ...)`: guarda el límite elegido.
- `exactSearch.addEventListener('change', ...)`: guarda si está activa la búsqueda exacta.
- `technicalMenuButton.addEventListener('click', ...)`: abre el panel técnico servido desde PHP.

## Por qué el panel técnico carga desde PHP

El menú hamburguesa no contiene texto fijo dentro del HTML principal. Carga su contenido desde `views/technical-panel.php` mediante `fetch`.

Esto diferencia el proyecto porque demuestra dos usos de PHP:

- API interna para datos y SQLite.
- Vista parcial HTML servida desde backend.

No es un MVC completo, porque para esta prueba sería excesivo. Pero sí hay separación de responsabilidades: vista, interacción, endpoints y persistencia.

## Por qué añadir miniaturas

Las miniaturas ayudan a reconocer resultados más rápido. Wikipedia puede devolver una imagen asociada a una página mediante `pageimages`.

En la interfaz se usan de dos formas:

- Miniatura pequeña en cada resultado.
- Imagen destacada del primer resultado en un panel lateral.

Esto aporta contexto visual sin abandonar la simplicidad de la aplicación.

Son detalles que hacen que una aplicación sencilla esté construida con cabeza.
