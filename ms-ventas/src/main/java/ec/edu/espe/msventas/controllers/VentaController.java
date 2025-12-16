package ec.edu.espe.msventas.controllers;

import ec.edu.espe.msventas.models.entities.Venta;
import ec.edu.espe.msventas.services.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService service;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Venta venta) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crearVenta(venta));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}