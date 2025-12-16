package ec.edu.espe.msinventario.controllers;

import ec.edu.espe.msinventario.models.entities.Sucursal;
import ec.edu.espe.msinventario.services.SucursalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sucursales")
@CrossOrigin(origins = "*")
public class SucursalController {

    @Autowired
    private SucursalService service;

    @GetMapping
    public List<Sucursal> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> buscarPorId(@PathVariable Long id) {
        Optional<Sucursal> sucursal = service.buscarPorId(id);
        return sucursal.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sucursal> crear(@Valid @RequestBody Sucursal sucursal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(sucursal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> editar(@Valid @RequestBody Sucursal sucursal, @PathVariable Long id) {
        Optional<Sucursal> opcional = service.buscarPorId(id);
        if (opcional.isPresent()) {
            Sucursal sucursalDB = opcional.get();
            sucursalDB.setNombre(sucursal.getNombre());
            sucursalDB.setDireccion(sucursal.getDireccion());
            return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(sucursalDB));
        }
        return ResponseEntity.notFound().build();
    }

    // Opcional: Eliminar sucursal (Ten cuidado si ya tiene inventario asignado, podría dar error de FK en BD)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<Sucursal> opcional = service.buscarPorId(id);
        if (opcional.isPresent()) {
            service.eliminar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}