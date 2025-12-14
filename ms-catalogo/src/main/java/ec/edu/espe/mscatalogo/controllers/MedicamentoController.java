package ec.edu.espe.mscatalogo.controllers;

import ec.edu.espe.mscatalogo.models.entities.Medicamento;
import ec.edu.espe.mscatalogo.services.MedicamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {

    @Autowired
    private MedicamentoService service;

    @GetMapping
    public List<Medicamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> buscarPorId(@PathVariable Long id) {
        Optional<Medicamento> medicamento = service.buscarPorId(id);
        return medicamento.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Medicamento> crear(@Valid @RequestBody Medicamento medicamento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(medicamento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> editar(@Valid @RequestBody Medicamento medicamento, @PathVariable Long id) {
        Optional<Medicamento> opcional = service.buscarPorId(id);
        if (opcional.isPresent()) {
            Medicamento medDb = opcional.get();
            medDb.setNombre(medicamento.getNombre());
            medDb.setLaboratorio(medicamento.getLaboratorio());
            medDb.setPrecioUnitario(medicamento.getPrecioUnitario());
            medDb.setCodigoBarra(medicamento.getCodigoBarra());
            return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(medDb));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Optional<Medicamento> opcional = service.buscarPorId(id);
        if (opcional.isPresent()) {
            service.eliminar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}