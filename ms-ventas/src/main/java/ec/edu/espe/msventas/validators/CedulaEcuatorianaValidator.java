package ec.edu.espe.msventas.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validador para cédulas de identidad ecuatorianas.
 * Implementa el algoritmo módulo 10 para verificar la validez de la cédula.
 */
public class CedulaEcuatorianaValidator implements ConstraintValidator<CedulaEcuatoriana, String> {

    @Override
    public boolean isValid(String cedula, ConstraintValidatorContext context) {
        // Permitir null (usar @NotBlank para requerir el campo)
        if (cedula == null || cedula.trim().isEmpty()) {
            return true;
        }

        // Eliminar espacios en blanco
        cedula = cedula.trim();

        // Verificar que tenga exactamente 10 dígitos
        if (!cedula.matches("^\\d{10}$")) {
            return false;
        }

        // Verificar que los dos primeros dígitos correspondan a una provincia válida
        // (01-24)
        int provincia = Integer.parseInt(cedula.substring(0, 2));
        if (provincia < 1 || provincia > 24) {
            return false;
        }

        // Algoritmo módulo 10 para validar el dígito verificador
        int[] coeficientes = { 2, 1, 2, 1, 2, 1, 2, 1, 2 };
        int suma = 0;

        for (int i = 0; i < 9; i++) {
            int digito = Character.getNumericValue(cedula.charAt(i));
            int producto = digito * coeficientes[i];

            // Si el producto es mayor a 9, se suma sus dígitos (equivalente a restar 9)
            if (producto >= 10) {
                producto -= 9;
            }

            suma += producto;
        }

        // Calcular el dígito verificador
        int digitoVerificador = (10 - (suma % 10)) % 10;
        int ultimoDigito = Character.getNumericValue(cedula.charAt(9));

        return digitoVerificador == ultimoDigito;
    }
}
