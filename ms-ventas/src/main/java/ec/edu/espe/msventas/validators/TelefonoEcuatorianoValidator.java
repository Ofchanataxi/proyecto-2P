package ec.edu.espe.msventas.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validador para números telefónicos ecuatorianos.
 * Acepta números celulares (09XXXXXXXX) y fijos (02-07XXXXXXX).
 */
public class TelefonoEcuatorianoValidator implements ConstraintValidator<TelefonoEcuatoriano, String> {

    @Override
    public boolean isValid(String telefono, ConstraintValidatorContext context) {
        // Permitir null (usar @NotBlank para requerir el campo)
        if (telefono == null || telefono.trim().isEmpty()) {
            return true;
        }

        // Eliminar espacios en blanco y guiones
        telefono = telefono.trim().replaceAll("[\\s-]", "");

        // Verificar que tenga exactamente 10 dígitos
        if (!telefono.matches("^\\d{10}$")) {
            return false;
        }

        // Verificar que comience con un código válido
        // 09: Celulares
        // 02-07: Teléfonos fijos (códigos de área de provincias)
        String prefijo = telefono.substring(0, 2);

        return prefijo.equals("09") ||
                prefijo.equals("02") ||
                prefijo.equals("03") ||
                prefijo.equals("04") ||
                prefijo.equals("05") ||
                prefijo.equals("06") ||
                prefijo.equals("07");
    }
}
