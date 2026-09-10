# Seguridad

## Alcance

La aplicación corre íntegramente en el navegador y no guarda datos personales:
el historial de simulacros vive en el `localStorage` de cada máquina y nunca
sale de ahí. No hay cuentas, ni sesiones, ni servidor propio.

La única parte con superficie de ataque es el proxy opcional de IA
(`api/ia.js`), que solo existe si alguien lo despliega.

## Si desplegás el proxy de IA

- La clave de la API va **únicamente** en variables de entorno del servidor.
  Cualquier variable con prefijo `VITE_` termina dentro del JavaScript que se
  descarga: nunca pongas una clave ahí.
- La función incluida no tiene autenticación ni límite de frecuencia. Si
  publicás el sitio con la IA activada, cualquiera que lo abra consume tu cuota.
  Para uso público agregá un límite por IP.

## Reportar una vulnerabilidad

Abrí un [aviso de seguridad privado](https://github.com/EdgLuceroC/dactilografia/security/advisories/new)
en GitHub. Si preferís, abrí un issue describiendo el problema sin incluir
detalles que permitan explotarlo.
