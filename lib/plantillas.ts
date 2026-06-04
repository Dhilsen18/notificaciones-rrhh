export const PLANTILLAS_CONTENIDO: Record<string, string> = {
  "Solicitud de Descargo":
    "Solicito descargo por [motivo] ocurrido el [fecha]. Detalle:\n\n[Describa los hechos y adjunte evidencia si corresponde.]",
  Incidencia:
    "Se reporta la siguiente incidencia:\n\n- Fecha del hecho:\n- Área involucrada:\n- Descripción:\n- Impacto:",
  Informe:
    "Informe correspondiente al período [mes/año]:\n\nResumen:\n\nConclusiones:\n\nRecomendaciones:",
  "Emisión de Resolución":
    "Por medio de la presente se comunica que [asunto]. La resolución queda registrada en su expediente.",
};

export const TIPOS_CON_PLANTILLA = Object.keys(PLANTILLAS_CONTENIDO);
