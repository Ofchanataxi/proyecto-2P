package ec.edu.espe.msventas.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotación para validar cédulas de identidad ecuatorianas.
 * Valida que la cédula tenga 10 dígitos y que el dígito verificador sea
 * correcto
 * usando el algoritmo módulo 10.
 */
@Documented
@Constraint(validatedBy = CedulaEcuatorianaValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface CedulaEcuatoriana {
    String message() default "Cédula ecuatoriana inválida. Debe tener 10 dígitos y ser válida";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
