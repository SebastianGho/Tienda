// Características por defecto de cada categoría. VERIFICA y ajusta con los datos reales de tus productos.
const D = {
  audifonos: { Conexión: "Bluetooth 5.x", Batería: "Hasta 5 h de uso", Carga: "USB Type-C", Garantía: "30 días" },
  gafas: { Conexión: "Bluetooth", Batería: "Hasta 4 h de uso", Carga: "Magnética / USB", Garantía: "30 días" },
  multiplicador: { Entrada: "110-120 V AC", Tomas: "4 tomas + USB", Potencia: "Hasta 1000 W", Protección: "Sobrecarga", Garantía: "30 días" },
  cargadores: { Entrada: "100-240 V AC", Salida: "5 V / 2.4 A", Potencia: "12 W", Protección: "Sobrecarga y cortocircuito", Garantía: "30 días" },
  cables: { Longitud: "1 m", Voltaje: "5 V", Corriente: "2.4 A", Durabilidad: "Reforzado, alta resistencia", Garantía: "30 días" }
};
const P = (ref, name, cat, price, img, extra = {}) => ({ ref, name, cat, price, img, specs: { ...D[cat], ...extra } });

export const PRODUCTS = [
  P("YW23", "Audífonos YW23", "audifonos", 51900, "YW23"),
  P("S67", "Audífonos S67", "audifonos", 59900, "S67"),
  P("P300", "Audífonos P300", "audifonos", 39900, "P300"),
  P("1521", "Audífonos 1521", "audifonos", 9900, "1521"),
  P("1528", "Audífonos 1528", "audifonos", 14900, "1526"),
  P("1583", "Audífonos 1583", "audifonos", 24900, "1566"),
  P("1523", "Audífonos 1523", "audifonos", 24900, "1521"),
  P("1566", "Audífonos 1566", "audifonos", 24900, "1566"),
  P("GL1", "Gafas Smart GL1", "gafas", null, "GL1"),
  P("P-1601", "Multiplicador P-1601", "multiplicador", 41900, "P-1601"),
  P("P08 MICRO", "Cargador P08 Micro", "cargadores", 19900, "P08-MICRO", { Conector: "Micro USB" }),
  P("P08 TYPE-C", "Cargador P08 Type-C", "cargadores", 19900, "P08-C", { Conector: "USB Type-C" }),
  P("P10 IP", "Cargador P10 IP", "cargadores", 19900, "P10", { Conector: "Lightning (iPhone)" }),
  P("P37 TYPE-C", "Cargador P37 Type-C", "cargadores", 24900, "P37", { Salida: "5 V / 3 A · 9 V / 2 A", Potencia: "20 W", Conector: "USB Type-C" }),
  P("P39", "Cargador P39", "cargadores", 24900, "P39", { Salida: "5 V / 3 A · 9 V / 2 A", Potencia: "20 W" }),
  P("P39 IP", "Cargador P39 IP", "cargadores", 29900, "P39IP", { Salida: "5 V / 3 A · 9 V / 2 A", Potencia: "20 W", Conector: "Lightning (iPhone)" }),
  P("P39 C-C", "Cargador P39 C-C", "cargadores", 29900, "P39 C-C", { Salida: "5 V / 3 A · 9 V / 2 A", Potencia: "20 W", Conector: "Type-C a Type-C" }),
  P("P62", "Cargador P62", "cargadores", 24900, "P62"),
  P("P67 C-C", "Cargador P67 C-C", "cargadores", 44900, "P67", { Salida: "Hasta 20 V / 3.25 A", Potencia: "65 W", Conector: "Type-C a Type-C" }),
  P("S-25", "Cable S-25", "cables", 9800, "S-25"),
  P("S-21", "Cable S-21", "cables", 14900, "S-21"),
  P("S-23", "Cable S-23", "cables", 9900, "S-23"),
  P("S-22", "Cable S-22", "cables", 9800, "S-22"),
  P("S-17", "Cable S-17", "cables", 9900, "S-17"),
  P("S-06", "Cable S-06", "cables", 8900, "S-06"),
  P("S-03", "Cable S-03", "cables", 4900, "S-03")
];
