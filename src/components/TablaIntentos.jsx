/** Detalle de los últimos intentos, del más nuevo al más viejo. */
export default function TablaIntentos({ intentos }) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th scope="col">Fecha</th>
          <th scope="col">Texto</th>
          <th scope="col">Correctas</th>
          <th scope="col">Precisión</th>
          <th scope="col">Velocidad</th>
        </tr>
      </thead>
      <tbody>
        {intentos.map((h, i) => (
          <tr key={h.fecha + "-" + i}>
            <td>
              {new Date(h.fecha).toLocaleString("es-AR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td>{h.texto}</td>
            <td className={h.aprobado ? "ok-t" : "no-t"}>{h.correctas}</td>
            <td>{h.precision}%</td>
            <td>{h.ppm} ppm</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
