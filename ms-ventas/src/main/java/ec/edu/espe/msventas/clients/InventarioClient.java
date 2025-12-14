package ec.edu.espe.msventas.clients;

import ec.edu.espe.msventas.models.dto.InventarioDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "ms-inventario", url = "${app.clients.inventario.url}")
public interface InventarioClient {
    @GetMapping("/verificar/{sucursalId}/{medicamentoId}")
    InventarioDTO verificarStock(@PathVariable Long sucursalId, @PathVariable Long medicamentoId);

    @PutMapping("/descontar")
    void descontarStock(@RequestBody Object request);
}