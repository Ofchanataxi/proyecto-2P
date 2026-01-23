package ec.edu.espe.oauthserver.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador para la página de login personalizada
 * Muestra el formulario de login con el diseño de Farmacia Online
 */
@Controller
public class LoginController {

    /**
     * Muestra la página de login personalizada
     * 
     * @return nombre de la plantilla Thymeleaf (login.html)
     */
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
