import { Fragment, forwardRef } from "react";

/**
 * La hoja con el texto a copiar.
 *
 * Si hay marcas, cada palabra se pinta según cómo fue copiada; si no, se
 * muestra el texto plano (modo examen, sin ayudas). No se puede seleccionar:
 * copiar y pegar no existe en la sede.
 */
const HojaTexto = forwardRef(function HojaTexto({ tokens, marcas, texto }, ref) {
  return (
    <div className="hoja" ref={ref} aria-label="Texto a copiar">
      {marcas
        ? tokens.map((t, i) => (
            <Fragment key={i}>
              <span className={"pal " + (marcas[i] || "")}>{t}</span>{" "}
            </Fragment>
          ))
        : texto}
    </div>
  );
});

export default HojaTexto;
