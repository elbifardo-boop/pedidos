/* ================== CONFIGURACIÓN ================== */
// Este archivo lo usan la página de pedidos (index.html) y el administrador (admin.html).
// Para cambiar precios, productos o zonas, se edita solo este archivo.
const CONFIG = {
  // false = el pedido va directo al WhatsApp del local. true = WhatsApp deja elegir el contacto (pruebas).
  TEST_MODE: false,
  LOCAL_WA: "5491127669778",
  // URL de la aplicación web de Google Apps Script (ver INSTRUCCIONES.md).
  // Si queda vacía, los pedidos se guardan solo en este navegador (sirve para probar).
  API_URL: "https://script.google.com/macros/s/AKfycbzV52x1gaVixvyNIk0LsveRczhN_ujHdo9ydrp6a27gbiRROgwjvnpQN2JBTvMoVw-JhA/exec",
  ALIAS: "BIFARDO.MP",
  SUCURSAL: "Padua",
};

const ZONAS = [
  ["DE 0 A 1KM", 500], ["DE 1 A 2KM", 1000], ["DE 2 A 3KM", 1500],
  ["DE 3 A 4KM", 2000], ["DE 4 A 5 KM", 2500], ["A PARTIR DE 5KM", 4000],
];

const PAGOS = ["Efectivo", "Transferencia Bancaria", "Cuenta DNI", "Mercado Pago", "Tarjeta Credito"];

// Categorías que cuentan como "hamburguesas" para el resumen del turno.
const CATS_BURGER = ["BURGER DEL MES","BURGERS SIMPLES","BURGERS DOBLES","BURGERS TRIPLES QUINTUPLE","BURGERS VEGGIES","HUERFANAS (SIN PAPAS)","COMBO DEL DIA"];

/* ================== ADICIONALES Y OPCIONALES (copiados de pedidosporwhatsapp) ================== */
const ADI = {
  FULL: [["FRANUI",9900],["DIP BARBACOA",1000],["EXTRA CARNE + CHEDDAR",4000],["AROS DE CEBOLLA X 4",1500],["BASTONCITOS DE MUZZA X 3",2300],["EXTRA AJI MOLIDO?",8500],["EXTRA CEBOLLA CRISPY (EN BURGER)",1500],["PEPINOS X 4",900],["CHEDDAR X 1 (BURGER)",1500],["BACON X 2 (BURGER)",2000],["CHEDDAR (PAPAS)",2500],["CHEDDAR Y BACON (PAPAS)",5000],["SALSA Y BACON (PAPAS)",4500],["MEAT BARDO (PAPAS)",5500],["DIP DE SALSA BIFA",1500],["DIP DE SALSA BIFA PICANTE",1500],["DIP DE KETCHUP",1000],["DIP DE MOSTAZA",1000],["DIP DE MAYONESA",1000]],
  VEG: [["FRANUI",9900],["EXTRA CEBOLLA CRISPY (EN BURGER)",1500],["AROS DE CEBOLLA X 4",1500],["BASTONCITOS DE MUZZA X 3",2300],["EXTRA MEDALLÓN",4000],["CHEDDAR X 1 (BURGER - NO VEGANO)",1500],["CHEDDAR (PAPAS - NO VEGANO)",2500],["PEPINOS X 4",900],["DIP DE SALSA BIFA",1500],["DIP DE SALSA BIFA PICANTE",1500],["DIP DE MAYONESA",1000],["DIP DE KETCHUP",1000],["DIP DE MOSTAZA",1000]],
  PAPAS: [["FRANUI",9900],["SALSA Y BACON",4500],["DIP DE SALSA BIFA",1500],["DIP DE SALSA BIFA PICANTE",1500],["DIP DE CHEDDAR EXTRA",2500],["2 DIP DE CHEDDAR EXTRA",5000],["DIP DE MAYONESA",1000],["DIP DE KETCHUP",1000],["DIP DE MOSTAZA",1000]],
  HUERF: [["FRANUI",9900],["EXTRA AJI MOLIDO?",8500],["EXTRA CARNE + CHEDDAR",4000],["BACON X 2 (BURGER)",1500],["CHEDDAR X 1 (BURGER)",1500],["PEPINOS X 4",900]],
};
// Opcionales agrupados por fila; se pueden elegir varios.
const OPC = {
  2:["SIN CEBOLLA"], 3:["SIN PEPINO NI BACON","SIN PEPINO","SIN BACON"], 4:["SIN BACON"],
  5:["SIN PEPINO","SIN CEBOLLA","SIN PEPINO NI CEBOLLA"], 6:["CON CEBOLLA"],
  7:["SIN CEBOLLA","SIN LECHUGA","SIN TOMATE","SIN LECHUGA, TOMATE NI CEBOLLA"], 8:["SIN CHEDDAR"],
  9:["PAPAS SIN SAZON","PAPAS Y BURGER SIN SAL","SIN SALSA"], 12:["SIN SAL"],
  13:["SIN CHEDDAR","SIN SALSA","SIN CHEDDAR NI SALSA"],
  14:["SIN CEBOLLA CRISPY","SIN BACON","SIN SALSA ENRI'S","SIN SAL PAPAS Y BURGER","SIN CHEDDAR"],
  15:["Clássica: LECHUGA + TOMATE + CEBOLLA EN AROS","Americana: BACON + PEPINO + CEBOLLA MORADA"],
};

