package ec.edu.espe.msventas.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotación para validar números telefónicos ecuatorianos.
 * Valida que el teléfono tenga 10 dígitos y comience con un código válido.
 */
@Documented
@Constraint(validatedBy = TelefonoEcuatorianoValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface TelefonoEcuatoriano {
    String message() default "Teléfono ecuatoriano inválido. Debe tener 10 dígitos y comenzar con 09 (celular) o 02-07 (fijo)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
