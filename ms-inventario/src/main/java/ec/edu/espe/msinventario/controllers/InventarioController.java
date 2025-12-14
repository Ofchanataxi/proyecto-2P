package ec.edu.espe.msinventario.controllers;

import ec.edu.espe.msinventario.models.entities.Inventario;
import ec.edu.espe.msinventario.services.InventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {

    @Autowired
    private InventarioService service;

    @PostMapping
    public ResponseEntity<?> agregar(@Valid @RequestBody Inventario inventario) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.asignarStock(inventario));
        } catch (RuntimeException e) {
            // Capturamos si el medicamento no existe (lógica del servicio)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // Capturamos si Feign falla (ej. ms-catalogo caído)
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Error de comunicación con Catálogo: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> buscar(@PathVariable Long id) {
        Optional<Inventario> inv = service.buscarPorId(id);
        return inv.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // En InventarioController.java
    @GetMapping("/verificar/{sucursalId}/{medicamentoId}")
    public ResponseEntity<Inventario> verificarStock(@PathVariable Long sucursalId, @PathVariable Long medicamentoId) {

        return ResponseEntity.of(service.buscarPorSucursalYMedicamento(sucursalId, medicamentoId));
    }
}