/* ================== MENÚ (Sucursal Padua) ================== */
// a: lista de adicionales · o: grupos de opcionales · combo: día (0=dom…6=sáb) · old: precio tachado · out: sin stock
const MENU = [
 {cat:"BURGER DEL MES", items:[
  {n:"LA QUE DEBÍAMOS (con fries sazonadas)", p:18300, a:"FULL", o:[14], d:"Doble carne con cheddar, bastones de muzzarella, bacon bits, pepinos agridulces y salsa picante en el mejor pan de papa. Con papas sazonadas que te rompen la boca de sabor."},
  {n:"ANIMAL TROPIC", p:19500, a:"FULL", o:[14], d:"Pan brioche, doble carne con cheddar, ananá grillado, jalapeños encurtidos y bacon. Una combinación que rompe esquemas."},
 ]},
 {cat:"BURGERS SIMPLES", items:[
  {n:"SIMPLE CHEESEBURGER + PAPAS FRITAS", p:16400, a:"FULL", o:[6,8,9], d:"Pan de papa, medallón, cheddar, salsa bifa."},
  {n:"SIMPLE - FRIED ONION + PAPAS FRITAS", p:16400, a:"FULL", o:[8,9], d:"Pan de papa, 1 carne smash, cheddar, cebolla frita estilo Oklahoma, salsa bifa."},
  {n:"SIMPLE - CLÁSSICA + PAPAS FRITAS", p:16400, a:"FULL", o:[7,8,9], d:"Pan de papa, 1 medallón de carne, cheddar, tomate x2, lechuga, cebolla en aros, salsa bifa."},
  {n:"SIMPLE - BIG BARDO + PAPAS FRITAS", p:16400, a:"FULL", o:[5,8,9], d:"Pan de papa, 1 medallón de carne, cheddar, pepinillos x3, lechuga, cebolla en cubos, salsa bifa."},
  {n:"SIMPLE AMERICANA + PAPAS FRITAS", p:16400, a:"FULL", o:[2,3,9], d:"Pan de papa, una carne smash, cheddar, bacon x2, pepinillos x3, cebolla morada, salsa bifa."},
 ]},
 {cat:"BURGERS DOBLES", items:[
  {n:"ENRI´S + FRIES", p:18200, a:"FULL", o:[14], d:"Doble carne + cheddar, deliciosa cebolla crispy, bacon, salsa Enri´s, coronado con el mejor pan de papa."},
  {n:"DOBLE BACON + PAPAS FRITAS", p:18200, a:"FULL", o:[4,8,9], d:"¡Porque la familia bifardera la pedía! Pan de papa, 2 medallones, cheddar, bacon x2, salsa bifa."},
  {n:"DOBLE CHEESEBURGER + PAPAS FRITAS", p:18200, a:"FULL", o:[2,8,9], d:"Pan de papa, 2 medallones, cheddar, cebolla en cubos, salsa bifa."},
  {n:"DOBLE FRIED ONION + PAPAS FRITAS", p:18200, a:"FULL", o:[8,9], d:"Pan de papa, 2 carnes smash, cheddar, cebolla frita estilo Oklahoma, salsa bifa."},
  {n:"DOBLE CLASSICA + PAPAS FRITAS", p:18200, a:"FULL", o:[7,8,9], d:"Pan de papa, 2 medallones, cheddar, tomate x2, lechuga, cebolla en aros, salsa bifa."},
  {n:"DOBLE BIG BARDO + PAPAS FRITAS", p:18200, a:"FULL", o:[5,8,9], d:"Pan de papa, 1 smash, 1 medallón, cheddar, pepinillos x3, lechuga, cebolla en cubos, salsa bifa."},
  {n:"DOBLE AMERICANA + PAPAS FRITAS", p:18200, a:"FULL", o:[2,3,9], d:"Pan de papa, 2 carnes smash, cheddar, bacon x2, pepinillos x3, cebolla morada, salsa bifa."},
 ]},
 {cat:"BURGERS TRIPLES QUINTUPLE", items:[
  {n:"TRIPLE CRUNCHY + PAPAS FRITAS", p:18800, a:"FULL", o:[15,5,9], d:"Pan de papa, 3 smash extra finos, cheddar x3, salsa bifa. Con toppings opcionales."},
  {n:"TRES60 MAX + PAPAS FRITAS", p:19800, a:"FULL", o:[4,8,9], d:"Pan de papa, 3 medallones, cheddar, bacon x4, salsa bifa."},
  {n:"QUÍNTU CRUNCHY + PAPAS FRITAS", p:20800, a:"FULL", o:[8,9], d:"Una obra maestra del smash. Pan de papa, 5 smash extra finos, cheddar x5, salsa bifa."},
 ]},
 {cat:"BURGERS VEGGIES", items:[
  {n:"NOT CLASSICA + PAPAS FRITAS", p:18200, a:"VEG", o:[7,8,9], d:"Pan de papa, medallón vegano NotCo, cheddar, tomate x2, lechuga, cebolla en aros, salsa bifa."},
  {n:"NOT BIG BARDO + PAPAS FRITAS", p:18200, a:"VEG", o:[5,8,9], d:"Pan de papa, medallón vegano NotCo, cheddar, pepinillos x3, lechuga, cebolla en cubos, salsa bifa."},
  {n:"NOT AMERICANA + PAPAS FRITAS", p:18200, a:"VEG", o:[5,8,9], d:"Pan de papa, medallón vegano NotCo, cheddar, pepinillos x3, cebolla morada, salsa bifa."},
 ]},
 {cat:"HUERFANAS (SIN PAPAS)", items:[
  {n:"SIMPLE - CHEESEBURGER - HUÉRFANA (sin papas)", p:14000, a:"HUERF", o:[6,8], d:"Pan de papa, medallón, cheddar, salsa bifa."},
  {n:"SIMPLE - AMERICANA - HUÉRFANA (sin papas)", p:14000, a:"HUERF", o:[2,3,13], d:"Pan de papa, una carne smash, cheddar, bacon x2, pepinillos x3, cebolla morada, salsa bifa."},
  {n:"SIMPLE - FRIED ONION - HUÉRFANA (sin papas)", p:14000, a:"HUERF", o:[8], d:"Pan de papa, 1 carne smash, cheddar, cebolla frita estilo Oklahoma, salsa bifa."},
  {n:"SIMPLE - CLÁSSICA - HUÉRFANA (sin papas)", p:14000, a:"HUERF", o:[7,8], d:"Pan de papa, 1 medallón, cheddar, tomate x2, lechuga, cebolla en aros, salsa bifa."},
  {n:"SIMPLE - BIG BARDO - HUÉRFANA (sin papas)", p:14000, a:"HUERF", o:[5,8], d:"Pan de papa, 1 medallón, cheddar, pepinillos x3, lechuga, cebolla en cubos, salsa bifa."},
  {n:"DOBLE CHEESEBURGER - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[2,8], d:"Pan de papa, 2 medallones, cheddar, cebolla en cubos, salsa bifa."},
  {n:"DOBLE AMERICANA - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[2,3,13], d:"Pan de papa, 2 carnes smash, cheddar, bacon x2, pepinillos x3, cebolla morada, salsa bifa."},
  {n:"DOBLE FRIED ONION - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[8], d:"Pan de papa, 2 carnes smash, cheddar, cebolla frita estilo Oklahoma, salsa bifa."},
  {n:"DOBLE CLÁSSICA - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[7,8], d:"Pan de papa, 2 medallones, cheddar, tomate x2, lechuga, cebolla en aros, salsa bifa."},
  {n:"DOBLE BIG BARDO - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[5,8], d:"Pan de papa, 1 smash, 1 medallón, cheddar, pepinillos x3, lechuga, cebolla en cubos, salsa bifa."},
  {n:"DOBLE BACON - HUÉRFANA (sin papas)", p:15500, a:"HUERF", o:[4,8], d:"Pan de papa, 2 medallones, cheddar, bacon x2, salsa bifa."},
  {n:"TRES60 MAX - HUÉRFANA (sin papas)", p:17500, a:"HUERF", o:[4,8], d:"Pan de papa, 3 medallones, cheddar, bacon x4, salsa bifa."},
  {n:"TRIPLE CRUNCHY - HUÉRFANA (sin papas)", p:16500, a:"HUERF", o:[15,5], d:"Pan de papa, 3 smash extra finos, cheddar x3, salsa bifa."},
  {n:"QUINTU CRUNCHY - HUÉRFANA (sin papas)", p:18500, a:"HUERF", o:[8], d:"Pan de papa, 5 smash extra finos, cheddar x5, salsa bifa."},
 ]},
 {cat:"COMBO DEL DIA", items:[
  {n:"(LUNES) AMERICANA DOBLE + PAPAS FRITAS", p:16000, old:18200, combo:1, d:"No modificable. Pan de papa, 2 carnes smash, cheddar, bacon x2, pepinillos x3, cebolla morada, salsa bifa."},
 ]},
 {cat:"PAPAS FRITAS / PICKERS", items:[
  {n:"PAPAS GRANDES", p:12000, a:"PAPAS", o:[12], d:"Una caja de las más ricas papas fritas."},
  {n:"PAPAS FRITAS CON CHEDDAR", p:14000, a:"PAPAS", o:[12], d:"¡Más de 500 g de papas fritas con cheddar!"},
  {n:"PAPAS FRITAS CON CHEDDAR Y BACON", p:14500, a:"PAPAS", o:[12], d:"¡Más de 500 g de papas fritas con cheddar y bacon!"},
  {n:"PAPAS MEAT BARDO", p:15500, a:"PAPAS", o:[12], d:"Papas con salsa Meat Bardo (suavemente picante), pepperoni deluxe y bacon."},
  {n:"ENTRADITA", p:17000, a:"PAPAS", o:[12], d:"Bastoncitos de muzza (8), aros de cebolla (8), porción de papas fritas y dip de salsa bifa."},
 ]},
 {cat:"BEBIDAS", items:[
  {n:"Pepsi 500ml", p:2500},
 ]},
 {cat:"POSTRES Y BIFA MARKET", items:[
  {n:"FRANUI", p:9900},
  {n:"BRISKET AL VACIO", p:9500, old:11000, d:"Porción de brisket ahumado (250 g), envasado al vacío para regenerar en agua caliente o microondas."},
  {n:"RIBS AL VACIO", p:13500, old:15000, out:true, d:"Porción de ribs de cerdo ahumado (450/500 g) envasado al vacío."},
  {n:"BOLSA PAN DE PAPA x6", p:3500, old:4000, d:"Bolsa de 6 panes de papa del bifa."},
 ]},
];

