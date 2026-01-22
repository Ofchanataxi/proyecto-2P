package ec.edu.espe.msinventario.controllers;

import ec.edu.espe.msinventario.models.dto.StockRequestDTO;
import ec.edu.espe.msinventario.models.entities.Inventario;
import ec.edu.espe.msinventario.services.InventarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {

    @Autowired
    private InventarioService service;

    @GetMapping
    public ResponseEntity<List<Inventario>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/sucursal/{sucursalId}")
    public ResponseEntity<List<Inventario>> listarPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(service.listarPorSucursal(sucursalId));
    }

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

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            Integer nuevaCantidad = body.get("cantidad");
            if (nuevaCantidad == null || nuevaCantidad < 0) {
                return ResponseEntity.badRequest().body("Cantidad inválida");
            }
            Inventario actualizado = service.actualizarStock(id, nuevaCantidad);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/verificar/{sucursalId}/{medicamentoId}")
    public ResponseEntity<Inventario> verificarStock(@PathVariable Long sucursalId, @PathVariable Long medicamentoId) {

        return ResponseEntity.of(service.buscarPorSucursalYMedicamento(sucursalId, medicamentoId));
    }

    @PutMapping("/descontar")
    public ResponseEntity<?> descontar(@RequestBody StockRequestDTO request) {
        try {
            service.descontarStock(request.getSucursalId(), request.getMedicamentoId(), request.getCantidad());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}